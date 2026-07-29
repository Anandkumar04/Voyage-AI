/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Planner from './pages/Planner';
import Dashboard from './pages/Dashboard';
import TripDetails from './pages/TripDetails';
import Explore from './pages/Explore';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import PageTransition from './components/ui/PageTransition';
import ToastContainer from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageTransition key={location.pathname}><Landing /></PageTransition>} />
        <Route path="/planner" element={<PageTransition key={location.pathname}><Planner /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition key={location.pathname}><Dashboard /></PageTransition>} />
        <Route path="/trip/:id" element={<PageTransition key={location.pathname}><TripDetails /></PageTransition>} />
        <Route path="/explore" element={<PageTransition key={location.pathname}><Explore /></PageTransition>} />
        <Route path="/auth" element={<PageTransition key={location.pathname}><Auth /></PageTransition>} />
        <Route path="*" element={<PageTransition key="404"><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <ToastContainer />
          <AnimatedRoutes />
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
