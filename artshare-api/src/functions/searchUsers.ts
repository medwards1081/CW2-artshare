import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";

const searchServiceName = process.env.SEARCH_SERVICE_NAME;
const searchIndexName = "users";
const searchApiKey = process.env.SEARCH_API_KEY;

export async function searchUsers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const q = request.query.get("q") || "";

    const url = `https://${searchServiceName}.search.windows.net/indexes/${searchIndexName}/docs/search?api-version=2023-11-01`;

    const payload = {
      search: q,
      top: 10,
      queryType: "simple",
      searchMode: "any"
    };

    const { data } = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "api-key": searchApiKey!
      }
    });

    return { status: 200, jsonBody: data.value };

  } catch (err) {
    context.error("User search failed:", err);
    return { status: 500, jsonBody: { error: "Search failed" } };
  }
}

app.http("searchUsers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "searchUsers",
  handler: searchUsers
});
