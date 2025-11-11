import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FixImportMapPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync('FixImportMapPlugin', (params, callback) => {
      const importMapPath = path.join(__dirname, '../src/app/(payload)/admin/importMap.js');
      
      if (fs.existsSync(importMapPath)) {
        let content = fs.readFileSync(importMapPath, 'utf8');
        const originalContent = content;
        
        // Replace bare module specifiers with correct relative paths
        content = content.replace(
          /from ['"]components\/(Icon|Logo)['"]/g,
          "from '../../../components/$1'"
        );
        
        // Also handle if someone manually changed it to use @/ alias
        content = content.replace(
          /from ['"]@\/components\/(Icon|Logo)['"]/g,
          "from '../../../components/$1'"
        );
        
        // Handle any other incorrect relative paths
        content = content.replace(
          /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components\/(Icon|Logo)['"]/g,
          "from '../../../components/$1'"
        );
        
        if (content !== originalContent) {
          fs.writeFileSync(importMapPath, content, 'utf8');
          console.log('✓ Fixed importMap.js paths (webpack plugin)');
        }
      }
      
      callback();
    });
  }
}

export default FixImportMapPlugin;

