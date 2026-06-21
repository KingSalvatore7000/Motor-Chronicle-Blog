import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, ArrowLeft, Image, Link2, Upload, Trash2 } from 'lucide-react';

export default function CreateEditPost() {
  const { id } = useParams(); // present if editing
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' or 'url'
  
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Guard: Protect page and load editing details if editing
  useEffect(() => {
    // If auth state loaded and not logged in, redirect to login
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: isEditMode ? `/posts/${id}/edit` : '/create-post' } } });
      return;
    }

    if (isEditMode && isAuthenticated) {
      async function loadPost() {
        setIsLoading(true);
        setError('');
        try {
          const post = await api.get(`/posts/${id}`);
          
          // Verify that current user is the author
          if (post.author_id !== user.id) {
            setError('Access forbidden: You are not the author of this post.');
            return;
          }

          setTitle(post.title);
          setContent(post.content);
          setImageUrl(post.image_url || '');
          
          // Auto-detect input mode based on loaded image type
          if (post.image_url) {
            if (post.image_url.startsWith('data:image/')) {
              setImageInputMode('upload');
            } else {
              setImageInputMode('url');
            }
          }
        } catch (err) {
          console.error('Error loading post for editing:', err);
          setError('Failed to fetch post details. The post may not exist or server is down.');
        } finally {
          setIsLoading(false);
        }
      }

      loadPost();
    }
  }, [id, isEditMode, isAuthenticated, isAuthLoading, navigate, user]);

  // File to base64 reader helper
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (e.g. limit to 2MB to keep SQLite payloads reasonable)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError('');

    const payload = {
      title,
      content,
      image_url: imageUrl || null
    };

    try {
      if (isEditMode) {
        await api.put(`/posts/${id}`, payload);
        navigate(`/posts/${id}`);
      } else {
        const newPost = await api.post('/posts', payload);
        navigate(`/posts/${newPost.id}`);
      }
    } catch (err) {
      console.error('Post submission error:', err);
      setError(err.message || 'Failed to submit post. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Word and character stats helper
  const getStats = () => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return { chars, words };
  };

  const stats = getStats();

  if (isAuthLoading || isLoading) {
    return (
      <div className="create-post-page container">
        <div className="skeleton-details">
          <div className="skeleton skeleton-title-large"></div>
          <div className="skeleton skeleton-body-line"></div>
          <div className="skeleton skeleton-body-line short"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-post-page container">
        <div className="error-card animate-fade-in">
          <AlertCircle size={40} className="error-icon" />
          <h2>Error</h2>
          <p>{error}</p>
          <Link to={isEditMode ? `/posts/${id}` : '/'} className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-page container">
      <header className="page-header animate-fade-in">
        <h1 className="page-title">{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
        <p className="page-description">
          {isEditMode 
            ? 'Refine your draft, correct mistakes, or add updates.' 
            : 'Share your restoration builds, track day reports, or automotive stories.'}
        </p>
      </header>

      {error && (
        <div className="error-banner animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Tabs & Controls */}
      <div className="editor-container editorial-panel animate-fade-in delay-1">
        <div className="editor-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            <span>Write</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
            disabled={!title.trim() && !content.trim()}
          >
            <span>Preview</span>
          </button>
        </div>

        {activeTab === 'write' ? (
          /* WRITE TAB FORM */
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label htmlFor="post-title">Title</label>
              <input
                type="text"
                id="post-title"
                className="form-control title-input"
                placeholder="Title your post..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* COVER IMAGE CONFIGURATOR */}
            <div className="form-group image-upload-section">
              <label>Cover Image (Optional)</label>
              <div className="image-mode-tabs">
                <button
                  type="button"
                  className={`mode-btn ${imageInputMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageInputMode('upload')}
                >
                  <Upload size={14} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${imageInputMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageInputMode('url')}
                >
                  <Link2 size={14} />
                  <span>Image URL</span>
                </button>
              </div>

              <div className="image-input-container">
                {imageInputMode === 'upload' ? (
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="post-image-file"
                      accept="image/*"
                      className="form-control"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                  </div>
                ) : (
                  <input
                    type="url"
                    id="post-image-url"
                    className="form-control"
                    placeholder="Paste external cover image URL (e.g. https://images.unsplash.com/...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                )}
              </div>

              {imageUrl && (
                <div className="image-preview-container">
                  <div className="preview-box">
                    <img src={imageUrl} alt="Cover Preview" className="cover-preview-img" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-remove-image"
                    onClick={() => setImageUrl('')}
                  >
                    <Trash2 size={14} />
                    <span>Clear Image</span>
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <div className="editor-body-label-wrapper">
                <label htmlFor="post-content">Body Content</label>
                <span className="editor-stats">
                  {stats.words} words | {stats.chars} characters
                </span>
              </div>
              <textarea
                id="post-content"
                className="form-control content-input"
                placeholder="Write your story here... Support blank lines for paragraph breaks. Use '>' for quotes, '##' or '###' for section headers."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="editor-actions">
              <Link to={isEditMode ? `/posts/${id}` : '/'} className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-publish"
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                <span>{isSubmitting ? 'Submitting...' : (isEditMode ? 'Save Changes' : 'Publish Post')}</span>
              </button>
            </div>
          </form>
        ) : (
          /* PREVIEW TAB */
          <div className="editor-preview">
            <h1 className="preview-title">{title || 'Untitled Post'}</h1>
            <div className="preview-meta">
              <span>Draft preview by <strong>{user?.username}</strong></span>
            </div>

            {imageUrl && (
              <div className="preview-cover-container">
                <img src={imageUrl} alt="Preview Cover" className="preview-cover-img" />
              </div>
            )}
            
            <div className="preview-body">
              {content ? (
                content.split('\n\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  
                  if (paragraph.trim().startsWith('>')) {
                    return (
                      <blockquote key={index}>
                        {paragraph.trim().replace(/^>\s*/, '')}
                      </blockquote>
                    );
                  }
                  if (paragraph.trim().startsWith('###')) {
                    return <h3 key={index}>{paragraph.trim().replace(/^###\s*/, '')}</h3>;
                  }
                  if (paragraph.trim().startsWith('##')) {
                    return <h2 key={index}>{paragraph.trim().replace(/^##\s*/, '')}</h2>;
                  }
                  return <p key={index}>{paragraph}</p>;
                })
              ) : (
                <p className="preview-placeholder">Empty post body. Switch to 'Write' tab to add content.</p>
              )}
            </div>

            <div className="editor-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setActiveTab('write')}
              >
                Back to Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .create-post-page {
          text-align: left;
          max-width: 860px !important;
        }

        .editor-container {
          background: #ffffff;
          overflow: hidden;
          margin-bottom: 2rem;
          border: var(--border-thick);
        }

        .editor-tabs {
          display: flex;
          background: #ffffff;
          border-bottom: var(--border-thick);
        }

        .tab-btn {
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000000;
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          border-right: var(--border-thin);
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .tab-btn.active {
          background: #000000;
          color: #ffffff;
          border-bottom-color: #000000;
        }

        .tab-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .editor-form {
          padding: 2rem;
        }

        .title-input {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.35rem;
          height: 56px;
        }

        /* Image config styles */
        .image-upload-section {
          border: var(--border-thin);
          padding: 1.25rem;
          background: var(--bg-panel-secondary);
        }

        .image-mode-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.4rem 0.85rem;
          cursor: pointer;
          background: #ffffff;
          color: #000000;
          border: var(--border-thin);
          transition: all var(--transition-fast);
        }

        .mode-btn.active {
          background: #000000;
          color: #ffffff;
        }

        .image-input-container {
          margin-bottom: 1rem;
        }

        .image-preview-container {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          border-top: var(--border-thin);
          padding-top: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .preview-box {
          border: var(--border-thick);
          overflow: hidden;
          max-width: 280px;
          max-height: 180px;
          display: flex;
        }

        .cover-preview-img {
          width: 100%;
          height: auto;
          object-fit: cover;
          filter: grayscale(100%) contrast(110%);
        }

        .btn-remove-image {
          min-height: 40px !important;
          padding: 0.5rem 1rem !important;
          font-size: 0.75rem !important;
        }

        .editor-body-label-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .editor-body-label-wrapper label {
          margin-bottom: 0;
        }

        .editor-stats {
          font-family: var(--font-meta);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .content-input {
          min-height: 320px !important;
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .editor-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          border-top: var(--border-thin);
          padding-top: 1.5rem;
        }

        .btn-publish {
          min-width: 140px;
        }

        /* Preview styles */
        .editor-preview {
          padding: 2.5rem;
        }

        .preview-title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.2;
          color: var(--text-primary);
        }

        .preview-meta {
          font-family: var(--font-meta);
          font-size: 0.85rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 2rem;
          border-bottom: var(--border-thin);
          padding-bottom: 0.75rem;
        }

        .preview-cover-container {
          border: var(--border-thick);
          overflow: hidden;
          margin-bottom: 2rem;
          max-height: 400px;
          display: flex;
        }

        .preview-cover-img {
          width: 100%;
          height: auto;
          object-fit: cover;
          filter: grayscale(100%) contrast(110%);
        }

        .preview-body {
          font-size: 1.15rem;
          color: var(--text-secondary);
          line-height: 1.8;
          min-height: 250px;
        }

        .preview-body p {
          margin-bottom: 1.5rem;
        }

        .preview-body h2 {
          color: var(--text-primary);
          font-size: 1.65rem;
          margin: 2rem 0 1rem 0;
          border-bottom: var(--border-thin);
          padding-bottom: 0.25rem;
        }

        .preview-body h3 {
          color: var(--text-primary);
          font-size: 1.25rem;
          margin: 1.5rem 0 0.75rem 0;
        }

        .preview-body blockquote {
          border-left: 3px solid #000000;
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-family: var(--font-display);
          font-style: italic;
          color: #000000;
        }

        .preview-placeholder {
          font-family: var(--font-meta);
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          margin-top: 4rem;
        }
      `}</style>
    </div>
  );
}
