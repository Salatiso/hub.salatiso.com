<?php
/* ================================================================================= */
/* FILE: build.php - Production Build System                                        */
/* PURPOSE: Minify and optimize assets for production deployment                    */
/* ================================================================================= */

class ProductionBuilder {
    private $sourceDir;
    private $buildDir;
    private $config;
    
    public function __construct($sourceDir = '.', $buildDir = 'dist') {
        $this->sourceDir = rtrim($sourceDir, '/');
        $this->buildDir = rtrim($buildDir, '/');
        $this->config = [
            'minify_js' => true,
            'minify_css' => true,
            'optimize_html' => true,
            'generate_manifest' => true,
            'copy_assets' => true
        ];
    }
    
    public function build() {
        echo "Starting production build...\n";
        
        // Create build directory
        $this->createBuildDirectory();
        
        // Process files
        $this->processHTML();
        $this->processCSS();
        $this->processJS();
        $this->copyAssets();
        $this->generateManifest();
        
        echo "Build completed successfully!\n";
    }
    
    private function createBuildDirectory() {
        if (!file_exists($this->buildDir)) {
            mkdir($this->buildDir, 0755, true);
        }
        
        // Create subdirectories
        $dirs = ['assets/css', 'assets/js', 'assets/js/modules', 'modules', 'components'];
        foreach ($dirs as $dir) {
            $fullPath = $this->buildDir . '/' . $dir;
            if (!file_exists($fullPath)) {
                mkdir($fullPath, 0755, true);
            }
        }
    }
    
    private function processHTML() {
        echo "Processing HTML files...\n";
        
        $htmlFiles = $this->findFiles('*.html');
        foreach ($htmlFiles as $file) {
            $content = file_get_contents($file);
            
            if ($this->config['optimize_html']) {
                $content = $this->minifyHTML($content);
            }
            
            // Update asset paths for production
            $content = $this->updateAssetPaths($content);
            
            // Add cache busting
            $content = $this->addCacheBusting($content);
            
            $outputPath = $this->buildDir . '/' . str_replace($this->sourceDir . '/', '', $file);
            $this->ensureDirectoryExists(dirname($outputPath));
            file_put_contents($outputPath, $content);
        }
    }
    
    private function processCSS() {
        echo "Processing CSS files...\n";
        
        $cssFiles = $this->findFiles('assets/css/*.css');
        foreach ($cssFiles as $file) {
            $content = file_get_contents($file);
            
            if ($this->config['minify_css']) {
                $content = $this->minifyCSS($content);
            }
            
            $outputPath = $this->buildDir . '/' . str_replace($this->sourceDir . '/', '', $file);
            $this->ensureDirectoryExists(dirname($outputPath));
            file_put_contents($outputPath, $content);
        }
    }
    
    private function processJS() {
        echo "Processing JavaScript files...\n";
        
        $jsFiles = $this->findFiles('assets/js/*.js');
        $jsModules = $this->findFiles('assets/js/modules/*.js');
        $allJsFiles = array_merge($jsFiles, $jsModules);
        
        foreach ($allJsFiles as $file) {
            $content = file_get_contents($file);
            
            if ($this->config['minify_js']) {
                $content = $this->minifyJS($content);
            }
            
            $outputPath = $this->buildDir . '/' . str_replace($this->sourceDir . '/', '', $file);
            $this->ensureDirectoryExists(dirname($outputPath));
            file_put_contents($outputPath, $content);
        }
    }
    
    private function copyAssets() {
        echo "Copying assets...\n";
        
        // Copy PHP files
        $phpFiles = $this->findFiles('*.php');
        foreach ($phpFiles as $file) {
            $outputPath = $this->buildDir . '/' . str_replace($this->sourceDir . '/', '', $file);
            copy($file, $outputPath);
        }
        
        // Copy other assets
        $assetDirs = ['assets/videos', 'components'];
        foreach ($assetDirs as $dir) {
            if (is_dir($dir)) {
                $this->copyDirectory($dir, $this->buildDir . '/' . $dir);
            }
        }
        
        // Copy root files
        $rootFiles = ['favicon.ico', '.htaccess'];
        foreach ($rootFiles as $file) {
            if (file_exists($file)) {
                copy($file, $this->buildDir . '/' . $file);
            }
        }
    }
    
    private function generateManifest() {
        echo "Generating build manifest...\n";
        
        $manifest = [
            'build_time' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'files' => [],
            'checksums' => []
        ];
        
        $allFiles = $this->findFiles($this->buildDir . '/*', true);
        foreach ($allFiles as $file) {
            $relativePath = str_replace($this->buildDir . '/', '', $file);
            $manifest['files'][] = $relativePath;
            $manifest['checksums'][$relativePath] = md5_file($file);
        }
        
        file_put_contents($this->buildDir . '/manifest.json', json_encode($manifest, JSON_PRETTY_PRINT));
    }
    
    private function minifyHTML($html) {
        // Remove comments
        $html = preg_replace('/<!--(?!<!)[^\[>].*?-->/s', '', $html);
        
        // Remove extra whitespace
        $html = preg_replace('/\s+/', ' ', $html);
        $html = preg_replace('/>\s+</', '><', $html);
        
        return trim($html);
    }
    
    private function minifyCSS($css) {
        // Remove comments
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
        
        // Remove extra whitespace
        $css = str_replace(["\r\n", "\r", "\n", "\t"], '', $css);
        $css = preg_replace('/\s+/', ' ', $css);
        $css = str_replace(['; ', ' {', '{ ', ' }', '} ', ': ', ', '], [';', '{', '{', '}', '}', ':', ','], $css);
        
        return trim($css);
    }
    
    private function minifyJS($js) {
        // Basic JS minification (for production, consider using a proper minifier)
        
        // Remove single-line comments (but preserve URLs)
        $js = preg_replace('/(?<!:)\/\/.*$/m', '', $js);
        
        // Remove multi-line comments
        $js = preg_replace('/\/\*[\s\S]*?\*\//', '', $js);
        
        // Remove extra whitespace
        $js = preg_replace('/\s+/', ' ', $js);
        
        // Remove spaces around operators and punctuation
        $js = str_replace([' = ', ' + ', ' - ', ' * ', ' / ', ' { ', ' } ', ' ( ', ' ) ', ' [ ', ' ] ', ' ; ', ' , '], 
                         ['=', '+', '-', '*', '/', '{', '}', '(', ')', '[', ']', ';', ','], $js);
        
        return trim($js);
    }
    
    private function updateAssetPaths($content) {
        // Update relative paths for production
        $content = str_replace('src="../assets/', 'src="assets/', $content);
        $content = str_replace('href="../assets/', 'href="assets/', $content);
        
        return $content;
    }
    
    private function addCacheBusting($content) {
        $version = time(); // Use timestamp for cache busting
        
        // Add version to CSS files
        $content = preg_replace('/href="([^"]+\.css)"/', 'href="$1?v=' . $version . '"', $content);
        
        // Add version to JS files
        $content = preg_replace('/src="([^"]+\.js)"/', 'src="$1?v=' . $version . '"', $content);
        
        return $content;
    }
    
    private function findFiles($pattern, $recursive = false) {
        if ($recursive) {
            $files = [];
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($pattern));
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $files[] = $file->getPathname();
                }
            }
            return $files;
        } else {
            return glob($pattern);
        }
    }
    
    private function ensureDirectoryExists($dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }
    }
    
    private function copyDirectory($src, $dst) {
        if (!file_exists($dst)) {
            mkdir($dst, 0755, true);
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($src, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($iterator as $item) {
            $target = $dst . DIRECTORY_SEPARATOR . $iterator->getSubPathName();
            if ($item->isDir()) {
                if (!file_exists($target)) {
                    mkdir($target, 0755, true);
                }
            } else {
                copy($item, $target);
            }
        }
    }
}

// CLI usage
if (php_sapi_name() === 'cli') {
    $builder = new ProductionBuilder();
    $builder->build();
} else {
    echo "This script should be run from the command line.\n";
    echo "Usage: php build.php\n";
}
?>