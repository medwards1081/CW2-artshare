import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

function encodeKey(str: string) {
  return Buffer.from(str).toString("base64url");
}

const searchServiceName = process.env.SEARCH_SERVICE_NAME!;
const searchApiKey = process.env.SEARCH_API_KEY!;

export async function indexArtwork(art: any) {
  const url = `https://${searchServiceName}.search.windows.net/indexes/artworks/docs/index?api-version=2023-11-01`;

  const payload = {
    value: [
      {
        "@search.action": "upload",
        id: encodeKey(art.id),
        title: art.title || "",
        description: art.description || "",
        artistId: art.artistId || "",
        artistUsername: art.artistUsername || "",
        fileType: art.fileType || "",
        tags: art.tags || [],
        createdAt: art.createdAt
          ? new Date(art.createdAt).toISOString()
          : new Date().toISOString(),
        fileUrl: art.fileUrl || "",
        fileName: art.fileName || ""
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
