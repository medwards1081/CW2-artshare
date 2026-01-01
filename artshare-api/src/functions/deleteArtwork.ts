import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function deleteArtwork(
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

    // ⭐ Delete using ID as both ID + partition key
    await artworkContainer.item(id, id).delete();

    return {
      status: 200,
      jsonBody: { success: true, message: "Artwork deleted" }
    };

  } catch (err: any) {
    context.error("Failed to delete artwork:", err);
    return {
      status: 500,
      jsonBody: { error: "Failed to delete artwork" }
    };
  }
}

app.http("deleteArtwork", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "deleteArtwork/{id}",
  handler: deleteArtwork
});
