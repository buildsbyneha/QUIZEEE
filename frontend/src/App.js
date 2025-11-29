// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Common/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import ExamSetup from './components/Exam/ExamSetup';
import QuizCard from './components/Exam/QuizCard';
import ResultsScreen from './components/Exam/ResultScreen';
import ProgressDashboard from './components/Progress/ProgressDashboard';
import Leaderboard from './components/Leaderboard/Leaderboard';
import PYQBrowser from './components/PYQ/PYQBrowser';

import './styles/variables.css';
import './styles/global.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <div className="app-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/exam/setup" 
                element={
                  <ProtectedRoute>
                    <ExamSetup />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/exam/:id" 
                element={
                  <ProtectedRoute>
                    <QuizCard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/exam/:id/results" 
                element={
                  <ProtectedRoute>
                    <ResultsScreen />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/progress" 
                element={
                  <ProtectedRoute>
                    <ProgressDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/pyq" 
                element={
                  <ProtectedRoute>
                    <PYQBrowser />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 - Not Found */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;