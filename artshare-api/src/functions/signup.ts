import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usersContainer } from "../shared/db";
import { hashPassword } from "../shared/hashing";
import { generateToken } from "../shared/jwt";
import { User } from "../shared/types";
import { v4 as uuid } from "uuid";

export async function signup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { email?: string; password?: string };

        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return { status: 400, jsonBody: { error: "Email and password are required" } };
        }

        // ✅ Check if user already exists
        const query = `SELECT * FROM c WHERE c.email = @email`;
        const { resources } = await usersContainer.items
            .query({ query, parameters: [{ name: "@email", value: email }] })
            .fetchAll();

        if (resources.length > 0) {
            return { status: 409, jsonBody: { error: "User already exists" } };
        }

        // ✅ Hash password
        const passwordHash = await hashPassword(password);

        // ✅ Create user object
        const newUser: User = {
            id: uuid(),
            email,
            passwordHash,
            role: "user",
            createdAt: new Date().toISOString()
        };

        // ✅ Store in Cosmos DB
        await usersContainer.items.create(newUser);

        // ✅ Auto-login: generate JWT
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
                    role: newUser.role
                }
            }
        };

    } catch (err: any) {
        context.error(err);
        return { status: 500, jsonBody: { error: "Internal server error" } };
    }
}

app.http("signup", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: signup
});
