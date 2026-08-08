const checks = [
  {
    file: "SECURITY.md",
    patterns: [/\[[a-z0-9-]+\]/gi],
  },
  {
    file: "docs/support-policy.md",
    patterns: [/\[[a-z0-9-]+\]/gi],
  },
  {
    file: "docs/shopify-review-guide.md",
    patterns: [/\[[a-z0-9-]+\]/gi],
  },
  {
    file: "docs/theme-compatibility-matrix.md",
    patterns: [/\[[a-z0-9-]+\]/gi],
  },
  {
    file: "docs/app-listing-draft.md",
    patterns: [/\[[a-z0-9-]+\]/gi],
  },
  {
    file: "shopify.app.toml",
    patterns: [/https:\/\/example\.com/g],
  },
];

const findings = [];

for (const check of checks) {
  const contents = await readTextFile(check.file);

  for (const pattern of check.patterns) {
    for (const match of contents.matchAll(pattern)) {
      const line = lineNumberForIndex(contents, match.index ?? 0);
      findings.push(`${check.file}:${line} ${match[0]}`);
    }
  }
}

if (findings.length > 0) {
  console.error("App Store placeholders remain:");
  console.error("");
  console.error(findings.map((finding) => `- ${finding}`).join("\n"));
  console.error("");
  console.error("Replace these before final App Store submission.");
  process.exit(1);
}

console.log("No App Store submission placeholders found.");

async function readTextFile(file) {
  const { readFile } = await import("node:fs/promises");
  return readFile(file, "utf8");
}

function lineNumberForIndex(contents, index) {
  return contents.slice(0, index).split("\n").length;
}
