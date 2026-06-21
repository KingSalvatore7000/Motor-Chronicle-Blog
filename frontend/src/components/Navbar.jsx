import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PenSquare, LogOut, User, Home, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span>MOTOR CHRONICLE</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <span>Home</span>
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <span>Dashboard</span>
              </NavLink>
              
              <Link to="/create-post" className="btn btn-primary btn-navbar">
                <PenSquare size={14} />
                <span>Write</span>
              </Link>

              <div className="navbar-user">
                <div className="user-avatar" title={`Logged in as ${user.username}`}>
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="user-name">{user.username}</span>
                <button onClick={handleLogout} className="btn-icon-logout" aria-label="Log Out" title="Log Out">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-navbar">
              Sign In
            </Link>
          )}
        </div>
      </div>
      
      <style>{`
        .glass-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          border-bottom: 2px solid #000000;
          height: 80px;
          display: flex;
          align-items: center;
        }

        .navbar-container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 1.5rem;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.85rem;
          letter-spacing: -0.05em;
          color: #000000;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .navbar-link {
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #000000;
          padding: 0.5rem 0.75rem;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .navbar-link:hover, .navbar-link.active {
          border-bottom-color: #000000;
        }

        .btn-navbar {
          min-height: 40px !important;
          padding: 0.5rem 1.15rem !important;
          font-size: 0.8rem !important;
          border: var(--border-thin) !important;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          border-left: 1px solid #e5e5e5;
          padding-left: 1.25rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #000000;
          color: #ffffff;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-family: var(--font-meta);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000000;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-icon-logout {
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          padding: 0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .btn-icon-logout:hover {
          background: #000000;
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .user-name {
            display: none;
          }
          .navbar-logo {
            font-size: 1.45rem;
          }
          .navbar-container {
            padding: 0 1rem;
          }
          .navbar-links {
            gap: 0.75rem;
          }
          .navbar-user {
            padding-left: 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
}
