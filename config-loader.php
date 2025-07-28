<?php
/* ================================================================================= */
/* FILE: config-loader.php - Dynamic Configuration Loader                           */
/* PURPOSE: Serves configuration to JavaScript with proper security                 */
/* ================================================================================= */

define('CONFIG_ACCESS', true);
require_once 'config.php';

// Set appropriate headers
header('Content-Type: application/javascript');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');

// Rate limiting
$identifier = $_SERVER['REMOTE_ADDR'] . '_config';
checkRateLimit($identifier, 30, 60); // 30 requests per minute for config

// Log configuration access
logSecurityEvent('config_access', [
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
    'referer' => $_SERVER['HTTP_REFERER'] ?? 'direct'
]);

// Output the configuration
echo exportConfigForJS();
?>