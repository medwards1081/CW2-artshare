import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

interface DeleteCommentRequest {
  artworkId: string;
  commentId: string;
  userEmail: string;
}

export async function deleteComment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as DeleteCommentRequest;
    const { artworkId, commentId, userEmail } = body;

    if (!artworkId || !commentId || !userEmail) {
      return { status: 400, jsonBody: { error: "Missing required fields" } };
    }

    const artworkContainer = database.container("artwork");
    const usersContainer = database.container("users");

    // Load artwork
    const { resource: artwork } = await artworkContainer.item(artworkId, artworkId).read();
    if (!artwork) {
      return { status: 404, jsonBody: { error: "Artwork not found" } };
    }

    // Load user (to check admin role)
    const { resource: user } = await usersContainer.item(userEmail, userEmail).read();
    if (!user) {
      return { status: 404, jsonBody: { error: "User not found" } };
    }

    const isAdmin = user.role === "admin";

    // Find comment
    const comment = artwork.comments?.find((c: any) => c.id === commentId);
    if (!comment) {
      return { status: 404, jsonBody: { error: "Comment not found" } };
    }

    // ⭐ Permission check: owner OR admin
    const isOwner = comment.userEmail === userEmail;

    if (!isOwner && !isAdmin) {
      return { status: 403, jsonBody: { error: "Not allowed to delete this comment" } };
    }

    // Remove comment
    artwork.comments = artwork.comments.filter((c: any) => c.id !== commentId);

    await artworkContainer.item(artworkId, artworkId).replace(artwork);

    return { status: 200, jsonBody: { success: true } };

  } catch (err: any) {
    context.error("Error deleting comment:", err);
    return { status: 500, jsonBody: { error: "Failed to delete comment" } };
  }
}

app.http("deleteComment", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deleteComment",
  handler: deleteComment
});
