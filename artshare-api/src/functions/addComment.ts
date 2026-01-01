import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";
import { v4 as uuidv4 } from "uuid";

interface AddCommentRequest {
  artworkId: string;
  userEmail: string;
  username?: string;
  text: string;
  profileImageUrl?: string; // ⭐ NEW FIELD
}

export async function addComment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as AddCommentRequest;
    const { artworkId, userEmail, username, text, profileImageUrl } = body;

    if (!artworkId || !userEmail || !text) {
      return { status: 400, jsonBody: { error: "Missing required fields" } };
    }

    const container = database.container("artwork");

    const { resource: artwork } = await container.item(artworkId, artworkId).read();

    if (!artwork) {
      return { status: 404, jsonBody: { error: "Artwork not found" } };
    }

    const newComment = {
      id: uuidv4(),
      userEmail,
      username: username ?? "Unknown User",
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileImageUrl: profileImageUrl ?? null // ⭐ STORE PROFILE IMAGE
    };

    artwork.comments = artwork.comments || [];
    artwork.comments.push(newComment);

    await container.item(artworkId, artworkId).replace(artwork);

    return { status: 200, jsonBody: newComment };

  } catch (err: any) {
    context.error("Error adding comment:", err);
    return { status: 500, jsonBody: { error: "Failed to add comment" } };
  }
}

app.http("addComment", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "addComment",
  handler: addComment
});
