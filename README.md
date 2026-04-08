# LUNA SEN PANTRY 🌙💖

**Independent SEN-priority food support hub – Metropolitan Borough of Wirral, Merseyside**

A complete, production-ready web application providing food support with special educational needs (SEN) and sensory requirements as the top priority.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit http://localhost:3000
```

**New to Firebase or terminal commands?** You don’t need them to try the site locally. For the **free-tier** options (Firebase Spark + optional EmailJS), see **[docs/FREE_SETUP.md](docs/FREE_SETUP.md)**. For a full click-by-click walkthrough, use **[docs/SETUP_STEP_BY_STEP.md](docs/SETUP_STEP_BY_STEP.md)**.

## 🛠️ How to Edit Content

### Change Text Content
- **Home page**: Edit `src/pages/Home.jsx`
- **Navigation**: Edit `src/components/Navbar.jsx`
- **Footer**: Edit `src/components/Footer.jsx`
- **Support form**: Edit `src/pages/Support.jsx`

### Change Colors
All colors are defined in `tailwind.config.js`:
```javascript
colors: {
  'luna-pink': '#ff69b4',    // Main pink color
  'luna-blue': '#7ad7f0',    // Secondary blue
}
```

The gradient is defined as:
```javascript
backgroundImage: {
  'luna-gradient': 'linear-gradient(135deg, #ff69b4, #7ad7f0)',
}
```

### Add Your Logo
1. Replace `public/logo.svg` with your logo file
2. Update the favicon by replacing `public/favicon.ico`
3. For best results, provide PNG versions at 192x192 and 512x512 pixels

### Update Contact Information
Search for these placeholders and replace:
- `07718851362` → Your phone number
- `donations@lunasen.org` → Your email
- `https://paypal.me/lunasen` → Your PayPal.me link

## 🔧 Firebase Setup (FREE)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "luna-sen-pantry" (or your preferred name)
4. Disable Google Analytics (not needed)

### 2. Enable Firestore
1. In Firebase console → Build → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" 
4. Select your preferred location

### 3. Enable Authentication
1. Go to Build → Authentication
2. Click "Get started"
3. Go to Sign-in method tab
4. Enable "Anonymous" authentication

### 4. Configure the App
1. In Firebase console → Project settings → General
2. Scroll to "Your apps" → Web apps
3. Click "Add app" and register your app
4. Copy the config object
5. Replace the config in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 5. Set Firestore Rules
The repo includes `firestore.rules` (anonymous sign-in can **create** referrals/volunteers; public **cannot read**).

Deploy from the project root (with Firebase CLI):

```bash
firebase deploy --only firestore:rules
```

Or paste the same rules manually in Firebase console → Firestore → Rules.

### 6. Firebase + Google Sheets (optional, recommended for ops)
Keep **Firestore** as the database; mirror new submissions into a **Google Sheet** for sorting, urgency triage, and history.

Full steps (service account, Sheet tabs, secrets, deploy): **[docs/FIREBASE_SHEETS.md](docs/FIREBASE_SHEETS.md)**

## 🌐 Deploy to Vercel (FREE)

### Method 1: GitHub Integration (Recommended)
1. Create GitHub repository
2. Push your code to GitHub
3. Go to [vercel.com](https://vercel.com)
4. Sign up with GitHub
5. Click "Import Project"
6. Select your repository
7. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
8. Click "Deploy"

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: luna-sen-pantry
# - Want to override settings? No
```

### Method 3: Drag & Drop
1. Run `npm run build`
2. Go to [vercel.com](https://vercel.com) 
3. Drag the `dist` folder to deploy area
4. Your site is live!

## 📱 PWA Features

This app is a Progressive Web Application with:
- ✅ Offline form saving
- ✅ Installable on mobile/desktop
- ✅ Background sync when connection returns
- ✅ Service worker caching
- ✅ Mobile-first responsive design

Users can install it as an app by:
1. Visiting on mobile → "Add to Home Screen"
2. Chrome desktop → Address bar install icon
3. Or using the "Install App" button in footer

## 🎨 Design System

### Card Colors (3-card rhythm)
Cards automatically follow this pattern:
1. **First card**: Pink edge + pink icon
2. **Second card**: Gradient edge + gradient icon  
3. **Third card**: Blue edge + blue icon

### Navigation Hovers
All navigation links use gradient text on hover:
```css
hover:gradient-text
```

### Accessibility Features
- Screen reader friendly
- Keyboard navigation
- High contrast colors  
- Large touch targets (44px minimum)
- Respects `prefers-reduced-motion`
- Focus indicators
- Semantic HTML

## 🔒 What's Safe to Change

### ✅ SAFE TO CHANGE
- Text content in pages
- Colors in `tailwind.config.js`
- Logo and images in `public/`
- Contact information
- PayPal.me links
- Form field labels
- Footer links

### ⚠️ CHANGE WITH CAUTION
- Component file names (breaks imports)
- CSS class names (could break styling)
- Firebase configuration structure
- Route paths (update both App.jsx and links)

### ❌ DON'T CHANGE
- Node dependencies (unless you know what you're doing)
- Vite config (unless needed)
- Service worker structure
- Build scripts

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Button component
│   ├── Card.jsx        # Card component with icons
│   ├── Footer.jsx      # Site footer
│   ├── FormField.jsx   # Form input component
│   └── Navbar.jsx      # Navigation header
├── hooks/              # Custom React hooks
│   ├── useFormValidation.js  # Form validation logic
│   └── useOfflineForm.js     # Offline form handling
├── pages/              # Page components
│   ├── Donate.jsx      # Donation page
│   ├── GetSupport.jsx  # Referral form
│   ├── Home.jsx        # Landing page
│   └── Volunteer.jsx   # Volunteer application
├── utils/              # Utility functions
│   ├── offline.js      # PWA and offline features
│   └── validation.js   # Form validation helpers
├── App.jsx             # Main app component
├── firebase.js         # Firebase configuration
├── index.css           # Global styles
└── main.jsx           # App entry point

public/
├── logo.svg           # Main logo
├── manifest.json      # PWA manifest
├── robots.txt         # SEO robots file
└── service-worker.js  # PWA service worker
```

## 📧 Form Handling

### Offline-First Design
- Forms save to localStorage as user types
- Submissions work offline via IndexedDB
- Auto-sync when connection returns
- Visual offline indicators

### Form Data Storage
- **Referrals**: Stored in Firestore `referrals` collection
- **Volunteers**: Stored in Firestore `volunteers` collection
- **Offline data**: IndexedDB → syncs to Firestore when online

## 🎯 SEO Optimizations

### Meta Tags
- Open Graph tags for social sharing
- Twitter Cards
- Schema.org structured data
- Mobile viewport settings

### Target Keywords
- food bank wirral
- foodbank no voucher wirral  
- SEN food support
- crisis food help CH62
- help with shopping disabled families

### Performance
- Code splitting
- Image optimization
- Lazy loading
- Service worker caching

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Firebase Connection Issues
1. Check Firebase config in `src/firebase.js`
2. Verify Firestore rules allow anonymous auth
3. Check browser console for specific errors

### PWA Not Installing
1. Ensure site is served over HTTPS (automatic on Vercel)
2. Check manifest.json is accessible
3. Verify service worker is registered

### Forms Not Submitting
1. Check network connection
2. Look for JavaScript errors in console
3. Verify Firebase rules allow writes
4. Check if running in offline mode

## 🔄 Updates & Maintenance

### Regular Updates
- Review form submissions in Firebase Console
- Monitor user feedback
- Update contact information as needed
- Check for security updates: `npm audit`

### Analytics (Optional)
To add Google Analytics:
1. Get GA4 measurement ID
2. Add tracking script to `index.html`
3. Add privacy policy page

## 📞 Support

This is a complete, production-ready system built specifically for SEN families. Every feature has been designed with accessibility and ease of use in mind.

For technical support with this codebase:
- Check the browser console for errors
- Verify Firebase configuration
- Ensure all dependencies are installed
- Test offline functionality

Remember: This system works without any paid services and can handle real production traffic on Vercel's free tier.

---

**Built with care for SEN families in Wirral and beyond** 💖

*"Technology should work for everyone, especially those who need it most"*
