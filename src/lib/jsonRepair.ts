/**
 * Utility to repair malformed or truncated JSON strings from AI models.
 */
export function repairJson(jsonString: string): string {
  let cleaned = jsonString.trim();
  
  // 1. Remove Markdown code blocks if present
  cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  if (!cleaned) return '';

  // 2. Count brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
    }
  }

  // 3. Repair truncated string
  if (inString) {
    cleaned += '"';
  }

  // 4. Close open objects and arrays in reverse order
  // This is a naive stack-based approach for truncation
  const stack: string[] = [];
  let tempInString = false;
  let tempEscape = false;
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (tempEscape) { tempEscape = false; continue; }
    if (char === '\\') { tempEscape = true; continue; }
    if (char === '"') { tempInString = !tempInString; continue; }
    if (!tempInString) {
      if (char === '{' || char === '[') stack.push(char);
      if (char === '}' || char === ']') stack.pop();
    }
  }

  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') cleaned += '}';
    if (last === '[') cleaned += ']';
  }

  return cleaned;
}

/**
 * Safely parse JSON that might be truncated
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    const repaired = repairJson(text);
    return JSON.parse(repaired) as T;
  } catch (e) {
    console.warn("[JSON REPAIR] Failed to parse even after repairAttempt:", e);
    // Last ditch effort: if it was an array attempt to find the last complete object
    try {
      const partial = text.substring(0, text.lastIndexOf('}') + 1);
      if (partial.startsWith('[')) {
          return JSON.parse(partial + ']') as T;
      }
    } catch (inner) {
      // Ignore
    }
    return fallback;
  }
}
