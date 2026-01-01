import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usersContainer } from "../shared/db";
import { verifyToken } from "../shared/jwt";

export async function getProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

        // Query user by email
        const query = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };

        const { resources } = await usersContainer.items.query(query).fetchAll();

        if (resources.length === 0) {
            return { status: 404, jsonBody: { error: "User not found" } };
        }

        const user = resources[0];

        // ⭐ IMPORTANT:
        // We no longer store profile images in the backend.
        // Always return null so Angular uses localStorage instead.
        const safeProfileImage = user.profileImageUrl && typeof user.profileImageUrl === "string"
            ? user.profileImageUrl
            : null;

        return {
            status: 200,
            jsonBody: {
                id: user.id,
                email: user.email,
                username: user.username || user.email.split("@")[0],
                profileImageUrl: safeProfileImage,   // ⭐ Always safe
                role: user.role,
                createdAt: user.createdAt,

                followers: user.followers || [],
                following: user.following || [],

                followersCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0
            }
        };

    } catch (err: any) {
        context.error(err);
        return { status: 500, jsonBody: { error: "Internal server error" } };
    }
}

app.http("getProfile", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "getProfile",
    handler: getProfile
});
