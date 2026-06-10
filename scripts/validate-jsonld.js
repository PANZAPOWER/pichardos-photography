const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const siteDir = path.join(__dirname, "..", "_site");
let errors = 0;
let checked = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full);
    else if (entry.name.endsWith(".html")) checkFile(full);
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    checked++;
    try {
      JSON.parse(match[1]);
    } catch (e) {
      console.error(`✗ Invalid JSON-LD in ${filePath}:`);
      console.error(`  ${e.message}`);
      errors++;
    }
  }
}

walkDir(siteDir);

if (errors === 0) {
  console.log(`✓ All ${checked} JSON-LD blocks valid`);
  process.exit(0);
} else {
  console.error(`✗ ${errors} invalid JSON-LD blocks (${checked} total checked)`);
  process.exit(1);
}
