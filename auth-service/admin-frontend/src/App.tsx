import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeContextProvider } from './theme/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/users/UsersPage';
import RolesPage from './pages/roles/RolesPage';
import EntitiesPage from './pages/entities/EntitiesPage';
import SessionsPage from './pages/sessions/SessionsPage';
import MailingsPage from './pages/mailings/MailingsPage';
import MailingListsPage from './pages/mailing-lists/MailingListsPage';
import LogsPage from './pages/logs/LogsPage';
import Settings from './pages/Settings';
import InstructionsPage from './pages/instructions/InstructionsPage';

// Get basename from Vite's base URL (removes trailing slash for React Router)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function App() {
  return (
    <JotaiProvider>
      <ThemeContextProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RolesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/entities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EntitiesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SessionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mailings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MailingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mailing-lists"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MailingListsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LogsPage />
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
              path="/instructions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InstructionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </JotaiProvider>
  );
}

export default App;
