import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

async function updateImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const updated = content.replace(
      /from ['"]react-router['"]/g,
      'from "react-router-dom"'
    );
    
    if (content !== updated) {
      await fs.writeFile(filePath, updated, 'utf8');
      console.log(`✅ Updated imports in ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function processDirectory(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    let updateCount = 0;
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        updateCount += await processDirectory(fullPath);
      } else if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
        const wasUpdated = await updateImports(fullPath);
        if (wasUpdated) updateCount++;
      }
    }
    
    return updateCount;
  } catch (error) {
    console.error(`❌ Error reading directory ${directory}:`, error);
    return 0;
  }
}

async function main() {
  console.log('🔄 Updating React Router imports...');
  const updateCount = await processDirectory(srcDir);
  console.log(`\n✨ Import updates complete! ${updateCount} files were updated.`);
  
  if (updateCount > 0) {
    console.log('\n✅ All React Router imports have been updated to use react-router-dom');
    console.log('🚀 You can now try building the project again.');
  } else {
    console.log('\nℹ️ No files needed updating. All imports are already using react-router-dom');
  }
}

main().catch(console.error);
