import fs from 'fs';
import path from 'path';

if (fs.existsSync('./src/pages')) {
    fs.renameSync('./src/pages', './src/views');
}

function fixImports(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('@/pages/')) {
                fs.writeFileSync(fullPath, content.replaceAll('@/pages/', '@/views/'));
                console.log('Fixed imports in', fullPath);
            }
        }
    }
}
fixImports('./src');
