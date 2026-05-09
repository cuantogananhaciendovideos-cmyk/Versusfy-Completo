/**
 * Utility to repair malformed or truncated JSON strings from AI models.
 */
export function repairJson(jsonString: string): string {
  let cleaned = jsonString.trim();
  
  // 0. Find the first '{' or '[' to trim prefix junk
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }

  if (start !== -1) {
    cleaned = cleaned.substring(start);
  }

  // Find the LAST closing brace/bracket and see if there is junk after it
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  let end = Math.max(lastBrace, lastBracket);

  // If there's garbage after the last closure, trim it. 
  // But ONLY if the closure exists and there's actually something after it that looks like junk.
  // Note: if it's truncated, end might be -1 or point to an early closure.
  // We only trim if we are fairly sure we found the intended end.
  if (end !== -1 && end < cleaned.length - 1) {
    const trailing = cleaned.substring(end + 1).trim();
    // If trailing contains characters that shouldn't be outside JSON, we trim.
    if (trailing.length > 0 && !/^[\s,;]+$/.test(trailing)) {
        // If the JSON seems balanced up to 'end', then 'end' is likely the real end.
        // Otherwise, it might be a truncated JSON and we should keep the trailing part to repair it.
        let balance = 0;
        for (let i = 0; i <= end; i++) {
            if (cleaned[i] === '{' || cleaned[i] === '[') balance++;
            if (cleaned[i] === '}' || cleaned[i] === ']') balance--;
        }
        if (balance === 0) {
            cleaned = cleaned.substring(0, end + 1);
        }
    }
  }

  // 1. Remove Markdown code blocks if present (redundant if substep above worked but safe)
  cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  // FIX: Common AI error where it spits out "key" "value" instead of "key": "value"
  // This is a common failure mode for some models under pressure.
  cleaned = cleaned.replace(/"([^"]+)"\s+"([^"]+)"/g, '"$1": "$2"');
  // FIX: Handle missing colons for numbers, booleans, and null
  cleaned = cleaned.replace(/"([^"]+)"\s+([0-9.]+|true|false|null)/g, '"$1": $2');
  
  // FIX: Common AI error where it forgets a comma between entries
  // e.g., "val" "key": "val" -> "val", "key": "val"
  cleaned = cleaned.replace(/"\s+"([^"]+)":/g, '", "$1":');
  cleaned = cleaned.replace(/([0-9.]+|true|false|null)\s+"([^"]+)":/g, '$1, "$2":');
  // FIX: More aggressive comma fixing for objects in arrays
  cleaned = cleaned.replace(/}\s+{/g, '}, {');

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
