const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(
    /from ['"]react-router['"]/g,
    'from "react-router-dom"'
  );
  
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated imports in ${path.relative(process.cwd(), filePath)}`);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      updateImports(fullPath);
    }
  });
}

console.log('Updating React Router imports...');
processDirectory(srcDir);
console.log('Import updates complete!');
