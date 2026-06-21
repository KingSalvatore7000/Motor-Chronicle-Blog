import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { ArrowLeft, Edit3, Trash2, Calendar, Clock, User, AlertCircle } from 'lucide-react';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch post details on load
  const fetchPostDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get(`/posts/${id}`);
      setPost(data);
    } catch (err) {
      console.error('Error fetching post details:', err);
      setError('Failed to load post. It may have been deleted or the server is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  // Handle delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.message || 'Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  // Format Date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calculate reading time
  const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Custom callback for comments updating
  const handleCommentsUpdated = (newComments) => {
    setPost(prev => ({
      ...prev,
      comments: newComments
    }));
  };

  if (isLoading) {
    return (
      <div className="post-details-page container">
        <div className="skeleton-details">
          <div className="skeleton skeleton-back"></div>
          <div className="skeleton skeleton-title-large"></div>
          <div className="skeleton skeleton-meta"></div>
          <div className="skeleton skeleton-body-line"></div>
          <div className="skeleton skeleton-body-line"></div>
          <div className="skeleton skeleton-body-line short"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-details-page container">
        <div className="error-card">
          <AlertCircle size={40} className="error-icon" />
          <h2>Error Loading Post</h2>
          <p>{error || 'Post not found.'}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user && post.author_id === user.id;

  return (
    <div className="post-details-page container">
      {/* Back Button */}
      <Link to="/" className="btn-back animate-fade-in">
        <ArrowLeft size={14} />
        <span>Back to feed</span>
      </Link>

      <article className="post-article animate-fade-in delay-1">
        {/* Post Title */}
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>

          <div className="double-divider"></div>

          {/* Author/Date/Read Time Metadata */}
          <div className="post-metadata">
            <div className="metadata-left">
              <div className="author-badge">
                <span>By {post.author_name}</span>
              </div>
              <div className="meta-item">
                <Calendar size={14} />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="meta-item">
                <Clock size={14} />
                <span>{getReadingTime(post.content)}</span>
              </div>
            </div>

            {/* Author Action Controls */}
            {isAuthor && (
              <div className="metadata-right">
                <Link to={`/posts/${post.id}/edit`} className="btn-action-edit" title="Edit Post">
                  <Edit3 size={14} />
                  <span>Edit</span>
                </Link>
                <button 
                  onClick={handleDeletePost} 
                  className="btn-action-delete" 
                  disabled={isDeleting}
                  title="Delete Post"
                >
                  <Trash2 size={14} />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="thin-divider"></div>
        </header>

        {post.image_url && (
          <div className="post-cover-container animate-fade-in">
            <img src={post.image_url} alt="" className="post-cover-image" />
          </div>
        )}

        {/* Post Content Body */}
        <div className="post-content">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (!paragraph.trim()) return null;
            // Simple blockquote parser
            if (paragraph.trim().startsWith('>')) {
              return (
                <blockquote key={index}>
                  {paragraph.trim().replace(/^>\s*/, '')}
                </blockquote>
              );
            }
            // Simple header parser
            if (paragraph.trim().startsWith('###')) {
              return <h3 key={index}>{paragraph.trim().replace(/^###\s*/, '')}</h3>;
            }
            if (paragraph.trim().startsWith('##')) {
              return <h2 key={index}>{paragraph.trim().replace(/^##\s*/, '')}</h2>;
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>
      </article>

      {/* Discussion comments section */}
      <div className="animate-fade-in delay-2">
        <CommentSection
          postId={post.id}
          postAuthorId={post.author_id}
          comments={post.comments || []}
          onCommentsUpdated={handleCommentsUpdated}
        />
      </div>

      <style>{`
        .post-details-page {
          text-align: left;
          max-width: 800px !important;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #000000;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2rem;
          transition: color var(--transition-fast);
        }

        .btn-back:hover {
          text-decoration: underline;
        }

        .post-header {
          margin-bottom: 2.5rem;
        }

        .post-title {
          font-size: 3.5rem;
          line-height: 1.1;
          margin-bottom: 1rem;
          color: var(--text-primary);
          letter-spacing: -0.04em;
        }

        .post-metadata {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 0.5rem 0;
        }

        .metadata-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .author-badge {
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000000;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--font-meta);
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .metadata-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-action-edit, .btn-action-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--font-meta);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.4rem 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: var(--border-thin);
          background: #ffffff;
          color: #000000;
        }

        .btn-action-edit:hover {
          background: #000000;
          color: #ffffff;
        }

        .btn-action-delete {
          border-color: #dc2626;
          color: #dc2626;
        }

        .btn-action-delete:hover {
          background: #dc2626;
          color: #ffffff;
        }

        .post-cover-container {
          border: var(--border-thick);
          overflow: hidden;
          margin-bottom: 2.5rem;
          max-height: 480px;
          display: flex;
        }

        .post-cover-image {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .post-content {
          font-size: 1.15rem;
          color: #171717;
          line-height: 1.8;
        }

        .post-content p {
          margin-bottom: 1.75rem;
        }

        .post-content h2 {
          color: var(--text-primary);
          font-size: 1.75rem;
          margin: 2.5rem 0 1.25rem 0;
          border-bottom: var(--border-thin);
          padding-bottom: 0.35rem;
        }

        .post-content h3 {
          color: var(--text-primary);
          font-size: 1.35rem;
          margin: 2rem 0 1rem 0;
        }

        .post-content blockquote {
          border-left: 3px solid #000000;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-style: italic;
          color: #000000;
          line-height: 1.6;
        }

        /* Loading Skeletons */
        .skeleton-details {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: var(--border-thick);
        }

        .skeleton-back {
          height: 20px;
          width: 15%;
        }

        .skeleton-title-large {
          height: 48px;
          width: 90%;
          margin-top: 0.75rem;
        }

        .skeleton-meta {
          height: 20px;
          width: 50%;
          margin-bottom: 1.5rem;
        }

        .skeleton-body-line {
          height: 18px;
          width: 100%;
        }

        .skeleton-body-line.short {
          width: 70%;
        }

        .error-card {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          border: var(--border-thick);
          background: var(--bg-panel-secondary);
        }

        .error-icon {
          color: #dc2626;
        }

        .error-card h2 {
          font-size: 1.75rem;
          text-transform: uppercase;
        }

        .error-card p {
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        @media (max-width: 640px) {
          .post-title {
            font-size: 2.25rem;
          }
          .post-content {
            font-size: 1.05rem;
          }
          .post-metadata {
            flex-direction: column;
            align-items: flex-start;
          }
          .metadata-right {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
