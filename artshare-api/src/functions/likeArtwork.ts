import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

interface LikeRequestBody {
  artworkId: string;
  userEmail: string;
}

export async function likeArtwork(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { artworkId, userEmail } = await request.json() as LikeRequestBody;

    if (!artworkId || !userEmail) {
      return { status: 400, jsonBody: { error: "artworkId and userEmail are required" } };
    }

    const artworks = database.container("artwork");

    const { resource: artwork } = await artworks.item(artworkId, artworkId).read<any>();

    if (!artwork) {
      return { status: 404, jsonBody: { error: "Artwork not found" } };
    }

    if (!Array.isArray(artwork.likes)) {
      artwork.likes = [];
    }

    if (!artwork.likes.includes(userEmail)) {
      artwork.likes.push(userEmail);
    }

    await artworks.items.upsert(artwork);

    return {
      status: 200,
      jsonBody: {
        message: "Artwork liked",
        likesCount: artwork.likes.length,
        likes: artwork.likes
      }
    };

  } catch (err: any) {
    context.error("likeArtwork error:", err);
    return { status: 500, jsonBody: { error: "Internal server error" } };
  }
}

app.http("likeArtwork", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "likeArtwork",
  handler: likeArtwork
});
