
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import TablePage from './pages/TablePage';
import ControlloQualita from './pages/ControlloQualita';


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
        <Route path="/controllo-qualita" element={<ControlloQualita />} />
      </Routes>
    </MainLayout>
  </Router>
);

export default App;
