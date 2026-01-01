import axios from "axios";
import { CosmosClient } from "@azure/cosmos";
import * as dotenv from "dotenv";

dotenv.config();

// -----------------------------
// ENVIRONMENT VARIABLES
// -----------------------------
const cosmos = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
const db = cosmos.database(process.env.COSMOS_DB_DATABASE!);

const usersContainer = db.container("users");
const artworksContainer = db.container("artwork");

const searchServiceName = process.env.SEARCH_SERVICE_NAME!;
const searchApiKey = process.env.SEARCH_API_KEY!;

// -----------------------------
// HELPER: ENCODE KEYS FOR AZURE SEARCH
// -----------------------------
function encodeKey(str: string) {
  return Buffer.from(str).toString("base64url");
}

// -----------------------------
// INDEX USERS
// -----------------------------
async function indexUsers() {
  console.log("Indexing users...");

  const { resources: users } = await usersContainer.items.readAll().fetchAll();

  if (!users.length) {
    console.log("No users found.");
    return;
  }

  const url = `https://${searchServiceName}.search.windows.net/indexes/users/docs/index?api-version=2023-11-01`;

  const payload = {
    value: users.map(u => ({
      "@search.action": "upload",
      id: encodeKey(u.id), // FIXED: Azure-safe key
      email: u.email || "",
      username: u.username || "",
      bio: u.bio || "",
      profileImageUrl: u.profileImageUrl || "",
      tags: u.tags || [],
      createdAt: u.createdAt
        ? new Date(u.createdAt).toISOString()
        : new Date().toISOString()
    }))
  };

  await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": searchApiKey
    }
  });

  console.log(`Indexed ${users.length} users.`);
}

// -----------------------------
// INDEX ARTWORKS
// -----------------------------
async function indexArtworks() {
  console.log("Indexing artworks...");

  const { resources: artworks } = await artworksContainer.items.readAll().fetchAll();

  if (!artworks.length) {
    console.log("No artworks found.");
    return;
  }

  const url = `https://${searchServiceName}.search.windows.net/indexes/artworks/docs/index?api-version=2023-11-01`;

  const payload = {
    value: artworks.map(a => ({
      "@search.action": "upload",
      id: encodeKey(a.id), // FIXED: Azure-safe key
      title: a.title || "",
      description: a.description || "",
      artistId: a.artistId || "",
      artistUsername: a.artistUsername || "",
      fileType: a.fileType || "",
      tags: a.tags || [],
      createdAt: a.createdAt
        ? new Date(a.createdAt).toISOString()
        : new Date().toISOString(),
      fileUrl: a.fileUrl || "",
      fileName: a.fileName || ""
    }))
  };

  await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": searchApiKey
    }
  });

  console.log(`Indexed ${artworks.length} artworks.`);
}

// -----------------------------
// RUN BOTH
// -----------------------------
async function run() {
  console.log("Starting batch indexing...");
  await indexUsers();
  await indexArtworks();
  console.log("Batch indexing complete.");
}

run().catch(err => {
  if (err.response?.data) {
    console.error("Azure Search Error:", JSON.stringify(err.response.data, null, 2));
  } else {
    console.error(err);
  }
});
