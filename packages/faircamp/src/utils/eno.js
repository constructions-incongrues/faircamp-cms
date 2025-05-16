/**
 * Converts a JSON object to Eno format
 * @param {Object} json - The JSON object to convert
 * @param {string} [indent=''] - Current indentation level
 * @param {boolean} [ignoreEmpty=true] - Whether to skip empty strings, null values, and empty arrays
 * @param {string[]} [skipFields=[]] - Array of field names to skip in the output
 * @param {boolean} [useFlags=false] - Whether to output boolean true values as flags
 * @param {string[]} [forceMultiline=[]] - Array of field names to force multiline format
 * @returns {string} The Eno formatted string
 */
export function toEno(json, indent = '', ignoreEmpty = true, skipFields = [], useFlags = false, forceMultiline = []) {
  if (json === null || json === undefined) {
    return '';
  }

  if (typeof json !== 'object') {
    return String(json);
  }

  if (Array.isArray(json)) {
    // Skip empty arrays if ignoreEmpty is true
    if (ignoreEmpty && json.length === 0) {
      return '';
    }
    const items = json.map(item => {
      if (typeof item === 'object' && item !== null) {
        const result = toEno(item, indent + '  ', ignoreEmpty, skipFields, useFlags, forceMultiline);
        return result ? `${indent}- ${result}` : '';
      }
      return `${indent}- ${item}`;
    }).filter(Boolean);
    return items.join('\n');
  }

  const lines = [];
  for (const [key, value] of Object.entries(json)) {
    // Skip specified fields
    if (skipFields.includes(key)) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    // Skip empty strings if ignoreEmpty is true
    if (ignoreEmpty && typeof value === 'string' && value.trim() === '') {
      continue;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        // Skip empty arrays if ignoreEmpty is true
        if (ignoreEmpty && value.length === 0) {
          continue;
        }
        const arrayContent = toEno(value, indent + '  ', ignoreEmpty, skipFields, useFlags, forceMultiline);
        if (arrayContent) {
          lines.push(`${indent}${key}:`);
          lines.push(arrayContent);
        }
      } else {
        // Handle object values
        const objectContent = toEno(value, indent + '  ', ignoreEmpty, skipFields, useFlags, forceMultiline);
        if (objectContent) {
          lines.push(`${indent}${key}:`);
          // Always use key=value format for nested objects
          const subLines = objectContent.split('\n').map(line => {
            if (line.trim().startsWith('- ')) {
              return line;
            }
            return line.replace(': ', '=');
          });
          lines.push(subLines.join('\n'));
        }
      }
    } else {
      // Handle boolean values as flags if useFlags is true
      if (useFlags && typeof value === 'boolean') {
        if (value === true) {
          lines.push(`${indent}${key}`);
        }
        // Skip false values
        continue;
      }

      // Handle special cases for strings
      if (typeof value === 'string') {
        // Only use multiline format for top-level fields that are in forceMultiline list
        if (forceMultiline.includes(key)) {
          lines.push(`${indent}-- ${key}`);
          value.split('\n').forEach(line => {
            lines.push(`${indent}${line}`);
          });
          lines.push(`${indent}-- ${key}`);
        } else {
          lines.push(`${indent}${key}: ${value}`);
        }
      } else {
        lines.push(`${indent}${key}: ${value}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Parses an Eno string into a JSON object
 * @param {string} enoString - The Eno formatted string to parse
 * @returns {Object} The parsed JSON object
 */
export function toJson(enoString) {
  const lines = enoString.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];

  let currentBlock = null;
  let blockContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;

    // Calculate indentation
    const indent = line.search(/\S|$/);
    const content = line.slice(indent);

    // Handle block content
    if (currentBlock) {
      if (indent > currentBlock.indent) {
        blockContent.push(content);
        continue;
      } else {
        // End of block
        const blockValue = blockContent.join('\n');
        const lastStack = stack[stack.length - 1];
        lastStack.obj[currentBlock.key] = blockValue;
        currentBlock = null;
        blockContent = [];
      }
    }

    // Check if this is a block start
    if (content.endsWith('|')) {
      const key = content.slice(0, -1).trim();
      currentBlock = { key, indent };
      blockContent = [];
      continue;
    }

    // Handle lists
    if (content.startsWith('- ')) {
      const value = content.slice(2).trim();
      const lastStack = stack[stack.length - 1];
      const lastKey = Object.keys(lastStack.obj).pop();
      
      if (!Array.isArray(lastStack.obj[lastKey])) {
        lastStack.obj[lastKey] = [];
      }
      
      if (value) {
        lastStack.obj[lastKey].push(value);
      }
      continue;
    }

    // Handle key-value pairs
    const colonIndex = content.indexOf(':');
    if (colonIndex !== -1) {
      const key = content.slice(0, colonIndex).trim();
      const value = content.slice(colonIndex + 1).trim();

      // Pop stack until we find the correct indentation level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const current = stack[stack.length - 1].obj;

      // Handle empty arrays
      if (value === '[]') {
        current[key] = [];
      }
      // Handle empty objects
      else if (value === '{}') {
        current[key] = {};
      }
      // Handle nested objects
      else if (!value) {
        current[key] = {};
        stack.push({ obj: current[key], indent });
      }
      // Handle regular values
      else {
        // Try to parse as number or boolean
        if (value === 'true') current[key] = true;
        else if (value === 'false') current[key] = false;
        else if (value === 'null') current[key] = null;
        else if (!isNaN(value) && value !== '') current[key] = Number(value);
        else current[key] = value;
      }
    }
  }

  // Handle any remaining block content
  if (currentBlock) {
    const blockValue = blockContent.join('\n');
    const lastStack = stack[stack.length - 1];
    lastStack.obj[currentBlock.key] = blockValue;
  }

  return result;
} 