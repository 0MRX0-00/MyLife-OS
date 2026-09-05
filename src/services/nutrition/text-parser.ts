import { ParsedQuickEntryItem } from "@/types/nutrition";

export async function parseQuickEntryText(text: string): Promise<ParsedQuickEntryItem[]> {
  if (!text || !text.trim()) return [];

  // 1. If Groq API Key is available, use ultra-fast Groq AI model for high accuracy macro extraction
  if (process.env.GROQ_API_KEY) {
    try {
      const aiResults = await parseWithGroqAI(text, process.env.GROQ_API_KEY);
      if (aiResults && aiResults.length > 0) return aiResults;
    } catch (err) {
      console.warn("Groq AI macro parser fallback triggered:", err);
    }
  }

  // 2. Fallback regex + heuristic parser (Zero API dependency guarantee)
  return fallbackRegexParser(text);
}

async function parseWithGroqAI(text: string, apiKey: string): Promise<ParsedQuickEntryItem[] | null> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "groq/compound-mini",
      messages: [
        {
          role: "system",
          content: "You are a nutrition database AI. Convert the meal description into a valid raw JSON array of objects with fields: rawText, name, quantity, servingUnit, calories, protein, carbohydrates, fat, confidence. Respond with ONLY the raw JSON array.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 400,
      temperature: 0.1,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  // Clean any markdown formatting if present
  content = content.replace(/```json/g, "").replace(/```/g, "").trim();

  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.items || parsed.foods || null;
}

function fallbackRegexParser(text: string): ParsedQuickEntryItem[] {
  const rawItems = text
    .split(/[\n+,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const results: ParsedQuickEntryItem[] = [];

  for (const item of rawItems) {
    const leadingQtyRegex = /^([\d.]+)\s*([a-zA-Z]*)\s+(.+)$/;
    const trailingQtyRegex = /^(.+?)\s+([\d.]+)\s*([a-zA-Z]*)$/;

    let name = item;
    let quantity = 1;
    let unit = "serving";

    const matchLeading = item.match(leadingQtyRegex);
    if (matchLeading) {
      quantity = parseFloat(matchLeading[1]) || 1;
      unit = matchLeading[2] || "serving";
      name = matchLeading[3].trim();
    } else {
      const matchTrailing = item.match(trailingQtyRegex);
      if (matchTrailing) {
        name = matchTrailing[1].trim();
        quantity = parseFloat(matchTrailing[2]) || 1;
        unit = matchTrailing[3] || "serving";
      }
    }

    let calories = 150;
    let protein = 10;
    let carbohydrates = 15;
    let fat = 5;

    const lowerName = name.toLowerCase();
    if (lowerName.includes("chicken") || lowerName.includes("turkey") || lowerName.includes("steak")) {
      protein = 30; carbohydrates = 0; fat = 5; calories = 165;
    } else if (lowerName.includes("rice") || lowerName.includes("oats") || lowerName.includes("pasta") || lowerName.includes("bread")) {
      protein = 4; carbohydrates = 35; fat = 1; calories = 160;
    } else if (lowerName.includes("egg")) {
      protein = 6; carbohydrates = 0.5; fat = 5; calories = 70;
    } else if (lowerName.includes("apple") || lowerName.includes("banana") || lowerName.includes("berry")) {
      protein = 0.5; carbohydrates = 25; fat = 0; calories = 95;
    } else if (lowerName.includes("protein shake") || lowerName.includes("whey")) {
      protein = 24; carbohydrates = 3; fat = 2; calories = 130;
    }

    let scale = 1;
    if (unit.toLowerCase() === "g" || unit.toLowerCase() === "ml") {
      scale = quantity / 100;
    } else {
      scale = quantity;
    }

    results.push({
      rawText: item,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quantity,
      servingUnit: unit || "g",
      calories: Math.round(calories * scale),
      protein: Math.round(protein * scale * 10) / 10,
      carbohydrates: Math.round(carbohydrates * scale * 10) / 10,
      fat: Math.round(fat * scale * 10) / 10,
      confidence: 0.85,
    });
  }

  return results;
}
