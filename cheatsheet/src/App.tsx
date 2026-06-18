import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DerivativesForexLayout from './routes/derivatives-forex/index';
import HomePage from './routes/derivatives-forex/HomePage';
import DerivativesPage from './routes/derivatives-forex/DerivativesPage';
import ForexPage from './routes/derivatives-forex/ForexPage';
import GlossaryPage from './routes/derivatives-forex/GlossaryPage';
import ClaudeCodeLayout from './routes/claude-code/index';
import ClaudeCodePage from './routes/claude-code/ClaudeCodePage';
import FxOptionsLayout from './routes/fx-options/index';
import FxOptionsPage from './routes/fx-options/FxOptionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/derivatives-forex" replace />} />
        <Route path="/derivatives-forex" element={<DerivativesForexLayout />}>
          <Route index element={<HomePage />} />
          <Route path="derivatives" element={<DerivativesPage />} />
          <Route path="forex" element={<ForexPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
        </Route>
        <Route path="/fx-options" element={<FxOptionsLayout />}>
          <Route index element={<FxOptionsPage />} />
        </Route>
        <Route path="/claude-code" element={<ClaudeCodeLayout />}>
          <Route index element={<ClaudeCodePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/derivatives-forex" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
