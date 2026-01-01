import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

interface LikeRequestBody {
  artworkId: string;
  userEmail: string;
}

export async function unlikeArtwork(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { artworkId, userEmail } = await request.json() as LikeRequestBody;

    if (!artworkId || !userEmail) {
      return { status: 400, jsonBody: { error: "artworkId and userEmail are required" } };
    }

    const artworks = database.container("artwork");

    // Read artwork
    const { resource: artwork } = await artworks.item(artworkId, artworkId).read<any>();

    if (!artwork) {
      return { status: 404, jsonBody: { error: "Artwork not found" } };
    }

    // Ensure likes array exists
    if (!Array.isArray(artwork.likes)) {
      artwork.likes = [];
    }

    // Remove like if present
    artwork.likes = artwork.likes.filter((email: string) => email !== userEmail);

    // Save updated artwork
    await artworks.items.upsert(artwork);

    return {
      status: 200,
      jsonBody: {
        message: "Artwork unliked",
        likesCount: artwork.likes.length,
        likes: artwork.likes
      }
    };

  } catch (err: any) {
    context.error("unlikeArtwork error:", err);
    return { status: 500, jsonBody: { error: "Internal server error" } };
  }
}

app.http("unlikeArtwork", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "unlikeArtwork",
  handler: unlikeArtwork
});
