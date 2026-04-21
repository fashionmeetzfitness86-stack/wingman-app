const fs = require('fs');
const path = require('path');

const directory = './components';

const colorReplacements = [
    // Hex colors
    { regex: /#E040FB/gi, replacement: '#FFFFFF' },
    { regex: /#7B61FF/gi, replacement: '#9CA3AF' },
    { regex: /#00D4FF/gi, replacement: '#374151' },
    { regex: /#A855F7/gi, replacement: '#9CA3AF' }, // Purple
    { regex: /#EC4899/gi, replacement: '#9CA3AF' }, // Pink
    
    // RGB components (for rgba)
    // Fuchsia
    { regex: /224,\s*64,\s*251/g, replacement: '255,255,255' },
    // Pink
    { regex: /236,\s*72,\s*153/g, replacement: '156,163,175' },
    // Cyan
    { regex: /0,\s*212,\s*255/g, replacement: '55,65,81' },
    // Purple
    { regex: /168,\s*85,\s*247/g, replacement: '156,163,175' },
    
    // Legacy Tailwind border classes if left
    { regex: /border-pink-[0-9]{3}(\/[0-9]{2})?/g, replacement: 'border-gray-500' },
    { regex: /border-purple-[0-9]{3}(\/[0-9]{2})?/g, replacement: 'border-gray-500' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    colorReplacements.forEach(({regex, replacement}) => {
        content = content.replace(regex, replacement);
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    });
}

traverseDir(directory);
