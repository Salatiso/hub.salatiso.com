# Ecosystem Bridge Site Overlay Standard

**Owner:** MNI Digital Infrastructure Council  
**Version:** 1.0.0  
**Date:** October 14, 2025  
**Status:** ✅ Active — Universal standard for all legacy sites

---

## 1. Purpose

Each legacy site (e.g., `https://salatiso.com/legalhelp/`, `https://salatiso.com/safetyhelp/`) must act as a **bridge** between:
- The **legacy HTML site** (limited functionality, educational/historical reference)
- The **new Firebase app** (current and future development focus)

The bridge ensures users understand the progression (**legacy → modern ecosystem**) while encouraging them to use the Firebase app as the primary platform.

---

## 2. Overlay Design Requirements

### 2.1 Full-Screen Overlay on Landing
- Appears on first load of any legacy site
- User must make a choice before accessing content
- Cannot be dismissed without selection

### 2.2 Overlay Components
1. **App Name & Logo** (consistent branding across ecosystem)
2. **Brief Description** (1–2 sentences explaining app purpose and evolution)
3. **Two Primary Action Buttons:**
   - **"Go to New App"** → Redirects to Firebase app (default recommended path)
   - **"Explore Legacy Site"** → Dismisses overlay, shows HTML site
4. **Optional Android App Link** (if available in Play Store)
5. **Contact Button** → Links to: `https://bizhelp-lifecv.web.app/contact`

### 2.3 User Choice Memory
- Use cookie or session storage to remember user choice
- Repeat visitors bypass overlay (optional setting)
- Clear choice resets after 30 days

---

## 3. Visual Design Standards

### 3.1 Color Palette (Bridging Legacy → Modern)
- **Base:** Blended palette bridging:
  - Darker, traditional tones of legacy HTML sites
  - Lighter, modern palette of Firebase apps
- **Accent:** App-specific color from ecosystem branding guide
- **Buttons:**
  - "Go to New App" → Primary accent (blue/green gradient)
  - "Explore Legacy Site" → Secondary gray
  - "Contact" → Neutral outline

### 3.2 Typography
- **Headings:** Roboto Slab, 2.5rem, bold
- **Body:** Inter, 1rem, regular
- **Buttons:** Inter, 1.125rem, semibold

### 3.3 Layout Structure
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [App Logo]                         │
│                                                 │
│         [App Name]: From Legacy to Ecosystem    │
│                                                 │
│  [2-sentence description explaining evolution]  │
│                                                 │
│   ┌──────────────────┐  ┌──────────────────┐   │
│   │  Go to New App   │  │ Explore Legacy   │   │
│   │  (Primary CTA)   │  │      Site        │   │
│   └──────────────────┘  └──────────────────┘   │
│                                                 │
│         [Optional: Android App Badge]           │
│                                                 │
│                [Contact Us]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 4. Content Template (Reusable Across Apps)

### 4.1 Title Format
```
[App Name]: From Legacy to Ecosystem
```

### 4.2 Description Examples

#### SafetyHelp
> "SafetyHelp began as a simple compliance resource. Today it is a full ecosystem tool for workplace safety, collaboration, and growth. The legacy site remains for reference, but the new app is where development continues."

#### LegalHelp
> "LegalHelp started as a collection of legal templates. It has evolved into a comprehensive advocacy platform with case management, AI assistance, and community publishing. The legacy site preserves our history; the new app builds our future."

#### PubHelp
> "PubHelp was born as a publishing guide. Today it powers the entire ecosystem's storytelling engine—authoring studios, newsrooms, magazines, and bookshops. The legacy site documents the journey; the new app delivers the mission."

#### eKhaya
> "eKhaya began as Tenant-Resource-SA, a simple housing toolkit. It has matured into a full tenant and asset management platform with marketplace listings, billing automation, and community housing coordination. The legacy site shows our roots; the new app scales our impact."

#### DocHelp
> "DocHelp emerged as a document generator. It now serves as the ecosystem's document intelligence platform—templates, collaboration, billing, and publishing. The legacy site archives our early work; the new app defines the standard."

#### FinHelp
> "FinHelp launched as a budgeting tool. It has transformed into the financial heartbeat of the ecosystem—cashflow, compliance, investments, and community finance. The legacy site records our beginnings; the new app fuels prosperity."

#### HRHelp
> "HRHelp originated as an HR resource library. It is now a comprehensive people management platform with compliance packs, wellness modules, and publishing workflows. The legacy site preserves our foundation; the new app empowers workplaces."

#### Flamea
> "Flamea started as a fathers' rights blog. It has grown into a constitutional advocacy engine with case preparation, campaigns, storytelling, and trauma support. The legacy site honors the struggle; the new app advances the cause."

#### LifeSync
> "LifeSync was conceived as a safety tracker. It is now the ecosystem's synchronization engine—offline-first communications, trust networks, and household collaboration. The legacy site captures the vision; the new app lives the mission."

#### The Hub
> "The Hub began as a simple dashboard. It has become the command centre for the entire Salatiso ecosystem—navigation, analytics, billing, and governance. The legacy site documents the blueprint; the new app orchestrates the family business."

---

## 5. App Mapping (Legacy → Firebase)

| **App Name** | **Legacy URL** | **Firebase App URL** | **Android App** |
| --- | --- | --- | --- |
| SafetyHelp | `salatiso.com/safetyhelp` | `safetyfirst.help` | Play Store |
| LegalHelp | `salatiso.com/legalhelp` | `legalhelp-lifecv.web.app` | Play Store |
| PubHelp | `salatiso.com/pubhelp` | `pubhelp-lifecv.web.app` | Not yet |
| eKhaya | `salatiso.com/Tenant-Resource-SA` | `ekhaya-lifecv.web.app` | Not yet |
| DocHelp | `salatiso.com/docuhelp` | `docuhelp-lifecv.web.app` | Not yet |
| FinHelp | `salatiso.com/finhelp` | `finhelp-lifecv.web.app` | Not yet |
| HRHelp | `salatiso.com/hrhelp` | `hrhelp-lifecv.web.app` | Not yet |
| Flamea | `salatiso.com/flamea` | `flamea.org` | Not yet |
| LifeSync | `salatiso.com/LifeSync` | `lifecv-d2724.web.app` | Play Store |
| The Hub | `salatiso.com/the-hub` | `hub.salatiso.com` | Not yet |
| BizHelp | `salatiso.com/bizhelp` | `bizhelp-lifecv.web.app` | Not yet |
| FamilyValue | `salatiso.com/FamilyValue` | `familyvalue-lifecv.web.app` | Not yet |
| Sazi Life Academy | `salatiso.com/sazi` | `sazi.life` | Play Store |
| PigeeBack | `salatiso.com/pigeeback` | `pigeeback-lifecv.web.app` | Play Store |

---

## 6. Implementation Code Template

### 6.1 HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[App Name] - Bridge to New Platform</title>
    <style>
        /* Bridge Overlay Styles */
        .bridge-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95));
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
        }
        
        .bridge-content {
            max-width: 600px;
            background: white;
            border-radius: 16px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        
        .bridge-logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 24px;
        }
        
        .bridge-title {
            font-family: 'Roboto Slab', serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
        }
        
        .bridge-description {
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 32px;
        }
        
        .bridge-buttons {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .bridge-button {
            flex: 1;
            padding: 16px 32px;
            font-family: 'Inter', sans-serif;
            font-size: 1.125rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .bridge-button-primary {
            background: linear-gradient(135deg, #3b82f6, #10b981);
            color: white;
        }
        
        .bridge-button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(59,130,246,0.5);
        }
        
        .bridge-button-secondary {
            background: #e2e8f0;
            color: #475569;
        }
        
        .bridge-button-secondary:hover {
            background: #cbd5e1;
        }
        
        .bridge-contact {
            margin-top: 24px;
        }
        
        .bridge-contact a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .bridge-contact a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="bridge-overlay" id="bridgeOverlay">
        <div class="bridge-content">
            <img src="[APP_LOGO_URL]" alt="[App Name] Logo" class="bridge-logo">
            <h1 class="bridge-title">[App Name]: From Legacy to Ecosystem</h1>
            <p class="bridge-description">
                [2-sentence description from templates above]
            </p>
            <div class="bridge-buttons">
                <button class="bridge-button bridge-button-primary" onclick="goToNewApp()">
                    Go to New App →
                </button>
                <button class="bridge-button bridge-button-secondary" onclick="exploreLegacySite()">
                    Explore Legacy Site
                </button>
            </div>
            <div class="bridge-contact">
                <a href="https://bizhelp-lifecv.web.app/contact" target="_blank">Contact Us</a>
            </div>
        </div>
    </div>

    <script>
        const FIREBASE_APP_URL = '[FIREBASE_URL]';
        const COOKIE_NAME = 'bridge_choice';
        const COOKIE_DAYS = 30;

        function goToNewApp() {
            setCookie(COOKIE_NAME, 'new', COOKIE_DAYS);
            window.location.href = FIREBASE_APP_URL;
        }

        function exploreLegacySite() {
            setCookie(COOKIE_NAME, 'legacy', COOKIE_DAYS);
            document.getElementById('bridgeOverlay').style.display = 'none';
        }

        function setCookie(name, value, days) {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
        }

        function getCookie(name) {
            return document.cookie.split('; ').reduce((r, v) => {
                const parts = v.split('=');
                return parts[0] === name ? decodeURIComponent(parts[1]) : r;
            }, '');
        }

        // Check if user has made a choice before
        window.addEventListener('DOMContentLoaded', function() {
            const choice = getCookie(COOKIE_NAME);
            if (choice === 'new') {
                window.location.href = FIREBASE_APP_URL;
            } else if (choice === 'legacy') {
                document.getElementById('bridgeOverlay').style.display = 'none';
            }
        });
    </script>

    <!-- Legacy site content below (hidden by overlay initially) -->
    <!-- ... existing HTML ... -->
</body>
</html>
```

---

## 7. Deployment Checklist

### Per-App Configuration
- [ ] Replace `[APP_LOGO_URL]` with app logo path
- [ ] Replace `[App Name]` with actual app name
- [ ] Insert appropriate description from Section 4.2
- [ ] Update `FIREBASE_APP_URL` with correct Firebase URL
- [ ] Test overlay appearance on mobile and desktop
- [ ] Verify cookie persistence (30-day expiry)
- [ ] Confirm "Contact Us" link works
- [ ] Add Android badge if Play Store listing exists

### Cross-App Standards
- [ ] Consistent color palette across all overlays
- [ ] Uniform button sizes and spacing
- [ ] Matching typography and font weights
- [ ] Identical animation/transition speeds
- [ ] Same cookie naming convention

---

## 8. Salatiso.com as Launchpad

### 8.1 Role of salatiso.com
- **Primary domain** where all ideas start
- Most apps/sites begin as subdomain: `salatiso.com/[app-name]`
- Proven concepts graduate to standalone domains (e.g., `sazi.life`, `safetyfirst.help`)
- Legacy sites remain as historical reference and bridge

### 8.2 Subdomain → Domain Evolution Path
```
1. Idea inception → salatiso.com/[app-name] (HTML prototype)
2. MVP testing → salatiso.com/[app-name] (enhanced features)
3. Firebase deployment → [app-name]-lifecv.web.app (alpha/beta)
4. Custom domain → [app-name].com or [app-name].help (production)
5. Legacy bridge → salatiso.com/[app-name] redirects with overlay
```

---

## 9. Success Metrics
- **80%** of users choose "Go to New App" (validates modern platform)
- **<5%** bounce rate on overlay (clarity of messaging)
- **90%** cookie persistence (users don't need to choose repeatedly)
- **Zero** broken links to Firebase apps or contact page

---

## 10. Review Cycle
Quarterly or upon major app graduation/rebranding event.

---

*The bridge honors our legacy while propelling users toward the future.*
