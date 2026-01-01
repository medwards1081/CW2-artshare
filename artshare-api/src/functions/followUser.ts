import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function followUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as {
      followerId?: string;
      followingId?: string;
    };

    const followerId = body.followerId;
    const followingId = body.followingId;

    if (!followerId || !followingId) {
      return {
        status: 400,
        jsonBody: { error: "followerId and followingId are required" }
      };
    }

    if (followerId === followingId) {
      return {
        status: 400,
        jsonBody: { error: "You cannot follow yourself" }
      };
    }

    const users = database.container("users");

    // Read both users
    const [followerRes, followingRes] = await Promise.all([
      users.item(followerId, followerId).read<any>(),
      users.item(followingId, followingId).read<any>()
    ]);

    const follower = followerRes.resource;
    const following = followingRes.resource;

    if (!follower || !following) {
      return {
        status: 404,
        jsonBody: { error: "User not found" }
      };
    }

    // Ensure arrays exist
    follower.following = Array.isArray(follower.following) ? follower.following : [];
    following.followers = Array.isArray(following.followers) ? following.followers : [];

    // Prevent duplicates
    if (!follower.following.includes(followingId)) {
      follower.following.push(followingId);
    }

    if (!following.followers.includes(followerId)) {
      following.followers.push(followerId);
    }

    // ⭐ Save both using replace() to guarantee correct partition writes
    await Promise.all([
      users.item(followerId, followerId).replace(follower),
      users.item(followingId, followingId).replace(following)
    ]);

    return {
      status: 200,
      jsonBody: {
        message: "Followed successfully",
        followerFollowingCount: follower.following.length,
        followingFollowersCount: following.followers.length
      }
    };

  } catch (err: any) {
    context.error("Error in followUser:", err);
    return {
      status: 500,
      jsonBody: { error: "Failed to follow user" }
    };
  }
}

app.http("followUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "followUser",
  handler: followUser
});

