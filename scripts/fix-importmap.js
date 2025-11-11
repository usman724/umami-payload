#!/usr/bin/env node

/**
 * Fix import paths in the generated importMap.js file
 * Payload generates paths relative to baseDir, but we need them relative to the importMap.js location
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importMapPath = path.join(__dirname, '../src/app/(payload)/admin/importMap.js');

if (!fs.existsSync(importMapPath)) {
  console.log('importMap.js not found, skipping fix');
  process.exit(0);
}

let content = fs.readFileSync(importMapPath, 'utf8');
const originalContent = content;

// Replace bare module specifiers with correct relative paths
// From src/app/(payload)/admin/ to src/components/ = ../../../components/
// Handle both single and double quotes, and various path formats
content = content.replace(
  /from ['"]components\/(Icon|Logo)['"]/g,
  "from '../../../components/$1'"
);

// Also handle if someone manually changed it to use @/ alias (which won't work in importMap)
content = content.replace(
  /from ['"]@\/components\/(Icon|Logo)['"]/g,
  "from '../../../components/$1'"
);

// Handle any other incorrect relative paths
content = content.replace(
  /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components\/(Icon|Logo)['"]/g,
  "from '../../../components/$1'"
);

if (content !== originalContent) {
  fs.writeFileSync(importMapPath, content, 'utf8');
  console.log('✓ Fixed importMap.js paths');
} else {
  console.log('✓ importMap.js paths are already correct');
}

