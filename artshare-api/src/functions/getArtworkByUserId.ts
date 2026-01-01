import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getArtworkByUserId(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const userId = request.params.userId;

        if (!userId) {
            return {
                status: 400,
                jsonBody: { error: "User ID is required" }
            };
        }

        const artworkContainer = database.container("artwork");

        // Query all artwork where artistId matches the user
        const query = {
            query: "SELECT * FROM c WHERE c.artistId = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };

        const { resources } = await artworkContainer.items.query(query).fetchAll();

        // ⭐ Normalize output to match gallery + detail schema
        const results = resources.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description ?? "",

            // ⭐ NEW: Unified file fields
            fileUrl: item.fileUrl || item.imageUrl || "",
            fileType: item.fileType || inferFileType(item),
            fileName: item.fileName || extractFileName(item),

            // Artist info
            artistUsername: item.artistUsername ?? "Unknown Artist",
            artistId: item.artistId ?? null,

            // Dates
            createdAt: item.createdAt || item.uploadedAt || null
        }));

        return {
            status: 200,
            jsonBody: results
        };

    } catch (err: any) {
        context.error("Error fetching artwork by user:", err);
        return {
            status: 500,
            jsonBody: { error: "Failed to fetch user's artwork" }
        };
    }
}

// ⭐ Helper: Infer file type from URL if missing
function inferFileType(item: any): string {
    if (item.fileType) return item.fileType;
    if (!item.fileUrl && !item.imageUrl) return "";

    const url = item.fileUrl || item.imageUrl;
    const ext = url.split(".").pop()?.toLowerCase();

    if (!ext) return "";

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return `image/${ext}`;
    if (["mp4", "mov", "webm"].includes(ext)) return `video/${ext}`;
    if (["mp3", "wav", "ogg"].includes(ext)) return `audio/${ext}`;

    return "application/octet-stream";
}

// ⭐ Helper: Extract filename from URL
function extractFileName(item: any): string {
    const url = item.fileUrl || item.imageUrl;
    if (!url) return "";
    return url.split("/").pop() || "";
}

app.http("getArtworkByUserId", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "getArtworkByUserId/{userId}",
    handler: getArtworkByUserId
});
