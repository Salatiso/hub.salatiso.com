# The Hub by Salatiso

> Your comprehensive digital homestead connecting all Salatiso ecosystem tools. Build your LifeCV, manage finances, organize family life, and access professional development resources - all in one secure platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Git

### Installation

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd hub.salatiso.com
   npm install
   ```

2. **Run migration script:**
   ```bash
   node migrate-to-vite.js
   ```

3. **Configure environment variables:**
   - Edit `.env.development` with your Firebase development credentials
   - Edit `.env.production` with your Firebase production credentials

4. **Start development:**
   ```bash
   npm run dev
   ```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to Firebase

### Project Structure

```
src/
├── assets/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript modules
│   │   ├── modules/   # Feature-specific modules
│   │   ├── utils/     # Utility functions
│   │   └── firebase-config-vite.js
│   └── images/        # Static images
├── components/        # Reusable HTML components
├── modules/          # Application modules
├── index.html        # Main entry point
└── ...               # Other HTML pages
```

## 🔧 Configuration

### Environment Variables

The application uses environment-specific configuration:

**Development (`.env.development`):**
- Local development settings
- Debug mode enabled
- Rate limiting disabled

**Production (`.env.production`):**
- Production Firebase credentials
- Analytics enabled
- Security features active

### Firebase Setup

1. **Create Firebase project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable services:**
   - Authentication
   - Firestore Database
   - Storage
   - Hosting
3. **Add your credentials** to environment files

## 🚀 Deployment

### Firebase Hosting

The site is configured for Firebase Hosting with custom domain support.

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

3. **Custom Domain:**
   - Domain: `salatiso.com`
   - DNS configured via Namecheap
   - SSL certificate auto-provisioned

## 🔒 Security Features

### Environment-Based Security
- ✅ No hardcoded API keys
- ✅ Environment-specific configurations
- ✅ Rate limiting in production
- ✅ Input validation and sanitization

### Build-Time Security
- ✅ Asset optimization and minification
- ✅ Secure environment variable handling
- ✅ Content Security Policy headers
- ✅ Proper caching strategies

## 🏗️ Architecture

### Modern Build System
- **Vite** for fast development and optimized builds
- **ES Modules** for modern JavaScript
- **Environment variables** for configuration
- **Hot Module Replacement** for development

### Firebase Integration
- **Authentication** for user management
- **Firestore** for data storage
- **Storage** for file uploads
- **Hosting** for static site deployment

### Module System
- **Modular architecture** for scalability
- **Component-based** HTML structure
- **Utility libraries** for common functions
- **Service layers** for data management

## 📱 Features

### Core Modules
- **LifeCV** - Personal profile and CV builder
- **FinHelp** - Financial management tools
- **Family Hub** - Family organization features
- **eKhaya** - Property management
- **PubHelp** - Publishing and content tools

### User Experience
- **Responsive design** for all devices
- **Progressive Web App** capabilities
- **Offline support** for core features
- **Accessibility** compliance

## 🧪 Testing

### Local Testing
```bash
# Development server
npm run dev

# Production build testing
npm run build
npm run preview
```

### Browser Testing
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## 📚 Documentation

- [`VITE_SETUP_GUIDE.md`](VITE_SETUP_GUIDE.md) - Detailed setup instructions
- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) - Legacy deployment guide
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)

## 🐛 Troubleshooting

### Common Issues

**Firebase Configuration Errors:**
- Ensure environment variables are properly set
- Check Firebase project settings
- Verify API keys are correct

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for syntax errors in JavaScript files
- Ensure all imports are correct

**Deployment Issues:**
- Login to Firebase: `firebase login`
- Check firebase.json configuration
- Verify build output in dist/ folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Vite for build tooling
- Tailwind CSS for styling
- Font Awesome for icons

---

**The Hub by Salatiso** - Connecting your digital life, one tool at a time.
