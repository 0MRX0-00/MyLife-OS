import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function verifyKeyWithSDK() {
  const apiKey = process.env.COMPOSIO_API_KEY || "";
  console.log("Testing COMPOSIO_API_KEY:", apiKey);

  const composio = new Composio({ apiKey });

  try {
    console.log("Checking API key authenticity with Composio SDK...");
    const accounts = await (composio.connectedAccounts as unknown as { list: () => Promise<unknown> }).list();
    console.log("✅ STATUS: VALID_KEY");
    console.log("Connected accounts response:", JSON.stringify(accounts));
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    if (errorObj.status === 401 || errorObj.status === 403 || errorObj.message?.includes("Unauthorized") || errorObj.message?.includes("Invalid API key")) {
      console.log("❌ STATUS: INVALID_KEY");
      console.log("Error details:", errorObj.message);
    } else {
      console.log("SDK Call Executed with response status:", errorObj.status || "OK");
      console.log("Message:", errorObj.message);
    }
  }
}

verifyKeyWithSDK();
