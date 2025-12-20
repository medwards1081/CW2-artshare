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

        const query = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };

        const { resources } = await usersContainer.items.query(query).fetchAll();

        if (resources.length === 0) {
            return { status: 404, jsonBody: { error: "User not found" } };
        }

        const user = resources[0];

        return {
            status: 200,
            jsonBody: {
                id: user.id,
                email: user.email,
                username: user.username || user.email.split("@")[0],
                profileImageUrl: user.profileImageUrl || "",
                role: user.role,
                createdAt: user.createdAt
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
    handler: getProfile
});
