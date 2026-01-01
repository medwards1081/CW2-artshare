import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getPublicProfile(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.params.userId; // email or ID

    if (!userId) {
      return {
        status: 400,
        jsonBody: { error: "User ID is required" }
      };
    }

    const users = database.container("users");
    const artworkContainer = database.container("artwork");

    // Read user by ID + partition key
    const { resource: user } = await users.item(userId, userId).read<any>();

    if (!user) {
      return {
        status: 404,
        jsonBody: { error: "User not found" }
      };
    }

    // Ensure arrays exist
    const followers = Array.isArray(user.followers) ? user.followers : [];
    const following = Array.isArray(user.following) ? user.following : [];

    // ⭐ Fetch all artworks by this user
    const artworkQuery = {
      query: "SELECT * FROM c WHERE c.artistId = @userId",
      parameters: [{ name: "@userId", value: userId }]
    };

    const { resources: artworksRaw } = await artworkContainer.items
      .query(artworkQuery)
      .fetchAll();

    // ⭐ Normalize artwork fields
    const artworks = artworksRaw.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description ?? "",

      fileUrl: item.fileUrl || item.imageUrl || "",
      fileType: item.fileType || inferFileType(item),
      fileName: item.fileName || extractFileName(item),

      artistUsername: item.artistUsername ?? user.username ?? "Unknown Artist",
      artistId: item.artistId ?? userId,

      createdAt: item.createdAt || item.uploadedAt || null
    }));

    return {
      status: 200,
      jsonBody: {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl ?? null,
        createdAt: user.createdAt,

        followers,
        following,
        followersCount: followers.length,
        followingCount: following.length,

        // ⭐ Include artworks
        artworks
      }
    };

  } catch (err: any) {
    context.error("Error fetching public profile:", err);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch public profile" }
    };
  }
}

// ⭐ Infer file type from URL if missing
function inferFileType(item: any): string {
  if (item.fileType) return item.fileType;
  const url = item.fileUrl || item.imageUrl;
  if (!url) return "";

  const ext = url.split(".").pop()?.toLowerCase();
  if (!ext) return "";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return `image/${ext}`;
  if (["mp4", "mov", "webm"].includes(ext)) return `video/${ext}`;
  if (["mp3", "wav", "ogg"].includes(ext)) return `audio/${ext}`;

  return "application/octet-stream";
}

// ⭐ Extract filename from URL
function extractFileName(item: any): string {
  const url = item.fileUrl || item.imageUrl;
  if (!url) return "";
  return url.split("/").pop() || "";
}

app.http("getPublicProfile", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getPublicProfile/{userId}",
  handler: getPublicProfile
});
