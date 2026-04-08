import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Support from './pages/Support';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import Stories from './pages/Stories';
import Admin from './pages/Admin/Admin';
import { BrandingProvider } from './context/BrandingContext';
import { initializeAuth } from './firebase';
import { HelmetProvider } from 'react-helmet-async';
import { registerServiceWorker } from './utils/offline';
import InstallPrompt from './components/InstallPrompt';
import { Seo } from './components/Seo';

const SEO_BY_PATH = {
  '/': {
    title: 'SEN food support in Wirral & Merseyside',
    description:
      'Independent SEN-priority food support across the Metropolitan Borough of Wirral, Merseyside. Emergency food help, pantry support, and family-first care — no voucher needed.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': ['Organization', 'FoodBank'],
      name: 'LUNA SEN PANTRY',
      url: 'https://lunasenpantry.co.uk/',
      logo: 'https://lunasenpantry.co.uk/app-icon.svg',
      description:
        'Independent SEN-priority food support across the Metropolitan Borough of Wirral, Merseyside. Emergency food help, pantry support, and family-first care.',
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Wirral' },
        { '@type': 'AdministrativeArea', name: 'Merseyside' },
        { '@type': 'Country', name: 'United Kingdom' },
      ],
    },
  },
  '/support': {
    title: 'Get support',
    description:
      'Request SEN-priority food support in Wirral. Simple self-referral, no voucher needed. Emergency food help designed with sensory needs in mind.',
    path: '/support',
  },
  '/donate': {
    title: 'Donate',
    description:
      'Donate to LUNA SEN PANTRY to help Wirral families. Give online via Tide, arrange food drop-off, or request collection.',
    path: '/donate',
  },
  '/volunteer': {
    title: 'Volunteer',
    description:
      'Volunteer with LUNA SEN PANTRY — hub volunteering and delivery driving across Wirral. Flexible roles, full support, real local impact.',
    path: '/volunteer',
  },
  '/stories': {
    title: 'Stories & thank yous',
    description:
      'Read and share short thank-you messages from families supported by LUNA. Please don’t include personal or sensitive details.',
    path: '/stories',
  },
};

function AppRoutes() {
  const { pathname } = useLocation();
  const hideSiteChrome = pathname.startsWith('/admin');
  const seo = SEO_BY_PATH[pathname] || {
    title: 'LUNA SEN PANTRY',
    description:
      'Independent SEN-priority food support across Wirral, Merseyside. Emergency food help, pantry support and family-first care.',
    path: pathname,
  };

  return (
    <div className={`App min-h-screen flex flex-col ${hideSiteChrome ? 'admin-fullscreen-app' : ''}`}>
      {!hideSiteChrome ? <Seo {...seo} /> : null}
      {!hideSiteChrome && <Navbar />}
      <main className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/support" element={<Support />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/stories" element={<Stories />} />
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
      {!hideSiteChrome && <InstallPrompt />}
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize Firebase Auth
    initializeAuth();

    // Register service worker for PWA
    registerServiceWorker();
  }, []);

  return (
    <Router>
      <HelmetProvider>
        <BrandingProvider>
          <AppRoutes />
        </BrandingProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
