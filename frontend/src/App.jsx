import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TestCasesPage from './pages/TestCasesPage';
import TestCaseFormPage from './pages/TestCaseFormPage';
import ExecuteTestPage from './pages/ExecuteTestPage';
import TestRunsPage from './pages/TestRunsPage';
import TestRunDetailPage from './pages/TestRunDetailPage';
import CSVImportPage from './pages/CSVImportPage';
import Loading from './components/Loading';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/test-cases" element={<TestCasesPage />} />
              <Route path="/test-cases/new" element={<TestCaseFormPage />} />
              <Route path="/test-cases/:id/edit" element={<TestCaseFormPage />} />
              <Route path="/test-cases/:id/execute" element={<ExecuteTestPage />} />
              <Route path="/test-runs" element={<TestRunsPage />} />
              <Route path="/test-runs/:id" element={<TestRunDetailPage />} />
              <Route path="/csv-import" element={<CSVImportPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
