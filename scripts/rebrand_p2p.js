const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../apps/web/src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    { target: /OWOX Data Marts/g, replacement: "P2P Digital" },
    { target: /OWOX BI/g, replacement: "P2P Digital BI" },
    { target: /Get to know OWOX/g, replacement: "Làm quen với nền tảng" },
    { target: /OWOX extension/g, replacement: "P2P extension" },
    { target: /OWOX documentation/g, replacement: "P2P documentation" },
    { target: /OWOX Logo/g, replacement: "P2P Digital Logo" },
    { target: /OWOX Reports/g, replacement: "P2P Reports" },
    { target: /in OWOX\./g, replacement: "in P2P Digital." },
    { target: /with OWOX\./g, replacement: "with P2P Digital." },
    { target: /Authorize OWOX/g, replacement: "Authorize P2P Digital" },
    { target: /OWOX will request/g, replacement: "P2P Digital will request" },
    { target: /OWOX will only access/g, replacement: "P2P Digital will only access" },
    { target: /connect OWOX to/g, replacement: "connect P2P Digital to" },
];

let replacedFiles = 0;

walkDir(srcDir, function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.md')) {
        let originalContent = fs.readFileSync(filePath, 'utf8');
        let content = originalContent;

        replacements.forEach(({ target, replacement }) => {
            content = content.replace(target, replacement);
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Rebranded ${path.basename(filePath)}`);
            replacedFiles++;
        }
    }
});

console.log(`\nRebranding complete. Updated ${replacedFiles} files.`);
