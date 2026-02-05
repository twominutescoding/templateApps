import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeContextProvider } from './theme/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Components from './pages/Components';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import DataVisualization from './pages/components/DataVisualization';
import FormComponents from './pages/components/FormComponents';
import UIComponents from './pages/components/UIComponents';
import AdvancedFeatures from './pages/components/AdvancedFeatures';
import BusinessSpecific from './pages/components/BusinessSpecific';
import ComprehensiveTableDemo from './pages/components/ComprehensiveTableDemo';
import DemoProductsPage from './pages/demo/DemoProductsPage';
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
                    <DemoProductsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Components />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components/data-visualization"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DataVisualization />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components/form-components"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FormComponents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components/ui-components"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UIComponents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components/advanced-features"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdvancedFeatures />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components/business-specific"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BusinessSpecific />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/components/comprehensive-demo"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ComprehensiveTableDemo />
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
