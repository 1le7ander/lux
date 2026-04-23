#!/usr/bin/env node
// Hit a handful of critical routes to verify the production build boots.
//
// Usage:
//   npm run build
//   PORT=3000 npm run start &
//   npm run smoke

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";

const checks = [
  { path: "/", expect: 200 },
  { path: "/shop", expect: 200 },
  { path: "/shop/women", expect: 200 },
  { path: "/product/p3", expect: 200 },
  { path: "/checkout", expect: 200 },
  { path: "/admin/login", expect: 200 },
  { path: "/api/products", expect: 200, json: true },
];

let failures = 0;

for (const c of checks) {
  try {
    const res = await fetch(BASE + c.path);
    const ok = res.status === c.expect;
    if (!ok) {
      console.error(`  ✗ ${c.path} → ${res.status} (expected ${c.expect})`);
      failures++;
      continue;
    }
    if (c.json) {
      const body = await res.json();
      if (!body || typeof body !== "object" || !("success" in body)) {
        console.error(`  ✗ ${c.path} → bad JSON shape`);
        failures++;
        continue;
      }
    }
    console.log(`  • ${c.path} → ${res.status}`);
  } catch (err) {
    console.error(`  ✗ ${c.path} → ${err.message}`);
    failures++;
  }
}

if (failures) {
  console.error(`\nSmoke test FAILED: ${failures} issue(s).`);
  process.exit(1);
}
console.log("\nSmoke test passed.");
