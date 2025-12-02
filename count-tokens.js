#!/usr/bin/env node

// Token counting for JSON / TOON / tiny using @dqbd/tiktoken

const fs = require("fs");
const path = require("path");
const { encoding_for_model } = require("@dqbd/tiktoken");

// Pick a model whose tokenizer you care about.
// You can change this to "gpt-4o", "gpt-4o-mini", etc.
const MODEL_NAME = "gpt-4o-mini";

const enc = encoding_for_model(MODEL_NAME);

function countTokensForFile(filePath) {
  const fullPath = path.resolve(filePath);
  const text = fs.readFileSync(fullPath, "utf8");
  const tokens = enc.encode(text);
  const stats = fs.statSync(fullPath);
  const sizeKB = stats.size / 1024;
  return { tokens: tokens.length, sizeKB };
}

function getProgressBar(percent, width = 20) {
  const filled = Math.round((width * percent) / 100);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function main() {
  const files = [
    "data.json",
    "data-minify.json",
    "data.toon",
    "data.tiny",
    "data.tonl"
  ];

  console.log(`Model tokenizer: ${MODEL_NAME}\n`);

  const results = [];
  let maxTokens = 0;
  let maxSize = 0;

  // Collect data
  for (const file of files) {
    try {
      const { tokens, sizeKB } = countTokensForFile(file);
      results.push({ file, tokens, sizeKB });
      maxTokens = Math.max(maxTokens, tokens);
      maxSize = Math.max(maxSize, sizeKB);
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }

  // Print table header
  console.log("┌─────────────────────┬──────────┬─────────────────────────────┬──────────┬─────────────────────────────┐");
  console.log("│ File                │ Size(KB) │     Size Reduction          │ Tokens   │     Token Reduction         │");
  console.log("├─────────────────────┼──────────┼─────────────────────────────┼──────────┼─────────────────────────────┤");

  // Print data rows
  for (const { file, tokens, sizeKB } of results) {
    const sizePercent = ((maxSize - sizeKB) / maxSize * 100).toFixed(1);
    const tokenPercent = ((maxTokens - tokens) / maxTokens * 100).toFixed(1);
    
    const sizeBar = getProgressBar(parseFloat(sizePercent));
    const tokenBar = getProgressBar(parseFloat(tokenPercent));

    console.log(
      `│ ${file.padEnd(19)} │ ${sizeKB.toFixed(2).padStart(8)} │ ${sizeBar} ${sizePercent.padStart(5)}% │ ${tokens.toString().padStart(8)} │ ${tokenBar} ${tokenPercent.padStart(5)}% │`
    );
  }

  console.log("└─────────────────────┴──────────┴─────────────────────────────┴──────────┴─────────────────────────────┘");

  enc.free(); // free WASM memory
}

main();

// Updated version with colored progress bars and better alignment

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  reset: '\x1b[0m',
  gray: '\x1b[90m'
};

function getColoredProgressBar(percent, width = 20) {
  const filled = Math.round((width * percent) / 100);
  const empty = width - filled;
  return colors.green + "█".repeat(filled) + colors.gray + "░".repeat(empty) + colors.reset;
}

function mainColored() {
  const files = [
    "data.json",
    "data-minify.json",
    "data.toon",
    "data.tiny",
    "data.tonl"
  ];

  console.log(`Model tokenizer: ${MODEL_NAME}\n`);

  const results = [];
  let maxTokens = 0;
  let maxSize = 0;

  // Collect data
  for (const file of files) {
    try {
      const { tokens, sizeKB } = countTokensForFile(file);
      results.push({ file, tokens, sizeKB });
      maxTokens = Math.max(maxTokens, tokens);
      maxSize = Math.max(maxSize, sizeKB);
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }

  // Print table header
  console.log("┌─────────────────────┬──────────┬──────────────────────────────┬──────────┬─────────────────────────┐");
  console.log("│ File                │ Size(KB) │ Size Reduction               │ Tokens   │ Token Reduction         │");
  console.log("├─────────────────────┼──────────┼─────────────────────              ─────────┼──────────┼─────────────────────────┤");

  // Print data rows
  for (const { file, tokens, sizeKB } of results) {
    const sizePercent = ((maxSize - sizeKB) / maxSize * 100).toFixed(1);
    const tokenPercent = ((maxTokens - tokens) / maxTokens * 100).toFixed(1);
    
    const sizeBar = getColoredProgressBar(parseFloat(sizePercent));
    const tokenBar = getColoredProgressBar(parseFloat(tokenPercent));

    const formattedSizePercent = sizePercent.padStart(4) + "%";
    const formattedTokenPercent = tokenPercent.padStart(4) + "%";

    console.log(
      `│ ${file.padEnd(19)} │ ${sizeKB.toFixed(2).padStart(8)} │ ${sizeBar} ${formattedSizePercent} │ ${tokens.toString().padStart(8)} │ ${tokenBar} ${formattedTokenPercent} │`
    );
  }

  console.log("└─────────────────────┴──────────┴─────────────────────────┴──────────┴─────────────────────────┘");

  enc.free();
}

// Uncomment to use colored version:
// mainColored();