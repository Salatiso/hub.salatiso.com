#!/usr/bin/env node

/**
 * Migration Script for Vite Setup
 * This script helps migrate the existing project structure to work with Vite
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vite Migration...\n');

// Create src directory if it doesn't exist
if (!fs.existsSync('src')) {
    fs.mkdirSync('src');
    console.log('✅ Created src/ directory');
}

// Files and folders to move to src/
const itemsToMove = [
    'assets',
    'components', 
    'modules',
    'index.html',
    'about.html',
    'login.html',
    'register.html',
    'resources.html',
    'quiz.html',
    '404.html'
];

// Move items to src/
itemsToMove.forEach(item => {
    const sourcePath = path.join('.', item);
    const destPath = path.join('src', item);
    
    if (fs.existsSync(sourcePath)) {
        try {
            // Check if destination already exists
            if (fs.existsSync(destPath)) {
                console.log(`⚠️  ${item} already exists in src/, skipping...`);
                return;
            }
            
            // Move the item
            fs.renameSync(sourcePath, destPath);
            console.log(`✅ Moved ${item} to src/`);
        } catch (error) {
            console.log(`❌ Failed to move ${item}: ${error.message}`);
        }
    } else {
        console.log(`⚠️  ${item} not found, skipping...`);
    }
});

// Update HTML files to use correct asset paths
console.log('\n🔧 Updating asset paths in HTML files...');

function updateHtmlPaths(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Update asset paths - remove leading slash for relative paths
        content = content.replace(/src="\/assets\//g, 'src="./assets/');
        content = content.replace(/href="\/assets\//g, 'href="./assets/');
        
        // Update component includes if any
        content = content.replace(/src="\/components\//g, 'src="./components/');
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated paths in ${path.basename(filePath)}`);
    } catch (error) {
        console.log(`❌ Failed to update ${filePath}: ${error.message}`);
    }
}

// Update HTML files in src directory
const htmlFiles = [
    'src/index.html',
    'src/about.html', 
    'src/login.html',
    'src/register.html',
    'src/resources.html',
    'src/quiz.html',
    'src/404.html'
];

htmlFiles.forEach(updateHtmlPaths);

// Update module HTML files
if (fs.existsSync('src/modules')) {
    const moduleFiles = fs.readdirSync('src/modules')
        .filter(file => file.endsWith('.html'))
        .map(file => path.join('src/modules', file));
    
    moduleFiles.forEach(updateHtmlPaths);
}

// Create a backup of important files
console.log('\n📦 Creating backup of legacy files...');

const legacyFiles = [
    'config.php',
    'config-loader.php', 
    'build.php',
    '.htaccess'
];

if (!fs.existsSync('legacy-backup')) {
    fs.mkdirSync('legacy-backup');
}

legacyFiles.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.copyFileSync(file, path.join('legacy-backup', file));
            console.log(`✅ Backed up ${file}`);
        } catch (error) {
            console.log(`❌ Failed to backup ${file}: ${error.message}`);
        }
    }
});

console.log('\n🎉 Migration completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Add your Firebase credentials to .env.development and .env.production');
console.log('3. Test with: npm run dev');
console.log('4. Build with: npm run build');
console.log('5. Deploy with: npm run deploy');
console.log('\n📖 See VITE_SETUP_GUIDE.md for detailed instructions');