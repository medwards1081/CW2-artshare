import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getArtworkById(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const id = request.params.id;

        if (!id) {
            return {
                status: 400,
                jsonBody: { error: "Artwork ID is required" }
            };
        }

        const artworkContainer = database.container("artwork");

        // ✅ Query instead of item().read() to avoid partition key issues
        const query = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };

        const { resources } = await artworkContainer.items.query(query).fetchAll();

        if (!resources || resources.length === 0) {
            return {
                status: 404,
                jsonBody: { error: "Artwork not found" }
            };
        }

        const resource = resources[0];

        const result = {
            id: resource.id,
            title: resource.title,
            artist: resource.artist,
            description: resource.description,
            imageUrl: resource.imageUrl,
            uploadedAt: resource.createdAt   // ✅ FIXED
        };

        return {
            status: 200,
            jsonBody: result
        };

    } catch (err: any) {
        context.error("Error fetching artwork by ID:", err);
        return {
            status: 500,
            jsonBody: { error: "Failed to fetch artwork" }
        };
    }
}

app.http("getArtworkById", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "getArtworkById/{id}",
    handler: getArtworkById
});
