import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, Key, Mail, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      // Successful auth triggers useEffect redirect
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-page container">
      <div className="login-card-wrapper animate-fade-in">
        <div className="login-card editorial-panel">
          <div className="login-header">
            <h1 className="login-title">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="login-subtitle">
              {isLoginMode 
                ? 'Sign in to share your ideas and comment on posts.' 
                : 'Join Blogspot to write posts and discuss with others.'}
            </p>
          </div>

          <div className="thin-divider"></div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLoginMode}
                    autoComplete="username"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete={isLoginMode ? 'username' : 'email'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Key size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control password-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                  minLength={6}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLoginMode && (
                <span className="form-hint">Must be at least 6 characters.</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isLoginMode ? 'Signing in...' : 'Registering...') 
                : (isLoginMode ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleMode} className="btn-link-toggle" type="button">
                {isLoginMode ? 'Register here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
        }

        .login-card-wrapper {
          width: 100%;
          max-width: 460px;
        }

        .login-card {
          padding: 2.5rem;
          text-align: left;
          border: var(--border-thick);
          box-shadow: var(--shadow-flat);
          background: #ffffff;
        }

        .login-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .login-title {
          font-size: 2rem;
          font-family: var(--font-display);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          font-family: var(--font-meta);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #000000;
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-left: 2.75rem;
        }

        .password-input {
          padding-right: 2.75rem;
        }

        .btn-toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          transition: color var(--transition-fast);
        }

        .btn-toggle-password:hover {
          color: var(--text-muted);
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }

        .login-footer {
          text-align: center;
          border-top: var(--border-thin);
          padding-top: 1.25rem;
          font-family: var(--font-meta);
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .btn-link-toggle {
          background: none;
          border: none;
          color: #000000;
          font-weight: 800;
          cursor: pointer;
          margin-left: 0.35rem;
          transition: color var(--transition-fast);
          text-decoration: underline;
        }

        .btn-link-toggle:hover {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
