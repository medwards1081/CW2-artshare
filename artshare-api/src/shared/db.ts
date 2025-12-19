import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

export const database = client.database("artshare");
export const usersContainer = database.container("users");
