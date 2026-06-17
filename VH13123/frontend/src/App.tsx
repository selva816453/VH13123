import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { AllNotifications } from './pages/AllNotifications';
import { PriorityNotifications } from './pages/PriorityNotifications';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notifications" element={<AllNotifications />} />
            <Route path="/priority" element={<PriorityNotifications />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </ThemeProvider>
  );
}
