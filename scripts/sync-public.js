const fs = require('fs');
const path = require('path');

const rootPublic = path.resolve(__dirname, '../public');
const frontendPublic = path.resolve(__dirname, '../apps/frontend/public');

if (!fs.existsSync(rootPublic)) {
  fs.mkdirSync(rootPublic, { recursive: true });
}
if (!fs.existsSync(frontendPublic)) {
  fs.mkdirSync(frontendPublic, { recursive: true });
}

// 1. Copy from frontend/public to root public (skip uploads)
fs.cpSync(frontendPublic, rootPublic, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(frontendPublic, src);
    if (rel.startsWith('uploads') || rel.includes(`${path.sep}uploads`)) {
      return false;
    }
    return true;
  },
});

// 2. Copy brand from root public to frontend/public
const rootBrand = path.join(rootPublic, 'brand');
const frontendBrand = path.join(frontendPublic, 'brand');
if (fs.existsSync(rootBrand)) {
  fs.cpSync(rootBrand, frontendBrand, { recursive: true });
}

console.log('[sync-public] Successfully synchronized public assets.');
