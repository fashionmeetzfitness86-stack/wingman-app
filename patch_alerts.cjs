const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

function replaceAlertsInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceAlertsInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('alert(')) {
                // Ensure we don't break string alerts
                content = content.replace(/alert\(/g, '(window as any).showAppToast?.(');
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${file}`);
            }
        }
    }
}

replaceAlertsInDir(componentsDir);
console.log('Done mapping alert() to showAppToast().');
