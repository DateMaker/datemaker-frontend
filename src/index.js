import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import DateMaker from './DateMaker';
import StatsPage from './StatsPage';
import AchievementsPage from './AchievementsPage';
import './index.css';

import { SplashScreen } from '@capacitor/splash-screen';

// Hide splash screen immediately when React loads
SplashScreen.hide().catch(err => console.log('Splash screen already hidden'));

// ✅ ScrollToTop component - resets scroll on every route change
// Scrolls #root element since that's the scroll container (not window)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the #root element since that's your scroll container per index.css
    const root = document.getElementById('root');
    if (root) {
      root.scrollTo(0, 0);
    }
    // Also try window just in case
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

console.log('🚀 React app starting...');
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DateMaker />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);