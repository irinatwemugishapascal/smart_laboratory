import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Experiments from './pages/Experiments';
import ExperimentDetail from './pages/ExperimentDetail';
import VirtualChemistryLab from './pages/VirtualChemistryLab';
import Results from './pages/Results';
import AIChat from './pages/AIChat';
import Videos from './pages/Videos';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              <Route element={<Layout />}>
                <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/experiments" element={<Experiments />} />
                  <Route path="/experiments/:id" element={<ExperimentDetail />} />
                  <Route path="/chemistry-lab" element={<VirtualChemistryLab />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/badges" element={<Badges />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
