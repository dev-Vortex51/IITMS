#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const appDir = join(root, "src", "app");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const files = walk(appDir).filter((f) => f.endsWith("/page.tsx"));
const issues = [];

const allowedNoDsPages = new Set(["src/app/page.tsx"]);

for (const file of files) {
  const rel = relative(root, file).replace(/\\/g, "/");
  const text = readFileSync(file, "utf8");

  const importsDesignSystem =
    text.includes('from "@/components/design-system"') ||
    text.includes('from "@/components/auth/');

  const importsLocalComposition =
    /from\s+"\.\/components\//.test(text) ||
    /from\s+"\.\/_components\//.test(text) ||
    /from\s+"\.\/hooks\//.test(text) ||
    /from\s+"\.\/_hooks\//.test(text);

  if (!importsDesignSystem && !importsLocalComposition && !allowedNoDsPages.has(rel)) {
    issues.push(`${rel}: page must use design-system/auth primitives or local composition modules`);
  }

  if (/style\s*=\s*\{\{/.test(text)) {
    issues.push(`${rel}: inline style object detected (prefer tokenized className styles)`);
  }

  if (/#[0-9a-fA-F]{3,8}/.test(text)) {
    issues.push(`${rel}: raw hex color detected (use design tokens)`);
  }

  if (/className\s*=\s*"[^"]*\[[^\]]*#[^\]]*\][^"]*"/.test(text)) {
    issues.push(`${rel}: arbitrary color token detected in className (use theme tokens)`);
  }
}

if (issues.length) {
  console.error("Design conformance check failed:\n");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Design conformance check passed for ${files.length} route pages.`);
