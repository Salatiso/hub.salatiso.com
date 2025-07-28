# 🚀 The Hub - Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying The Hub to Namecheap Stellar Plus shared hosting with all security measures and optimizations in place.

## 📋 Pre-Deployment Checklist

### ✅ Security Configuration
- [x] Hardcoded API keys removed
- [x] Server-side configuration system implemented
- [x] Input validation and sanitization added
- [x] Rate limiting implemented
- [x] Security headers configured
- [x] Error handling enhanced

### ✅ Performance Optimization
- [x] Build system created for asset minification
- [x] Caching headers configured
- [x] Compression enabled
- [x] Asset optimization implemented

### ✅ Functionality Fixes
- [x] Missing JavaScript modules created
- [x] Broken file references fixed
- [x] Error pages created
- [x] Fallback mechanisms implemented

## 🔧 Deployment Steps

### Step 1: Environment Setup

1. **Create Environment Variables File**
   ```bash
   # Create .env file (not included in repository)
   FIREBASE_API_KEY=your_actual_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GOOGLE_SEARCH_API_KEY=your_google_search_api_key
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
   ```

2. **Update config.php**
   - Replace placeholder values with actual environment variables
   - Ensure production environment detection works correctly

### Step 2: Build for Production

1. **Run Build Script**
   ```bash
   php build.php
   ```
   This will:
   - Minify CSS and JavaScript files
   - Optimize HTML files
   - Add cache busting parameters
   - Create production-ready assets in `dist/` folder

2. **Verify Build Output**
   - Check that all files are present in `dist/` folder
   - Verify minification worked correctly
   - Test that paths are updated properly

### Step 3: Upload to Namecheap

1. **Upload Files via cPanel File Manager or FTP**
   ```
   Upload contents of dist/ folder to public_html/
   
   Directory structure should be:
   public_html/
   ├── index.html
   ├── login.html
   ├── config.php
   ├── config-loader.php
   ├── .htaccess
   ├── 404.html
   ├── assets/
   │   ├── css/
   │   ├── js/
   │   └── videos/
   ├── modules/
   ├── components/
   └── manifest.json
   ```

2. **Set File Permissions**
   ```
   PHP files: 644
   Directories: 755
   .htaccess: 644
   ```

3. **Create Logs Directory**
   ```bash
   mkdir logs
   chmod 755 logs
   ```

### Step 4: Configure Environment Variables

Since Namecheap shared hosting doesn't support environment variables, update `config.php`:

```php
// Replace in config.php production section:
'apiKey' => 'YOUR_ACTUAL_FIREBASE_API_KEY',
'authDomain' => 'YOUR_ACTUAL_AUTH_DOMAIN',
// ... etc
```

### Step 5: Test Deployment

1. **Basic Functionality Test**
   - Visit your domain
   - Test login/signup functionality
   - Navigate through different modules
   - Test file uploads (if applicable)

2. **Security Test**
   - Verify HTTPS redirect works
   - Check security headers are present
   - Test rate limiting
   - Verify sensitive files are protected

3. **Performance Test**
   - Check page load times
   - Verify compression is working
   - Test caching headers
   - Validate asset optimization

## 🔒 Security Configuration

### Firebase Security Rules

Update your Firebase security rules:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public publications
    match /users/{userId}/publications/{docId} {
      allow read: if resource.data.status == 'public';
    }
    
    // Rate limiting
    match /{document=**} {
      allow read, write: if request.auth != null 
        && request.time > resource.data.lastRequest + duration.value(1, 's');
    }
  }
}

// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

### Content Security Policy

The CSP is configured in `.htaccess`. Adjust domains as needed:

```apache
Header always set Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://www.gstatic.com https://cdn.quilljs.com https://cdn.jsdelivr.net https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.quilljs.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://storage.googleapis.com;"
```

## 🔧 Troubleshooting

### Common Issues

1. **Configuration Not Loading**
   - Check that `config-loader.php` is accessible
   - Verify PHP is working on your hosting
   - Check browser console for errors

2. **Firebase Connection Issues**
   - Verify API keys are correct
   - Check Firebase project settings
   - Ensure domains are whitelisted in Firebase

3. **File Upload Issues**
   - Check PHP upload limits
   - Verify file permissions
   - Check Firebase Storage rules

4. **Performance Issues**
   - Verify compression is enabled
   - Check caching headers
   - Optimize images and assets

### Debug Mode

To enable debug mode, update `config.php`:

```php
'app' => [
    'environment' => 'production',
    'baseUrl' => 'https://hub.salatiso.com',
    'debug' => true // Set to true for debugging
]
```

## 📊 Monitoring

### Log Files

Monitor these log files:
- `logs/security.log` - Security events
- `logs/php_errors.log` - PHP errors
- Server access logs (via cPanel)

### Performance Monitoring

Use tools like:
- Google PageSpeed Insights
- GTmetrix
- Pingdom

## 🔄 Updates and Maintenance

### Regular Updates

1. **Weekly**
   - Check security logs
   - Monitor performance metrics
   - Update dependencies if needed

2. **Monthly**
   - Review and rotate API keys
   - Update Firebase security rules
   - Performance optimization review

3. **Quarterly**
   - Full security audit
   - Backup verification
   - Disaster recovery testing

### Backup Strategy

1. **Automated Backups**
   - Use cPanel backup features
   - Set up Firebase project backups
   - Regular database exports

2. **Manual Backups**
   - Before major updates
   - Before configuration changes
   - Monthly full site backup

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review log files
3. Test in staging environment
4. Contact technical support if needed

## 🎯 Success Metrics

After deployment, verify:
- [ ] Site loads in under 3 seconds
- [ ] All modules function correctly
- [ ] Security headers are present
- [ ] SSL certificate is active
- [ ] Error pages work correctly
- [ ] Mobile responsiveness works
- [ ] All forms submit successfully
- [ ] File uploads work (if applicable)

---

**Last Updated:** July 28, 2025
**Version:** 1.0.0