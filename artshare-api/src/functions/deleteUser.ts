import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function deleteUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as { email: string };

    if (!body.email) {
      return { status: 400, jsonBody: { error: "Email is required" } };
    }

    const container = database.container("users");

    // Find user by email
    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: body.email }]
    };

    const { resources } = await container.items.query(query).fetchAll();

    if (resources.length === 0) {
      return { status: 404, jsonBody: { error: "User not found" } };
    }

    const user = resources[0];

    // Delete using id + partition key (id)
    await container.item(user.id, user.id).delete();

    return {
      status: 200,
      jsonBody: { message: `User ${body.email} deleted successfully` }
    };

  } catch (err: any) {
    context.error("Error deleting user:", err);
    return { status: 500, jsonBody: { error: "Failed to delete user" } };
  }
}

app.http("deleteUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deleteUser",
  handler: deleteUser
});
