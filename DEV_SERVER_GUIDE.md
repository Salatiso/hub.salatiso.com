# LifeSync Dev Server - ACTIVE ✅

**Start Time**: October 29, 2025  
**Status**: 🟢 **RUNNING**

---

## 📡 Dev Server Access

### Local URLs
```
Local:   http://localhost:3002/
Network: http://192.168.86.250:3002/
```

### Access Methods
1. **Local Machine**: http://localhost:3002
2. **Network Access**: http://192.168.86.250:3002 (from other devices)
3. **VS Code Browser**: Embedded preview (active above)

---

## 🔧 Server Configuration

### Server Info
- **Framework**: Vite v4.5.14
- **Port**: 3002 (auto-selected after 3000, 3001 were in use)
- **Environment**: Development
- **Hot Module Reload**: ✅ Enabled
- **Startup Time**: 483 ms

### Features
- ✅ Hot module replacement (HMR)
- ✅ Fast build times
- ✅ Source maps for debugging
- ✅ Modern ES modules
- ✅ Network access enabled

---

## 🧪 Development Testing

### Available for Testing
- ✅ Local account creation
- ✅ Google Drive integration
- ✅ Sync functionality
- ✅ Settings management
- ✅ Offline features (with dev tools)
- ✅ Google OAuth flow

### Hot Reload
Any changes to source files will automatically reload in the browser.

---

## 📊 Live Features

### Authentication (Ready to Test)
1. **Google OAuth** - Click "Continue with Google"
2. **Local Account** - Click "Continue with Local Account"
3. **Google Drive Import** - Click "Import from Google Drive"

### Data Management (Ready to Test)
- Create and manage profiles
- Export profiles (local/Google Drive)
- Import profiles
- View sync status
- Manage preferences

### Settings (Ready to Test)
- Sync preferences (auto/manual)
- Device tier selection
- Data category selection
- Performance options

---

## ⌨️ Dev Server Commands

### Available During Development
```
Press h to show help
Press q to quit
Press r to restart
Press c to clear console
```

### Code Changes
- Edit any file in `/src` directory
- Browser will auto-refresh (HMR)
- Errors will display in console

---

## 🛠️ Troubleshooting

### Issue: Port 3002 not working
```powershell
# Find process using port
netstat -ano | findstr :3002

# Kill process (replace PID with actual)
taskkill /PID <PID> /F
```

### Issue: Module errors
- Check browser console (F12)
- Check terminal output
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Changes not reflecting
- Hard refresh (Ctrl+Shift+R)
- Check file save status
- Verify no syntax errors

---

## 📱 Browser DevTools

### Recommended Setup
1. Open DevTools (F12)
2. Switch to **Application** tab
3. Check **IndexedDB** for local storage
4. Check **Cache Storage** for service worker

### Storage Locations
- **IndexedDB**: LifeSync local accounts
- **LocalStorage**: User preferences
- **Cache Storage**: PWA assets

---

## 🔐 Security Notes

### Development Server
- ⚠️ Not for production use
- ✅ Safe for local testing
- ✅ No authentication required
- ✅ Full feature access

### Testing Credentials
- Use test data only
- No real user data at risk
- Clear localStorage between tests
- Check IndexedDB for test artifacts

---

## 📋 Testing Checklist

### Before Testing
- [ ] Dev server running on port 3002
- [ ] Browser console open (F12)
- [ ] Clear browser cache
- [ ] IndexedDB cleared (if needed)

### Authentication Tests
- [ ] Can create local account
- [ ] Can view sync status
- [ ] Can access settings
- [ ] Can export profile (local)
- [ ] Can import profile (local)

### Google Drive Tests
- [ ] Can connect to Google Drive
- [ ] Can export to Google Drive
- [ ] Can list Drive files
- [ ] Can import from Drive
- [ ] Authentication flow works

### Sync Tests
- [ ] Sync button responds
- [ ] Pending changes counter updates
- [ ] Last sync time displays
- [ ] Sync modes selectable

### Offline Tests
- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Check "Offline" checkbox
- [ ] Verify app still functions
- [ ] Local creation still works
- [ ] Uncheck offline, verify sync

---

## 🚀 Next Steps

1. **Test Features** - Use checklist above
2. **Report Issues** - Document any bugs
3. **Optimize Performance** - Check Lighthouse
4. **Prepare for Production** - Build and deploy

---

## 📞 Dev Server Management

### Keep Running
Server will continue running in background. Leave terminal open.

### Stop Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Restart Server
Type `r` and press Enter in terminal, or:
```powershell
npm run dev
```

---

## 🎯 Current Status

✅ **Dev Server Active**  
✅ **All Features Loaded**  
✅ **Hot Reload Enabled**  
✅ **Ready for Testing**

**Access**: http://localhost:3002

---

*Dev server started: October 29, 2025*