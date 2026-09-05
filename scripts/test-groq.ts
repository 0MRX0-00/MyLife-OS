import dotenv from "dotenv";
import { parseQuickEntryText } from "../src/services/nutrition/text-parser";

dotenv.config();

async function testFullGroqAIIntegration() {
  console.log("Testing parseQuickEntryText with live Groq AI key...");
  const text = "3 poori with potato masala and 1 glass of badam milk";
  const items = await parseQuickEntryText(text);
  console.log("✅ Groq AI Parsed Macro Result:\n", JSON.stringify(items, null, 2));
}

testFullGroqAIIntegration();
