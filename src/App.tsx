import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import JDManagement from "./pages/JDManagement";
import ResumeCompare from "./pages/ResumeCompare";
import CandidateList from "./pages/CandidateList";
import Templates from "./pages/Templates";
import TemplateList from "./pages/TemplateList";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

/*
  ProtectedRoute
  ----------------
  Checks if JWT token exists in localStorage.
  If not -> redirect to login page.
*/
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="jd-management" element={<JDManagement />} />
          <Route path="resume-compare" element={<ResumeCompare />} />
          <Route path="candidate-list" element={<CandidateList />} />
          <Route path="templates" element={<Templates />} />
          <Route path="template-list" element={<TemplateList />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;