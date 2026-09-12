const fs = require('fs');
const path = require('path');

console.log('=== Running ExpoModulesJSI Patch for Xcode 16.2 / Swift 6.0 ===');

// 1. Patch Package.swift (swift-tools-version: 6.0 and remove trailing commas before ')')
const packageSwiftPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Package.swift');
if (fs.existsSync(packageSwiftPath)) {
  let content = fs.readFileSync(packageSwiftPath, 'utf8');
  content = content.replace(/swift-tools-version: 6\.[0-9]+/g, 'swift-tools-version: 6.0');
  content = content.replace(/,\s*\)/g, '\n)');
  fs.writeFileSync(packageSwiftPath, content, 'utf8');
  console.log('✔ Patched Package.swift: set swift-tools-version: 6.0 and stripped trailing commas before )');
} else {
  console.log('ℹ Package.swift not found at:', packageSwiftPath);
}

// 2. Patch RuntimeScheduler.h (fallback for SWIFT_RETURNS_RETAINED which is only in Swift 6.2+)
const runtimeSchedulerHeader = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI-Cxx',
  'include',
  'RuntimeScheduler.h'
);
if (fs.existsSync(runtimeSchedulerHeader)) {
  let content = fs.readFileSync(runtimeSchedulerHeader, 'utf8');
  if (!content.includes('#define SWIFT_RETURNS_RETAINED')) {
    content = content.replace(
      '#include <swift/bridging>',
      '#include <swift/bridging>\n#ifndef SWIFT_RETURNS_RETAINED\n#define SWIFT_RETURNS_RETAINED\n#endif'
    );
    fs.writeFileSync(runtimeSchedulerHeader, content, 'utf8');
    console.log('✔ Patched RuntimeScheduler.h: defined SWIFT_RETURNS_RETAINED fallback');
  } else {
    console.log('✔ RuntimeScheduler.h already patched');
  }
} else {
  console.log('ℹ RuntimeScheduler.h not found at:', runtimeSchedulerHeader);
}

console.log('=== ExpoModulesJSI Patch Complete ===');
