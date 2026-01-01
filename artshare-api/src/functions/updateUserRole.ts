import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function updateUserRole(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as { email: string; role: string };
    const { email, role } = body;

    if (!email || !role) {
      return { status: 400, jsonBody: { error: "Email and role are required" } };
    }

    const container = database.container("users");

    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };

    const { resources } = await container.items.query(query).fetchAll();

    if (resources.length === 0) {
      return { status: 404, jsonBody: { error: "User not found" } };
    }

    const user = resources[0];
    user.role = role;

    const { resource: updated } = await container.item(user.id, user.id).replace(user);

    return { status: 200, jsonBody: updated };

  } catch (err: any) {
    context.error("Error updating user role:", err);
    return { status: 500, jsonBody: { error: "Failed to update role" } };
  }
}

app.http("updateUserRole", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "updateUserRole",
  handler: updateUserRole
});
