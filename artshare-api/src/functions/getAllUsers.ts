import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getAllUsers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const container = database.container("users");

    const query = "SELECT c.id, c.email, c.username, c.role FROM c";
    const { resources: users } = await container.items.query(query).fetchAll();

    return {
      status: 200,
      jsonBody: users
    };

  } catch (err: any) {
    context.error("Error fetching users:", err);
    return { status: 500, jsonBody: { error: "Failed to fetch users" } };
  }
}

app.http("getAllUsers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getAllUsers",
  handler: getAllUsers
});
