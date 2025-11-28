import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import DateMaker from './DateMaker';
import StatsPage from './StatsPage';
import AchievementsPage from './AchievementsPage';
import Subscribe from './Subscribe';
import PaymentSuccess from './PaymentSuccess';
import './index.css';

import { SplashScreen } from '@capacitor/splash-screen';

// Hide splash screen immediately when React loads
SplashScreen.hide().catch(err => console.log('Splash screen already hidden'));

// ✅ ScrollToTop component - resets scroll on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.scrollTo(0, 0);
    }
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
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);