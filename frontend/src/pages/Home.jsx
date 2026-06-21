import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import PostCard from '../components/PostCard.jsx';
import { Search, PenSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch posts
  const fetchPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not retrieve posts. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      (post.author_name && post.author_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="home-page container">
      {/* Editorial Header Banner */}
      <header className="home-hero">
        <div className="double-divider"></div>
        <div className="hero-content">
          <div className="hero-meta-row">
            <span className="hero-date">ISSUE NO. 1</span>
            <span className="hero-badge">THE MOTOR CHRONICLE</span>
            <span className="hero-vol">VOL. XXVI</span>
          </div>
          <div className="thin-divider"></div>
          
          <h1 className="hero-title">Discover Machine, Speed, and Automotive Culture.</h1>
          
          <div className="thin-divider"></div>
          
          <p className="hero-description">
            A high-contrast, flat editorial space dedicated to classic restorations, automotive culture, motorsport heritage, and modern engineering. Just raw, unfiltered engine notes printed to the digital page.
          </p>
          
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/create-post" className="btn btn-primary">
                <PenSquare size={16} />
                <span>Write a Post</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Get Started
              </Link>
            )}
            <button onClick={fetchPosts} className="btn btn-secondary" aria-label="Refresh posts">
              <RefreshCw size={14} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
        <div className="double-divider"></div>
      </header>

      {/* Toolbar / Search Section */}
      <div className="feed-toolbar animate-fade-in delay-1">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search publications by title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search posts"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-banner animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="loading-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="post-card-skeleton">
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-footer"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Posts Feed */
        <div className="posts-container">
          {filteredPosts.length > 0 ? (
            <div className="posts-grid">
              {filteredPosts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  delayClass={`delay-${Math.min(index + 1, 5)}`} 
                />
              ))}
            </div>
          ) : (
            <div className="no-posts-box animate-fade-in">
              <h2>The garage is empty</h2>
              <p>
                {searchQuery 
                  ? `No articles matched your search: "${searchQuery}"` 
                  : "The editorial board is currently awaiting submissions from car writers."}
              </p>
              {isAuthenticated ? (
                <Link to="/create-post" className="btn btn-primary">
                  Submit First Article
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Sign In to Write
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .home-hero {
          margin-bottom: 2.5rem;
          text-align: center;
        }

        .hero-content {
          padding: 1rem 0;
        }

        .hero-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000000;
        }

        .hero-badge {
          background: #000000;
          color: #ffffff;
          padding: 0.25rem 1rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.05;
          margin: 1.5rem 0;
          letter-spacing: -0.04em;
          text-transform: uppercase;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 1.15rem;
          max-width: 800px;
          margin: 0 auto 2rem auto;
          line-height: 1.6;
          color: #262626;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .feed-toolbar {
          margin-bottom: 2.5rem;
        }

        .search-bar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          color: #000000;
        }

        .search-input {
          padding-left: 3rem !important;
          background: #ffffff;
          min-height: 52px !important;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }

        .post-card-skeleton {
          padding: 1.5rem;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border: var(--border-thick);
          background: #ffffff;
        }

        /* Skeleton styling */
        .skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .skeleton-avatar {
          width: 32px;
          height: 32px;
        }

        .skeleton-title {
          height: 24px;
          width: 80%;
          margin-top: 0.5rem;
        }

        .skeleton-text {
          height: 16px;
          width: 100%;
          margin-top: 0.25rem;
        }

        .skeleton-text.short {
          width: 60%;
        }

        .skeleton-footer {
          height: 20px;
          width: 40%;
          margin-top: auto;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .no-posts-box {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          border: var(--border-thick);
          background: var(--bg-panel-secondary);
        }

        .no-posts-box h2 {
          font-size: 2rem;
          text-transform: uppercase;
        }

        .no-posts-box p {
          color: var(--text-secondary);
          max-width: 400px;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .hero-description {
            font-size: 1rem;
          }
          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .hero-meta-row {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
