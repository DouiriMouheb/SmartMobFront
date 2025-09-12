
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import TablePage from './pages/TablePage';
import ControlloQualita from './pages/ControlloQualita';
import DispositiviMultimediali from './pages/DispositiviMultimediali';
import RealtimeControlloQualita from './pages/RealtimeControlloQualita';
import Acquisizioni from './pages/Acquisizioni';
import RealtimeLatestSingle from './pages/RealtimeLatestSingle';


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
        <Route path="/acquisizioni" element={<Acquisizioni />} />
        <Route path="/controllo-qualita" element={<ControlloQualita />} />
        <Route path="/dispositivi-multimediali" element={<DispositiviMultimediali />} />
        <Route path="/realtime-controllo" element={<RealtimeControlloQualita />} />
        <Route path="/realtime-latest" element={<RealtimeLatestSingle />} />
        
      </Routes>
    </MainLayout>
  </Router>
);

export default App;
