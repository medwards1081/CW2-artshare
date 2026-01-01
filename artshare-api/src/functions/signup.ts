import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usersContainer } from "../shared/db";
import { hashPassword } from "../shared/hashing";
import { generateToken } from "../shared/jwt";
import { User } from "../shared/types";
import { indexUser } from "../../indexUser";

export async function signup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { email?: string; password?: string; username?: string };

        const email = body.email?.toLowerCase();
        const password = body.password;
        const username = body.username;

        if (!email || !password || !username) {
            return { status: 400, jsonBody: { error: "Email, password, and username are required" } };
        }

        // ⭐ Check if user already exists
        const query = `SELECT * FROM c WHERE c.id = @id`;
        const { resources } = await usersContainer.items
            .query({ query, parameters: [{ name: "@id", value: email }] })
            .fetchAll();

        if (resources.length > 0) {
            return { status: 409, jsonBody: { error: "User already exists" } };
        }

        // ⭐ Hash password
        const passwordHash = await hashPassword(password);

        // ⭐ Create user object
        const newUser: User = {
            id: email,
            email,
            username,
            passwordHash,
            role: "user",
            createdAt: new Date().toISOString(),
            followers: [],
            following: [],
            profileImageUrl: ""
        };

        // ⭐ Store in Cosmos DB
        await usersContainer.items.create(newUser);

        // ⭐ NEW: Index user in Azure Search
        try {
            await indexUser(newUser);
        } catch (indexErr) {
            context.error("Search indexing failed for new user:", indexErr);
            // We do NOT fail signup if indexing fails — user still gets created
        }

        // ⭐ Auto-login: generate JWT
        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        return {
            status: 201,
            jsonBody: {
                message: "User created successfully",
                token,
                user: {
                    email: newUser.email,
                    username: newUser.username,
                    role: newUser.role
                }
            }
        };

    } catch (err: any) {
        context.error("Signup error:", err);
        return { status: 500, jsonBody: { error: "Internal server error" } };
    }
}

app.http("signup", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "signup",
    handler: signup
});
