import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Support from './pages/Support';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import Admin from './pages/Admin/Admin';
import { BrandingProvider } from './context/BrandingContext';
import { initializeAuth } from './firebase';
import { registerServiceWorker, showInstallPrompt } from './utils/offline';

function AppRoutes() {
  const { pathname } = useLocation();
  const hideSiteChrome = pathname.startsWith('/admin');

  return (
    <div className={`App min-h-screen flex flex-col ${hideSiteChrome ? 'admin-fullscreen-app' : ''}`}>
      {!hideSiteChrome && <Navbar />}
      <main className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/support" element={<Support />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/admin/*" element={<Admin />} />

          <Route path="/about" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl">About Us - Coming Soon</h1></div>} />
          <Route path="/contact" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl">Contact - Coming Soon</h1></div>} />
          <Route path="/privacy" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl">Privacy Policy - Coming Soon</h1></div>} />
          <Route path="/accessibility" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl">Accessibility Statement - Coming Soon</h1></div>} />
          <Route path="/qr-codes" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl">QR Codes - Coming Soon</h1></div>} />

          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for.</p>
                <a href="/" className="text-luna-pink hover:text-pink-600 font-medium">
                  Return to Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      {!hideSiteChrome && <Footer />}
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize Firebase Auth
    initializeAuth();

    // Register service worker for PWA
    registerServiceWorker();

    // Show install prompt
    showInstallPrompt();

    // Set up meta tags
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }

    // Add theme color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#ff69b4';

    // Add manifest link if not present
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    // Add Open Graph meta tags
    const ogTags = [
      { property: 'og:site_name', content: 'LUNA SEN PANTRY' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_GB' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@LunaSenPantry' }
    ];

    ogTags.forEach(tag => {
      let meta = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.property) {
          meta.setAttribute('property', tag.property);
        } else {
          meta.setAttribute('name', tag.name);
        }
        document.head.appendChild(meta);
      }
      meta.content = tag.content;
    });

  }, []);

  return (
    <Router>
      <BrandingProvider>
        <AppRoutes />
      </BrandingProvider>
    </Router>
  );
}

export default App;
