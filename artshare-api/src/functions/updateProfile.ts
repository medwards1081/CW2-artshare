import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usersContainer } from "../shared/db";
import { verifyToken } from "../shared/jwt";

export async function updateProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return { status: 401, jsonBody: { error: "Missing Authorization header" } };
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !decoded.email) {
      return { status: 401, jsonBody: { error: "Invalid token" } };
    }

    const email = decoded.email;

    const body = await request.json() as {
      username?: string;
      profileImageUrl?: string;
    };

    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };

    const { resources } = await usersContainer.items.query(query).fetchAll();

    if (resources.length === 0) {
      return { status: 404, jsonBody: { error: "User not found" } };
    }

    const user: any = resources[0];

    // ✅ Update fields safely
    if (body.username !== undefined) {
      user.username = body.username;
    }
    if (body.profileImageUrl !== undefined) {
      user.profileImageUrl = body.profileImageUrl;
    }

    const { resource } = await usersContainer.item(user.id, user.id).replace(user);

    return {
      status: 200,
      jsonBody: {
        message: "Profile updated",
        user: {
          id: resource.id,
          email: resource.email,
          username: resource.username,
          profileImageUrl: resource.profileImageUrl,
          role: resource.role,
          createdAt: resource.createdAt
        }
      }
    };

  } catch (err: any) {
    context.error(err);
    return { status: 500, jsonBody: { error: "Internal server error" } };
  }
}

app.http("updateProfile", {
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: updateProfile
});
