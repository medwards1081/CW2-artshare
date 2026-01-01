import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getComments(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const artworkId = request.params.artworkId;

    if (!artworkId) {
      return { status: 400, jsonBody: { error: "Artwork ID is required" } };
    }

    const container = database.container("artwork");
    const { resource: artwork } = await container.item(artworkId, artworkId).read();

    if (!artwork) {
      return { status: 404, jsonBody: { error: "Artwork not found" } };
    }

    const comments = artwork.comments || [];

    comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { status: 200, jsonBody: comments };

  } catch (err: any) {
    context.error("Error fetching comments:", err);
    return { status: 500, jsonBody: { error: "Failed to fetch comments" } };
  }
}

app.http("getComments", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getComments/{artworkId}",
  handler: getComments
});
