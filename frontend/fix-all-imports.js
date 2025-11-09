import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, 'src');

async function processFile(filePath) {
  try {
    let content = await fs.promises.readFile(filePath, 'utf8');
    let modified = false;

    // Fix type imports from @/shared/types
    const typeImportRegex = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]@\/shared\/types['"]/g;
    
    content = content.replace(typeImportRegex, (match, types) => {
      // Check if any of the imported items are types (PascalCase)
      const typeOnly = types.split(',').some(t => /^\s*[A-Z]/.test(t));
      modified = true;
      
      // Calculate relative path
      const relativePath = path.relative(
        path.dirname(filePath),
        path.join(rootDir, 'shared')
      ).replace(/\\/g, '/');
      
      const prefix = relativePath.startsWith('..') ? relativePath : `./${relativePath}`;
      
      return typeOnly 
        ? `import type {${types}} from '${prefix}/types'`
        : `import {${types}} from '${prefix}/types'`;
    });

    if (modified) {
      await fs.promises.writeFile(filePath, content, 'utf8');
      console.log(`Fixed imports in ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function walkDirectory(directory) {
  let count = 0;
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      count += await walkDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const modified = await processFile(fullPath);
      if (modified) count++;
    }
  }
  
  return count;
}

console.log('Fixing import statements...');
walkDirectory(rootDir)
  .then(count => {
    console.log(`✅ Successfully updated imports in ${count} files`);
    console.log('✨ All done! You can now restart your development server.');
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
