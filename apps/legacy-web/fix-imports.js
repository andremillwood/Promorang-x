const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix type imports from @/shared/types
    const typeImportRegex = /import\s*\{([^}]*)\}\s*from\s*['"]@\/shared\/types['"]/g;
    const typeReplacer = (match, types) => {
      const typeOnly = types.split(',').map(t => t.trim()).some(t => /^[A-Z]/.test(t));
      modified = true;
      return typeOnly 
        ? `import type {${types}} from '../../shared/types'`
        : `import {${types}} from '../../shared/types'`;
    };
    
    content = content.replace(typeImportRegex, typeReplacer);

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

function walkDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

console.log('Fixing import statements...');
walkDirectory(rootDir);
console.log('Import fixes completed!');
