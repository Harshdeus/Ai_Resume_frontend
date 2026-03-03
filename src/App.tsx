import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JDManagement from './pages/JDManagement';
import ResumeCompare from './pages/ResumeCompare';
import CandidateList from './pages/CandidateList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jd-management" element={<JDManagement />} />
          <Route path="resume-compare" element={<ResumeCompare />} />
          <Route path="candidate-list" element={<CandidateList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
