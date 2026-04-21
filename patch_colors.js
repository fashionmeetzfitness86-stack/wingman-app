const fs = require('fs');
const path = require('path');

const directory = './components';
const appFile = './App.tsx';
const indexHtml = './index.html';

const colorReplacements = [
    // Pink/purple to white/steel/charcoal
    { regex: /bg-purple-600/g, replacement: 'bg-white text-black hover:bg-gray-200' },
    { regex: /bg-purple-500/g, replacement: 'bg-gray-200 text-black hover:bg-white' },
    { regex: /text-purple-400/g, replacement: 'text-gray-300' },
    { regex: /text-purple-500/g, replacement: 'text-white' },
    { regex: /text-purple-600/g, replacement: 'text-gray-400' },
    { regex: /text-pink-500/g, replacement: 'text-white' },
    { regex: /text-pink-400/g, replacement: 'text-gray-300' },
    { regex: /bg-pink-500\/10/g, replacement: 'bg-white/10' },
    { regex: /bg-pink-500\/80/g, replacement: 'bg-white/80 text-black' },
    { regex: /bg-pink-500/g, replacement: 'bg-white text-black hover:bg-gray-200' },
    { regex: /bg-pink-600/g, replacement: 'bg-gray-200 text-black hover:bg-white' },
    { regex: /bg-fuchsia-\d00/g, replacement: 'bg-white text-black' },
    { regex: /text-fuchsia-\d00/g, replacement: 'text-white' },
    
    // Hex colors
    { regex: /#E040FB/g, replacement: '#FFFFFF' },
    { regex: /#EC4899/g, replacement: '#FFFFFF' },
    { regex: /#d8428a/g, replacement: '#E5E5E5' },
    
    // Borders
    { regex: /border-purple-500\/50/g, replacement: 'border-white/20' },
    { regex: /border-\[\#EC4899\]\/30/g, replacement: 'border-white/10' },
    { regex: /border-\[\#EC4899\]\/50/g, replacement: 'border-white/20' },
    { regex: /border-\[\#EC4899\]/g, replacement: 'border-white' },
    { regex: /focus:ring-purple-500/g, replacement: 'focus:ring-white/50' },
    { regex: /focus:ring-\[\#EC4899\]/g, replacement: 'focus:ring-white/50' },
    { regex: /focus:border-\[\#EC4899\]/g, replacement: 'focus:border-white/50' },

    // Gradients
    { regex: /bg-gradient-to-r from-purple-500 to-pink-500/g, replacement: 'bg-white text-black' },
    { regex: /bg-gradient-to-r from-fuchsia-500 to-cyan-500/g, replacement: 'bg-zinc-800 border border-zinc-700 text-white' },
    { regex: /bg-gradient-to-[a-z] from-\[\#E040FB\] via-\[\#7B61FF\] to-\[\#00D4FF\]/g, replacement: 'bg-zinc-800' },
    
    // Border Radius
    { regex: /rounded-2xl/g, replacement: 'rounded-lg' },
    { regex: /rounded-full/g, replacement: 'rounded-md' }, // cautious with this, might break avatars
];

const textReplacements = [
    { regex: /Browse experiences/gi, replacement: 'View Experiences' },
    { regex: /Browse Experiences/g, replacement: 'View Experiences' },
    { regex: /Join the experience/gi, replacement: 'Join' },
    { regex: /Join the Experience/g, replacement: 'Join' },
    { regex: /Limited spots available/gi, replacement: 'Limited Access' },
    { regex: /Great night out/gi, replacement: '' },
    { regex: /Curated VIP table/gi, replacement: 'Curated VIP table' },
    { regex: /Active/g, replacement: 'Access Granted' }, // cautious
    { regex: /Pending/g, replacement: 'Under Review' }, // cautious
    { regex: /Rejected/g, replacement: 'Restricted' }, // cautious
    { regex: /Access Pending/g, replacement: 'Under Review' },
    { regex: /Access Active/g, replacement: 'Access Granted' },
    { regex: /You can /g, replacement: '' },
    { regex: /Feel free to /g, replacement: '' },
    { regex: /We recommend /g, replacement: '' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Apply color replacements
    colorReplacements.forEach(({regex, replacement}) => {
        content = content.replace(regex, replacement);
    });

    // Fix up rounded-md for specific buttons, but we need to be careful with avatars.
    // Let's do it manually on `index.css` and for buttons specifically if we can.
    
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
processFile(appFile);
processFile(indexHtml);
