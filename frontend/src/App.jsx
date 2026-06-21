import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import PostDetails from './pages/PostDetails.jsx';
import CreateEditPost from './pages/CreateEditPost.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/posts/:id/edit" element={<CreateEditPost />} />
              <Route path="/create-post" element={<CreateEditPost />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
      
      <style>{`
        .app-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content-area {
          flex: 1 0 auto;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </BrowserRouter>
  );
}
