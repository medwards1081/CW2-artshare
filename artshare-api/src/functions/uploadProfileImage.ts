import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import Busboy from "busboy";
import { v4 as uuidv4 } from "uuid";

export async function uploadProfileImage(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Convert Azure headers → plain object for Busboy
        const rawHeaders: any = {};
        request.headers.forEach((value, key) => {
            rawHeaders[key.toLowerCase()] = value;
        });

        const busboy = Busboy({ headers: rawHeaders });

        const fields: any = {};
        let fileBuffer: Buffer | null = null;
        let fileName = "";

        const promise = new Promise<void>((resolve, reject) => {
            busboy.on("file", (fieldname, file, info) => {
                fileName = info.filename;
                const chunks: Buffer[] = [];

                file.on("data", (chunk) => chunks.push(chunk));
                file.on("end", () => {
                    fileBuffer = Buffer.concat(chunks);
                });
            });

            busboy.on("field", (name, value) => {
                fields[name] = value;
            });

            busboy.on("finish", resolve);
            busboy.on("error", reject);
        });

        // ⭐ FIX: Convert ArrayBuffer → Buffer
        const bodyBuffer = Buffer.from(await request.arrayBuffer());
        busboy.end(bodyBuffer);

        await promise;

        if (!fileBuffer || !fields.email) {
            return { status: 400, jsonBody: { error: "Missing file or email" } };
        }

        // Upload to Blob Storage
        const blobService = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const container = blobService.getContainerClient("profile-images");
        await container.createIfNotExists({ access: "blob" });

        const extension = fileName.split(".").pop();
        const blobName = `${fields.email}-${uuidv4()}.${extension}`;
        const blockBlob = container.getBlockBlobClient(blobName);

        await blockBlob.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: "image/jpeg" }
        });

        return {
            status: 200,
            jsonBody: { url: blockBlob.url }
        };

    } catch (err: any) {
        context.error(err);
        return {
            status: 500,
            jsonBody: { error: "Upload failed", details: err.message }
        };
    }
}

app.http("uploadProfileImage", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: uploadProfileImage
});
