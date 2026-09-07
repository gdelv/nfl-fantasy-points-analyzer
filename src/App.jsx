import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FiltersProvider } from './context/FiltersContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Leaders from './pages/Leaders';
import Contracts from './pages/Contracts';
import PlayerDetail from './pages/PlayerDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <FiltersProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/leaders" element={<Leaders />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </FiltersProvider>
  );
}
