import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getAllArtwork(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const artworkContainer = database.container("artwork");

    const query = "SELECT * FROM c";
    const { resources } = await artworkContainer.items.query(query).fetchAll();

    // ⭐ Return the correct fields for the frontend
    const results = resources.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,

      // ⭐ NEW multimedia fields
      fileUrl: item.fileUrl ?? "",
      fileType: item.fileType ?? "",
      fileName: item.fileName ?? "",

      artistUsername: item.artistUsername ?? "Unknown Artist",
      artistId: item.artistId ?? null,

      createdAt: item.createdAt
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
