import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const forbidden = ["udemy", "coursera", "linkedin", "falcord"];
const ignoreDirs = new Set([".git", "node_modules", ".next", "coverage", "dist", "build"]);
const ignoredFiles = new Set([path.posix.join("scripts", "check-brand.mjs")]);
const extensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".prisma",
  ".env",
  ".example",
]);

const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (ignoredFiles.has(path.relative(root, full).replace(/\\/g, "/"))) continue;
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (extensions.has(ext) || entry.name === ".env" || entry.name.endsWith(".example")) {
      files.push(full);
    }
  }
}

walk(root);
const matches = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const term of forbidden) {
    if (text.toLowerCase().includes(term)) {
      matches.push({ file: path.relative(root, file), term });
      break;
    }
  }
}

if (matches.length > 0) {
  console.error("Brand compliance check failed. Forbidden terms found:");
  for (const match of matches) {
    console.error(`- ${match.file}: ${match.term}`);
  }
  process.exit(1);
}

console.log("Brand compliance check passed.");
