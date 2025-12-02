#!/usr/bin/env node

// JSON → tiny converter for LLM experiments
// Usage:
//   node json-to-tiny.js input.json output.tiny
//
// Defaults:
//   input  = data.json
//   output = data.tiny

const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2] || "data.json";
const outputPath = process.argv[3] || "data.tiny";

/**
 * Convert an array of uniform objects to a single tiny block.
 * keyName: name to use as the "function" / top-level identifier.
 */
function arrayToTinyBlock(arr, keyName) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`Cannot build tiny block for key "${keyName}": array is empty or invalid.`);
  }

  const first = arr[0];
  if (first === null || typeof first !== "object" || Array.isArray(first)) {
    throw new Error(`Array for key "${keyName}" must contain objects.`);
  }

  const fieldNames = Object.keys(first);

  // Start: key(field1 field2 field3
  let tiny = keyName + "(" + fieldNames.join(" ");

  for (const row of arr) {
    const rowValues = fieldNames.map((field) => {
      const v = row[field];
      if (v === null || v === undefined) return "";

      // Simple stringification.
      // NOTE: for free-text fields (like "bio" with spaces),
      // tiny becomes less "purely tabular", but still useful for LLM prompts.
      return String(v).replace(/\s+/g, " ");
    });

    tiny += "|" + rowValues.join(" ");
  }

  // As per tiny style, we do NOT add a closing ")"
  return tiny;
}

function jsonToTiny(jsonValue) {
  const blocks = [];

  if (Array.isArray(jsonValue)) {
    // Your sample JSON: an array of objects at the root.
    blocks.push(arrayToTinyBlock(jsonValue, "records"));
  } else if (jsonValue && typeof jsonValue === "object") {
    // Root object: treat each key whose value is an array of objects.
    for (const [key, value] of Object.entries(jsonValue)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        blocks.push(arrayToTinyBlock(value, key));
      }
    }
  } else {
    throw new Error("Root JSON must be either an array of objects or an object containing arrays of objects.");
  }

  if (blocks.length === 0) {
    throw new Error("No suitable arrays of objects found to convert.");
  }

  return blocks.join("\n") + "\n";
}

// ---- main ----
try {
  const inputText = fs.readFileSync(path.resolve(inputPath), "utf8");
  const json = JSON.parse(inputText);

  const tinyText = jsonToTiny(json);

  fs.writeFileSync(path.resolve(outputPath), tinyText, "utf8");
  console.log(`✅ Converted ${inputPath} → ${outputPath}`);
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
