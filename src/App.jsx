import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CaseTemplate from './components/CaseTemplate';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/case/:id" element={<CaseTemplate />} />
    </Routes>
  );
}
