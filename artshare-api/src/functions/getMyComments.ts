import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { database } from "../shared/db";

export async function getMyComments(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userEmail = request.params.userEmail;

    if (!userEmail) {
      return { status: 400, jsonBody: { error: "User email is required" } };
    }

    const container = database.container("artwork");

    const query = {
      query: "SELECT * FROM c"
    };

    const { resources } = await container.items.query(query).fetchAll();

    const allComments = [];

    for (const art of resources) {
      const comments = art.comments || [];
      for (const c of comments) {
        if (c.userEmail === userEmail) {
          allComments.push({
            ...c,
            artworkId: art.id,
            artworkTitle: art.title,
            artworkImage: art.imageUrl
          });
        }
      }
    }

    return { status: 200, jsonBody: allComments };

  } catch (err: any) {
    context.error("Error fetching user comments:", err);
    return { status: 500, jsonBody: { error: "Failed to fetch user comments" } };
  }
}

app.http("getMyComments", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getMyComments/{userEmail}",
  handler: getMyComments
});
