const fs = require('fs');
const path = require('path');

console.log('=== Running Expo & Xcode 16.2 Compatibility Patches ===');

// 1. Patch expo-modules-jsi Package.swift (swift-tools-version: 6.0 & strip trailing commas)
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

// 3. Patch expo-contacts: Force build from source and remove infected prebuilds
// (Prebuilt ExpoContacts.tar.gz in expo-contacts@57.0.5 was built with an Xcode 16 bug
// that dynamically links @rpath/Testing.framework, causing crash on device launch)
const contactsPrebuilds = path.join(__dirname, '..', 'node_modules', 'expo-contacts', 'prebuilds');
if (fs.existsSync(contactsPrebuilds)) {
  fs.rmSync(contactsPrebuilds, { recursive: true, force: true });
  console.log('✔ Removed expo-contacts prebuilds directory to force clean source compilation');
} else {
  console.log('✔ expo-contacts prebuilds directory already absent');
}

// Strip test_spec from ExpoContacts.podspec to prevent test framework linkage
const contactsPodspec = path.join(__dirname, '..', 'node_modules', 'expo-contacts', 'ios', 'ExpoContacts.podspec');
if (fs.existsSync(contactsPodspec)) {
  let content = fs.readFileSync(contactsPodspec, 'utf8');
  if (content.includes("test_spec 'Tests'")) {
    content = content.replace(/s\.test_spec 'Tests' do \|test_spec\|[\s\S]*?end\n/g, '');
    fs.writeFileSync(contactsPodspec, content, 'utf8');
    console.log('✔ Stripped test_spec from ExpoContacts.podspec');
  } else {
    console.log('✔ ExpoContacts.podspec already clean of test_spec');
  }
}

console.log('=== Expo & Xcode 16.2 Compatibility Patches Complete ===');

