import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usersContainer } from "../shared/db";
import { verifyPassword } from "../shared/hashing";
import { generateToken } from "../shared/jwt";

export async function login(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { email?: string; password?: string };
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return { status: 400, jsonBody: { error: "Email and password are required" } };
        }

        // ✅ Query user by email
        const query = `SELECT * FROM c WHERE c.email = @email`;
        const { resources } = await usersContainer.items
            .query({ query, parameters: [{ name: "@email", value: email }] })
            .fetchAll();

        if (resources.length === 0) {
            return { status: 401, jsonBody: { error: "Invalid email or password" } };
        }

        const user = resources[0];

        // ✅ Check password
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return { status: 401, jsonBody: { error: "Invalid email or password" } };
        }

        // ✅ Ensure new profile fields exist
        if (!user.username) user.username = user.email.split("@")[0];
        if (!user.profileImageUrl) user.profileImageUrl = "";

        // ✅ Generate JWT with profile fields included
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            profileImageUrl: user.profileImageUrl
        });

        return {
            status: 200,
            jsonBody: {
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    username: user.username,
                    profileImageUrl: user.profileImageUrl,
                    createdAt: user.createdAt
                }
            }
        };

    } catch (err: any) {
        context.error(err);
        return { status: 500, jsonBody: { error: "Internal server error" } };
    }
}

app.http("login", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: login
});
