import { Composio } from "@composio/core";

const apiKey = process.env.COMPOSIO_API_KEY;

export const composioClient = apiKey
  ? new Composio({ apiKey })
  : null;

export function isComposioConfigured(): boolean {
  return !!process.env.COMPOSIO_API_KEY;
}
