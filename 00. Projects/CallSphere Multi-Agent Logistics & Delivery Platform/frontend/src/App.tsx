import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authService, wsService } from './lib';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      wsService.connect(token);
    }

    return () => {
      wsService.disconnect();
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole={['admin', 'manager', 'dispatcher', 'driver']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {(() => {
              const user = authService.getCurrentUser();
              if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'dispatcher' || user?.role === 'driver') {
                return <Navigate to="/admin" replace />;
              }
              return <Navigate to="/customer" replace />;
            })()}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

