// Merges the two Vite builds into one deployable folder:
//   7_Customer_Website/dist  →  dist/            (foodmela.online/)
//   6_Admin_Website/dist     →  dist/admin/      (foodmela.online/admin)
// Run via: npm run build:all
import { rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const customerDist = join(root, '7_Customer_Website', 'dist');
const adminDist = join(root, '6_Admin_Website', 'dist');
const out = join(root, 'dist');

if (!existsSync(customerDist)) {
  console.error('Missing customer build: 7_Customer_Website/dist — did `vite build` fail?');
  process.exit(1);
}
if (!existsSync(adminDist)) {
  console.error('Missing admin build: 6_Admin_Website/dist — did `vite build` fail?');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'admin'), { recursive: true });
cpSync(customerDist, out, { recursive: true });
cpSync(adminDist, join(out, 'admin'), { recursive: true });

// Rider Flutter web (prebuilt 2_Rider_Web folder) → dist/rider-app (SPA route /rider-app/)
const riderWebPrebuilt = join(root, '2_Rider_Web');
if (existsSync(join(riderWebPrebuilt, 'index.html'))) {
  cpSync(riderWebPrebuilt, join(out, 'rider-app'), { recursive: true });
} else {
  // Fallback: raw Flutter source build output (if available)
  const riderWebDist = join(root, '2_Rider_App', 'build', 'web');
  if (existsSync(riderWebDist)) {
    cpSync(riderWebDist, join(out, 'rider-app'), { recursive: true });
  }
}

// Guarantee sitemap.xml and robots.txt are at output root
const customerPublic = join(root, '7_Customer_Website', 'public');
if (existsSync(join(customerPublic, 'sitemap.xml'))) {
  cpSync(join(customerPublic, 'sitemap.xml'), join(out, 'sitemap.xml'));
}
if (existsSync(join(customerPublic, 'robots.txt'))) {
  cpSync(join(customerPublic, 'robots.txt'), join(out, 'robots.txt'));
}

const riderPresent = existsSync(join(out, 'rider-app'));
console.log(`✅ Merged single-domain build → dist/ (+ dist/admin/${riderPresent ? ' + dist/rider-app/' : ''} + sitemap + robots)`);
