#!/usr/bin/env node
"use strict";

/**
 * bump-version.cjs <new-version>
 *
 * Updates the marketing version across all platform files:
 *   - packages/app/package.json              → "version"
 *   - ios/App/App.xcodeproj/project.pbxproj  → MARKETING_VERSION (both build configs)
 *   - android/app/build.gradle               → versionName + versionCode
 *
 * versionCode is derived from the version string: major*10000 + minor*100 + patch
 * e.g. 3.1.1 → 30101
 *
 * Usage:
 *   node scripts/bump-version.cjs 3.1.1
 *   npm run bump-version 3.1.1
 */

const fs = require("fs");
const path = require("path");

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: node scripts/bump-version.cjs <major.minor.patch>");
  process.exit(1);
}

const [major, minor, patch] = version.split(".").map(Number);
const versionCode = major * 10000 + minor * 100 + patch;

const root = path.resolve(__dirname, "..");

// ── 1. package.json ──────────────────────────────────────────────────────────
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const prevPkg = pkg.version;
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`package.json          ${prevPkg} → ${version}`);

// ── 2. iOS project.pbxproj ───────────────────────────────────────────────────
const pbxPath = path.join(root, "ios/App/App.xcodeproj/project.pbxproj");
let pbx = fs.readFileSync(pbxPath, "utf8");
const pbxPrev = (pbx.match(/MARKETING_VERSION = ([^;]+);/) || [])[1] || "?";
const pbxUpdated = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);
if (pbxUpdated === pbx) {
  console.warn("project.pbxproj       no MARKETING_VERSION found — skipped");
} else {
  fs.writeFileSync(pbxPath, pbxUpdated);
  console.log(`project.pbxproj       ${pbxPrev} → ${version} (both build configs)`);
}

// ── 3. Android build.gradle ──────────────────────────────────────────────────
const gradlePath = path.join(root, "android/app/build.gradle");
let gradle = fs.readFileSync(gradlePath, "utf8");
const prevCode = (gradle.match(/versionCode\s+(\d+)/) || [])[1] || "?";
const prevName = (gradle.match(/versionName\s+"([^"]+)"/) || [])[1] || "?";
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${version}"`);
fs.writeFileSync(gradlePath, gradle);
console.log(`build.gradle          ${prevName} (${prevCode}) → ${version} (${versionCode})`);

console.log(`\n✓ All files bumped to ${version}`);
