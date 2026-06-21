import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import PostCard from '../components/PostCard.jsx';
import { Mail, Calendar, BookOpen, AlertCircle, FileText, PenSquare } from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  // Guard route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Fetch only posts created by this user
  useEffect(() => {
    if (isAuthenticated && user) {
      async function loadUserPosts() {
        setIsLoadingPosts(true);
        setError('');
        try {
          const allPosts = await api.get('/posts');
          // Filter client-side based on author id
          const filtered = allPosts.filter(post => post.author_id === user.id);
          setUserPosts(filtered);
        } catch (err) {
          console.error('Error fetching user posts:', err);
          setError('Failed to fetch your posts. Please try again later.');
        } finally {
          setIsLoadingPosts(false);
        }
      }

      loadUserPosts();
    }
  }, [user, isAuthenticated]);

  // Format Date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="profile-page container">
        <div className="skeleton-details">
          <div className="skeleton skeleton-title-large"></div>
          <div className="skeleton skeleton-body-line"></div>
          <div className="skeleton skeleton-body-line short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page container">
      <header className="page-header animate-fade-in">
        <h1 className="page-title">Creator Dashboard</h1>
        <p className="page-description">Manage your articles, review analytics, and update your profile details.</p>
      </header>

      <div className="profile-layout">
        {/* User Card Sidebar */}
        <aside className="profile-sidebar editorial-panel animate-fade-in delay-1">
          <div className="sidebar-header">
            <div className="profile-avatar">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="profile-username">{user.username}</h2>
            <span className="profile-badge">Author</span>
          </div>

          <div className="profile-details-list">
            <div className="detail-item">
              <Mail size={16} className="detail-icon" />
              <div>
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={16} className="detail-icon" />
              <div>
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="profile-stats-grid">
            <div className="stat-card">
              <span className="stat-number">{userPosts.length}</span>
              <span className="stat-label">Posts Published</span>
            </div>
          </div>
        </aside>

        {/* User's Posts Feed */}
        <main className="profile-main animate-fade-in delay-2">
          <div className="section-title-wrapper">
            <FileText size={20} className="section-icon" />
            <h2>Your Publications</h2>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {isLoadingPosts ? (
            <div className="profile-loading-list">
              {[1, 2].map((n) => (
                <div key={n} className="post-card-skeleton">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-footer"></div>
                </div>
              ))}
            </div>
          ) : userPosts.length > 0 ? (
            <div className="profile-posts-grid">
              {userPosts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  delayClass={`delay-${Math.min(index + 1, 5)}`}
                />
              ))}
            </div>
          ) : (
            <div className="no-posts-box">
              <BookOpen size={40} className="no-posts-icon" />
              <h3>You haven't written any posts yet</h3>
              <p>Start sharing your thoughts, guides, or projects with the community.</p>
              <Link to="/create-post" className="btn btn-primary">
                <PenSquare size={16} />
                <span>Write Your First Post</span>
              </Link>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .profile-sidebar {
          padding: 2.25rem;
          background: #ffffff;
          text-align: center;
          border: var(--border-thick);
          box-shadow: var(--shadow-flat);
        }

        .sidebar-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: var(--border-thin);
          padding-bottom: 1.5rem;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          background: #000000;
          color: #ffffff;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 1.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: var(--border-thick);
          margin-bottom: 1.25rem;
        }

        .profile-username {
          font-size: 1.65rem;
          font-family: var(--font-display);
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
          word-break: break-all;
        }

        .profile-badge {
          display: inline-block;
          font-family: var(--font-meta);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
          background: #000000;
          padding: 0.2rem 0.65rem;
        }

        .profile-details-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: left;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .detail-icon {
          color: #000000;
          margin-top: 0.15rem;
        }

        .detail-label {
          display: block;
          font-family: var(--font-meta);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .detail-value {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          word-break: break-all;
        }

        .profile-stats-grid {
          border-top: var(--border-thin);
          padding-top: 1.5rem;
        }

        .stat-card {
          background: #ffffff;
          border: var(--border-thick);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .stat-label {
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 0.25rem;
          letter-spacing: 0.05em;
        }

        .profile-main {
          text-align: left;
        }

        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          border-bottom: var(--border-double);
          padding-bottom: 0.5rem;
        }

        .section-title-wrapper h2 {
          font-size: 1.65rem;
          font-family: var(--font-display);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }

        .section-icon {
          color: #000000;
        }

        .profile-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .profile-loading-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
          .profile-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
