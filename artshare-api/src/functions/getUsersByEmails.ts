import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usersContainer } from "../shared/db";

interface EmailRequestBody {
    emails: string[];
}

export async function getUsersByEmails(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as EmailRequestBody;
        const emails = body.emails;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return { status: 400, jsonBody: { error: "Missing or invalid 'emails' array" } };
        }

        // ⭐ FIX: Use ARRAY_CONTAINS instead of IN
        const query = {
            query: `
                SELECT c.id, c.email, c.username, c.profileImageUrl, c.role, c.createdAt
                FROM c
                WHERE ARRAY_CONTAINS(@emails, c.email)
            `,
            parameters: [
                { name: "@emails", value: emails }
            ]
        };

        const { resources } = await usersContainer.items.query(query).fetchAll();

        return {
            status: 200,
            jsonBody: resources
        };

    } catch (err: any) {
        context.error("getUsersByEmails error:", err);
        return { status: 500, jsonBody: { error: "Internal server error" } };
    }
}

app.http("getUsersByEmails", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "getUsersByEmails",
    handler: getUsersByEmails
});
