import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { Trash2, AlertCircle } from 'lucide-react';

export default function CommentSection({ postId, postAuthorId, comments, onCommentsUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const newComment = await api.post(`/comments/post/${postId}`, {
        content: commentText.trim()
      });
      
      // Notify parent component to update state
      onCommentsUpdated([newComment, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      setSubmitError(err.message || 'Could not post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      // Notify parent to filter out deleted comment
      onCommentsUpdated(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <section className="comments-section" aria-labelledby="comments-heading">
      <div className="comments-header">
        <h2 id="comments-heading">
          Discussion ({comments.length})
        </h2>
      </div>

      <div className="thin-divider"></div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="form-group">
            <label htmlFor="new-comment" className="visually-hidden">Add a comment</label>
            <textarea
              id="new-comment"
              className="form-control comment-input"
              placeholder="Join the discussion... Share your thoughts."
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (submitError) setSubmitError('');
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          {submitError && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-submit-comment"
              disabled={isSubmitting || !commentText.trim()}
            >
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt-box">
          <p>Want to join the conversation?</p>
          <Link to="/login" className="btn btn-secondary">
            Sign in to comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment, index) => {
            const canDelete = isAuthenticated && (
              comment.author_id === user.id || postAuthorId === user.id
            );
            
            return (
              <div 
                key={comment.id} 
                className={`comment-item animate-fade-in delay-${Math.min(index + 1, 5)}`}
              >
                <div className="comment-meta">
                  <div className="commenter-info">
                    <div className="commenter-avatar">
                      {comment.author_name ? comment.author_name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="commenter-name">{comment.author_name}</span>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn-delete-comment"
                      aria-label="Delete comment"
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="comment-body">
                  <p>{comment.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-comments-box">
            <p className="no-comments-text">No comments yet. Be the first to share your thoughts.</p>
          </div>
        )}
      </div>

      <style>{`
        .comments-section {
          margin-top: 3.5rem;
          border-top: var(--border-thick);
          padding-top: 2rem;
          text-align: left;
        }

        .comments-header h2 {
          font-size: 1.65rem;
          font-family: var(--font-display);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }

        .comment-form {
          margin-bottom: 2.5rem;
        }

        .comment-input {
          min-height: 100px !important;
          font-size: 0.95rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.75rem;
        }

        .btn-submit-comment {
          min-height: 40px !important;
          padding: 0.5rem 1.25rem !important;
          font-size: 0.8rem !important;
        }

        .login-prompt-box {
          padding: 2rem;
          text-align: center;
          margin-bottom: 2.5rem;
          border: var(--border-thick);
          background: var(--bg-panel-secondary);
        }

        .login-prompt-box p {
          font-family: var(--font-meta);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
        }

        .comment-item {
          padding: 1.5rem 0;
          border-bottom: var(--border-divider);
        }

        .comment-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .commenter-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .commenter-avatar {
          width: 28px;
          height: 28px;
          background: #000000;
          color: #ffffff;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .commenter-name {
          font-family: var(--font-meta);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          display: block;
        }

        .comment-date {
          font-family: var(--font-meta);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .btn-delete-comment {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .btn-delete-comment:hover {
          background: #000000;
          color: #ffffff;
        }

        .comment-body {
          font-size: 0.95rem;
          color: var(--text-primary);
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .no-comments-box {
          padding: 3rem;
          text-align: center;
          border: var(--border-thick);
          border-style: dashed;
        }

        .no-comments-text {
          color: var(--text-muted);
          font-family: var(--font-meta);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
        }
      `}</style>
    </section>
  );
}
