const fs = require('fs');
const path = require('path');

const deprecated = [
  'components/ExclusiveExperiencesPage.tsx',
  'components/ExperienceBookingFlow.tsx',
  'components/EventBookingFlow.tsx',
];

for (const rel of deprecated) {
  const fp = path.join(__dirname, rel);
  if (!fs.existsSync(fp)) { console.log('Not found:', rel); continue; }
  let content = fs.readFileSync(fp, 'utf8');
  if (content.includes('DEPRECATED')) { console.log('Already deprecated:', rel); continue; }
  const header = `// DEPRECATED — kept for rollback. Do not import directly.\n// Superseded by WingmanEventFeed.tsx / FeaturedVenuesPage.tsx\n\n`;
  fs.writeFileSync(fp, header + content, 'utf8');
  console.log('Marked:', rel);
}
console.log('Done.');
