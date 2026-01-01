import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

function encodeKey(str: string) {
  return Buffer.from(str).toString("base64url");
}

const searchServiceName = process.env.SEARCH_SERVICE_NAME!;
const searchApiKey = process.env.SEARCH_API_KEY!;

export async function indexUser(user: any) {
  const url = `https://${searchServiceName}.search.windows.net/indexes/users/docs/index?api-version=2023-11-01`;

  const payload = {
    value: [
      {
        "@search.action": "upload",
        id: encodeKey(user.id),
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        profileImageUrl: user.profileImageUrl || "",
        tags: user.tags || [],
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date().toISOString()
      }
    ]
  };

  await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": searchApiKey
    }
  });
}
