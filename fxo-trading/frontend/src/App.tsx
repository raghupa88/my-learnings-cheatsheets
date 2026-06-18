import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import FxoLayout from './routes/fxo/layout/FxoLayout';
import LoginPage from './routes/fxo/login/LoginPage';
import RFQPage from './routes/fxo/rfq/RFQPage';
import DealTicketPage from './routes/fxo/deal-ticket/DealTicketPage';
import RiskPage from './routes/fxo/risk/RiskPage';
import ConfirmationPage from './routes/fxo/confirmation/ConfirmationPage';
import LifecyclePage from './routes/fxo/lifecycle/LifecyclePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/fxo/login" replace />} />
          <Route path="/fxo" element={<FxoLayout />}>
            <Route index element={<Navigate to="/fxo/login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="rfq" element={<RFQPage />} />
            <Route path="deal-ticket" element={<DealTicketPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="confirmation" element={<ConfirmationPage />} />
            <Route path="lifecycle" element={<LifecyclePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/fxo/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
