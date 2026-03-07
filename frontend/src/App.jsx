import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailPage from './pages/TripDetailPage';
import ItineraryPage from './pages/ItineraryPage';
import BudgetPage from './pages/BudgetPage';
import CollaboratorsPage from './pages/CollaboratorsPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 md:ml-60 min-h-[calc(100vh-4rem)] overflow-x-hidden">{children}</main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
            <Route path="/trips/:id" element={<ProtectedRoute><AppLayout><TripDetailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/trips/:id/itinerary" element={<ProtectedRoute><AppLayout><ItineraryPage /></AppLayout></ProtectedRoute>} />
            <Route path="/trips/:id/budget" element={<ProtectedRoute><AppLayout><BudgetPage /></AppLayout></ProtectedRoute>} />
            <Route path="/trips/:id/collaborators" element={<ProtectedRoute><AppLayout><CollaboratorsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><AppLayout><FavoritesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
