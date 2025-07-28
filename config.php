<?php
/* ================================================================================= */
/* FILE: config.php - Server-side Configuration Management                          */
/* PURPOSE: Secure configuration for production deployment on shared hosting        */
/* ================================================================================= */

// Prevent direct access
if (!defined('CONFIG_ACCESS')) {
    http_response_code(403);
    die('Direct access not allowed');
}

// Environment detection
$environment = $_SERVER['HTTP_HOST'] ?? 'localhost';
$isProduction = strpos($environment, 'salatiso.com') !== false || strpos($environment, 'hub.salatiso.com') !== false;
$isStaging = strpos($environment, 'staging') !== false;

// Configuration based on environment
if ($isProduction) {
    $config = [
        'firebase' => [
            'apiKey' => getenv('FIREBASE_API_KEY') ?: 'AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI',
            'authDomain' => getenv('FIREBASE_AUTH_DOMAIN') ?: 'lifecv-d2724.firebaseapp.com',
            'projectId' => getenv('FIREBASE_PROJECT_ID') ?: 'lifecv-d2724',
            'storageBucket' => getenv('FIREBASE_STORAGE_BUCKET') ?: 'lifecv-d2724.appspot.com',
            'messagingSenderId' => getenv('FIREBASE_MESSAGING_SENDER_ID') ?: '1039752653127',
            'appId' => getenv('FIREBASE_APP_ID') ?: '1:1039752653127:web:54afa09b21c98ef231c462',
            'measurementId' => getenv('FIREBASE_MEASUREMENT_ID') ?: 'G-BDCNHBQTR2'
        ],
        'google' => [
            'mapsApiKey' => getenv('GOOGLE_MAPS_API_KEY') ?: 'AIzaSyDCaHv8AC2iqwk8ijt377Nfe3gMR54WLX4',
            'searchApiKey' => getenv('GOOGLE_SEARCH_API_KEY') ?: 'AIzaSyDfm0Bvir6j_72RdxfxZYfGjWdJNXvwK9k',
            'searchEngineId' => getenv('GOOGLE_SEARCH_ENGINE_ID') ?: '5122dffc3f9614d0a'
        ],
        'app' => [
            'environment' => 'production',
            'baseUrl' => 'https://hub.salatiso.com',
            'debug' => false
        ]
    ];
} elseif ($isStaging) {
    $config = [
        'firebase' => [
            'apiKey' => getenv('FIREBASE_API_KEY_STAGING') ?: 'staging-key',
            'authDomain' => 'lifecv-staging.firebaseapp.com',
            'projectId' => 'lifecv-staging',
            'storageBucket' => 'lifecv-staging.appspot.com',
            'messagingSenderId' => '1039752653127',
            'appId' => 'staging-app-id',
            'measurementId' => 'staging-measurement-id'
        ],
        'google' => [
            'mapsApiKey' => getenv('GOOGLE_MAPS_API_KEY_STAGING') ?: 'staging-maps-key',
            'searchApiKey' => getenv('GOOGLE_SEARCH_API_KEY_STAGING') ?: 'staging-search-key',
            'searchEngineId' => 'staging-search-engine-id'
        ],
        'app' => [
            'environment' => 'staging',
            'baseUrl' => 'https://staging.hub.salatiso.com',
            'debug' => true
        ]
    ];
} else {
    // Development/localhost
    $config = [
        'firebase' => [
            'apiKey' => 'dev-api-key',
            'authDomain' => 'localhost',
            'projectId' => 'dev-project',
            'storageBucket' => 'dev-storage',
            'messagingSenderId' => 'dev-sender',
            'appId' => 'dev-app-id',
            'measurementId' => 'dev-measurement'
        ],
        'google' => [
            'mapsApiKey' => 'dev-maps-key',
            'searchApiKey' => 'dev-search-key',
            'searchEngineId' => 'dev-search-engine'
        ],
        'app' => [
            'environment' => 'development',
            'baseUrl' => 'http://localhost',
            'debug' => true
        ]
    ];
}

// Security headers
function setSecurityHeaders() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // Only set HTTPS headers in production
    global $isProduction;
    if ($isProduction) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        header('Content-Security-Policy: default-src \'self\' https:; script-src \'self\' \'unsafe-inline\' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://www.gstatic.com https://cdn.quilljs.com https://cdn.jsdelivr.net https://maps.googleapis.com; style-src \'self\' \'unsafe-inline\' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.quilljs.com; font-src \'self\' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src \'self\' data: https:; connect-src \'self\' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://storage.googleapis.com;');
    }
}

// Input sanitization
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return $input;
}

// Rate limiting
function checkRateLimit($identifier, $maxRequests = 60, $timeWindow = 60) {
    $rateLimitFile = sys_get_temp_dir() . '/rate_limit_' . md5($identifier);
    $currentTime = time();
    
    if (file_exists($rateLimitFile)) {
        $data = json_decode(file_get_contents($rateLimitFile), true);
        $requests = array_filter($data['requests'], function($timestamp) use ($currentTime, $timeWindow) {
            return ($currentTime - $timestamp) < $timeWindow;
        });
        
        if (count($requests) >= $maxRequests) {
            http_response_code(429);
            die(json_encode(['error' => 'Rate limit exceeded']));
        }
        
        $requests[] = $currentTime;
    } else {
        $requests = [$currentTime];
    }
    
    file_put_contents($rateLimitFile, json_encode(['requests' => $requests]));
}

// Logging function
function logSecurityEvent($event, $details = []) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => $event,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'details' => $details
    ];
    
    $logFile = __DIR__ . '/logs/security.log';
    if (!file_exists(dirname($logFile))) {
        mkdir(dirname($logFile), 0755, true);
    }
    
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

// Get configuration as JSON
function getConfigAsJson() {
    global $config;
    header('Content-Type: application/json');
    return json_encode($config);
}

// Export configuration for JavaScript
function exportConfigForJS() {
    global $config;
    
    $jsConfig = "
    // Auto-generated configuration - DO NOT EDIT MANUALLY
    window.APP_CONFIG = " . json_encode($config, JSON_PRETTY_PRINT) . ";
    
    // Configuration validation
    if (!window.APP_CONFIG.firebase.apiKey || window.APP_CONFIG.firebase.apiKey === 'dev-api-key') {
        console.warn('Using development Firebase configuration');
    }
    
    console.log('Configuration loaded for environment:', window.APP_CONFIG.app.environment);
    ";
    
    return $jsConfig;
}

// Initialize
setSecurityHeaders();

// Rate limiting for API endpoints
if (isset($_GET['api']) || isset($_POST['api'])) {
    $identifier = $_SERVER['REMOTE_ADDR'] . '_' . ($_SERVER['HTTP_USER_AGENT'] ?? '');
    checkRateLimit($identifier);
}
?>