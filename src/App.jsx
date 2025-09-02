
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import TablePage from './pages/TablePage';


const App = () => (
  <Router>
    <MainLayout>
      <Toaster position="top-right"
  toastOptions={{
    success: {
      style: { background: 'green', color: 'white' },
      iconTheme: { primary: 'white', secondary: 'green' },
    },
    error: {
      style: { background: 'red', color: 'white' },
      iconTheme: { primary: 'white', secondary: 'red' },
    },
  }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<TablePage />} />
      </Routes>
    </MainLayout>
  </Router>
);

export default App;
