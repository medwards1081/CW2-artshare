import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getAllArtwork(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const artworkContainer = database.container("artwork");

        const query = "SELECT * FROM c";
        const { resources } = await artworkContainer.items.query(query).fetchAll();

        // Normalize output
        const results = resources.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            description: item.description,
            imageUrl: item.imageUrl,
            uploadedAt: item.uploadedAt
        }));

        return {
            status: 200,
            jsonBody: results
        };

    } catch (err: any) {
        context.error("Error fetching artwork:", err);
        return {
            status: 500,
            jsonBody: { error: "Failed to fetch artwork" }
        };
    }
}

app.http("getAllArtwork", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getAllArtwork
});
