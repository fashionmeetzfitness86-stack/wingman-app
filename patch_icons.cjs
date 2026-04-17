const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'components', 'icons');
const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.tsx'));

let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(iconsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has style prop
  if (content.includes('style?: React.CSSProperties')) {
    skipped++;
    continue;
  }

  // 1. Add style to FC interface: { className?: string } -> { className?: string; style?: React.CSSProperties }
  content = content.replace(
    /React\.FC<\{([^}]*?)className\?:\s*string([^}]*?)\}>/g,
    (match, before, after) => `React.FC<{${before}className?: string; style?: React.CSSProperties${after}}>`
  );

  // 2. Add style to destructure: ({ className = "..." }) -> ({ className = "...", style })
  content = content.replace(
    /\(\{\s*className\s*=\s*"([^"]+)"\s*\}\)/g,
    '({ className = "$1", style })'
  );

  // 3. Add style={style} to svg element after className={className}
  content = content.replace(
    /(<svg[^>]*?)(\s+className=\{className\})/g,
    '$1$2 style={style}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped (already had style prop)`);
