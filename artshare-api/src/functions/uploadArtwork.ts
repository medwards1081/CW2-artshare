import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} from "@azure/storage-blob";

import { indexArtwork } from "../../indexArtwork";

// Expected request body
interface UploadArtworkRequest {
  title: string;
  description: string;
  fileBase64: string;
  fileType: string | null;
  fileName: string | null;

  // Optional artist metadata
  artistId?: string;
  artistUsername?: string;
}

const cosmosConnectionString = process.env.COSMOS_CONNECTION_STRING!;
const blobConnectionString = process.env.BLOB_CONNECTION_STRING!;
const containerName = process.env.BLOB_CONTAINER!;
const sasExpiryHours = parseInt(process.env.SAS_EXPIRY_HOURS || "24", 10);

// Cosmos setup
const cosmosClient = new CosmosClient(cosmosConnectionString);
const database = cosmosClient.database("artshare");
const artworkContainer = database.container("artwork");

// Blob setup
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Extract account + key for SAS generation
const match = blobConnectionString.match(/AccountName=(.*?);AccountKey=(.*?);/);
const accountName = match?.[1];
const accountKey = match?.[2];

if (!accountName || !accountKey) {
  throw new Error("Could not extract AccountName or AccountKey from BLOB_CONNECTION_STRING");
}

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

export async function uploadArtwork(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as UploadArtworkRequest;
    const { title, description, fileBase64, fileType, fileName, artistId, artistUsername } = body;

    if (!title || !description || !fileBase64 || !fileType || !fileName) {
      return {
        status: 400,
        jsonBody: { error: "Missing required fields." }
      };
    }

    // Extract base64 data
    const base64Data = fileBase64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate blob name with correct extension
    const id = uuidv4();
    const extension = fileName.includes(".") ? fileName.split(".").pop() : "bin";
    const blobName = `${id}.${extension}`;

    // Upload to Blob Storage
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: fileType }
    });

    // Generate SAS URL
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + sasExpiryHours);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn
      },
      sharedKeyCredential
    ).toString();

    const sasUrl = `${blockBlobClient.url}?${sasToken}`;

    // Save metadata to Cosmos DB
    const artworkItem = {
      id,
      title,
      description,
      fileUrl: sasUrl,
      fileType,
      fileName,
      createdAt: new Date().toISOString(),

      artistId: artistId ?? null,
      artistUsername: artistUsername ?? "anonymous user",

      likes: [],
      comments: []
    };

    await artworkContainer.items.create(artworkItem);

    // ⭐ NEW: Index artwork in Azure Search
    try {
      await indexArtwork(artworkItem);
    } catch (indexErr) {
      context.error("Search indexing failed for new artwork:", indexErr);
      // Do NOT fail the upload — artwork still gets created
    }

    return {
      status: 200,
      jsonBody: artworkItem
    };

  } catch (err: any) {
    context.error("Upload failed:", err);
    return {
      status: 500,
      jsonBody: { error: "Upload failed", details: err.message }
    };
  }
}

app.http("uploadArtwork", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: uploadArtwork
});
