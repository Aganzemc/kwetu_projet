import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import SplashLogo from './components/SplashLogo';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Policy = lazy(() => import('./pages/Policy'));
const Users = lazy(() => import('./pages/Users'));

function LoadingSpinner() {
  return (
    <SplashLogo />
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <div className="fixed top-3 right-3 z-50">
              <LanguageSwitcher />
            </div>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Chat />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/privacy"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Privacy />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/policy"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Policy />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Routes>
            <PWAInstallPrompt />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
