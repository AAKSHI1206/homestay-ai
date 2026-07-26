import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// ── Pages ──────────────────────────────────────────────────────
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import ReviewAnalyzer from "./pages/ReviewAnalyzer";
import ReviewHistory from "./pages/ReviewHistory";
import ReviewDetails from "./pages/ReviewDetails";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

/**
 * PublicLayout
 * ────────────
 * Standard full-width layout for landing, auth, and informational pages.
 */
function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showMenuButton={false} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

/**
 * ProtectedLayout
 * ───────────────
 * Auth-guarded layout with interactive responsive sidebar navigation
 * and top navigation menu trigger for mobile devices.
 */
function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar
          showMenuButton={true}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <div className="flex flex-1">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 min-w-0 bg-stone-50/20 dark:bg-stone-925">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ─────────────────────────────────────── */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            }
          />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <Register />
              </PublicLayout>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <PublicLayout>
                <AuthCallback />
              </PublicLayout>
            }
          />
          <Route
            path="*"
            element={
              <PublicLayout>
                <NotFound />
              </PublicLayout>
            }
          />

          {/* ── Protected host application routes ──────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/listings"
            element={
              <ProtectedLayout>
                <Listings />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedLayout>
                <ReviewAnalyzer />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reviews/:id"
            element={
              <ProtectedLayout>
                <ReviewDetails />
              </ProtectedLayout>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedLayout>
                <ReviewHistory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedLayout>
                <Analytics />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
