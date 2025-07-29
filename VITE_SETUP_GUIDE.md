# Vite Setup Guide for The Hub by Salatiso

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the environment files and add your Firebase credentials:

**For Development:**
```bash
# Edit .env.development
VITE_FIREBASE_API_KEY=your-actual-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... add other Firebase config values
```

**For Production:**
```bash
# Edit .env.production  
VITE_FIREBASE_API_KEY=your-actual-prod-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... add other Firebase config values
```

### 3. Restructure Your Project

**Move these folders/files into a new `src` folder:**
- `assets/`
- `components/`
- `modules/`
- All `.html` files (index.html, about.html, etc.)

**Your structure should look like:**
```
hub.salatiso.com/
├── src/
│   ├── assets/
│   ├── components/
│   ├── modules/
│   ├── index.html
│   ├── about.html
│   └── ... other html files
├── dist/ (created after build)
├── node_modules/ (created after npm install)
├── .env.development
├── .env.production
├── firebase.json
├── package.json
├── vite.config.js
└── .gitignore
```

## 🛠️ Development Workflow

### Start Development Server
```bash
npm run dev
```
- Opens at `http://localhost:3000`
- Hot reload enabled
- Uses `.env.development` configuration

### Build for Production
```bash
npm run build
```
- Creates optimized files in `dist/` folder
- Uses `.env.production` configuration
- Minifies and bundles all assets

### Preview Production Build
```bash
npm run preview
```
- Serves the built `dist/` folder locally
- Test production build before deployment

### Deploy to Firebase
```bash
npm run deploy
```
- Builds and deploys in one command
- Uploads `dist/` folder to Firebase Hosting

## 🔧 Configuration Details

### Environment Variables
Vite automatically loads environment variables based on the mode:
- Development: `.env.development`
- Production: `.env.production`

All variables must be prefixed with `VITE_` to be accessible in the browser.

### Firebase Configuration
The new configuration system (`src/assets/js/firebase-config-vite.js`):
- ✅ Uses environment variables
- ✅ Validates configuration on startup
- ✅ Provides fallbacks for development
- ✅ Includes security utilities
- ✅ Supports both development and production

### Vite Configuration
The `vite.config.js` file:
- Automatically finds all HTML files
- Configures multi-page application
- Sets up proper asset handling
- Optimizes for production builds

## 🔒 Security Features

### Environment-Based Security
- Rate limiting enabled in production
- Debug mode disabled in production
- Analytics only in production
- Secure error handling

### Build-Time Security
- Environment variables are bundled securely
- No server-side dependencies
- Optimized and minified code
- Proper caching headers

## 🚀 Deployment

### Firebase Hosting
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

3. **Your site will be live at:**
   - Firebase URL: `https://your-project.web.app`
   - Custom domain: `https://salatiso.com` (after DNS propagation)

### Custom Domain (Already Configured)
Your Namecheap DNS is already set up to point to Firebase Hosting. Once deployed, your site will be available at `https://salatiso.com`.

## 🐛 Troubleshooting

### Common Issues

**1. "Missing Firebase configuration" error:**
- Check that you've added your actual Firebase credentials to the `.env` files
- Ensure all required `VITE_FIREBASE_*` variables are set

**2. "Module not found" errors:**
- Make sure you've moved all files to the `src/` folder
- Check that import paths are correct

**3. Build fails:**
- Run `npm install` to ensure all dependencies are installed
- Check that all HTML files are in the correct locations

**4. Firebase deployment fails:**
- Ensure you're logged in: `firebase login`
- Check that `firebase.json` points to the `dist` folder
- Make sure you've run `npm run build` first

### Development vs Production

**Development Mode:**
- Uses `http://localhost:3000`
- Debug logging enabled
- Rate limiting disabled
- Hot reload active

**Production Mode:**
- Uses `https://salatiso.com`
- Debug logging disabled
- Rate limiting enabled
- Optimized and minified

## 📝 Migration Notes

### What Changed
- ❌ Removed PHP dependency (config.php, config-loader.php)
- ❌ Removed .htaccess (not needed with Firebase)
- ✅ Added Vite build system
- ✅ Added environment-based configuration
- ✅ Added modern development workflow

### What Stayed the Same
- All your HTML, CSS, and JavaScript functionality
- Firebase integration
- Security features
- Performance optimizations

## 🎯 Next Steps

1. **Install dependencies:** `npm install`
2. **Add your Firebase credentials** to `.env.development` and `.env.production`
3. **Move files to `src/` folder** as described above
4. **Test locally:** `npm run dev`
5. **Build and deploy:** `npm run deploy`

Your site will be faster, more secure, and easier to develop with this new setup!