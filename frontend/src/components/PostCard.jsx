import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Clock } from 'lucide-react';

export default function PostCard({ post, delayClass = 'delay-1' }) {
  // Format Date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
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

  // Get content snippet
  const getContentSnippet = (content, limit = 140) => {
    if (!content) return '';
    const cleanContent = content.replace(/[#*`_-]/g, ''); // strip basic md characters
    if (cleanContent.length <= limit) return cleanContent;
    return cleanContent.substring(0, limit) + '...';
  };

  return (
    <article className={`post-card editorial-panel animate-fade-in ${delayClass}`}>
      <Link to={`/posts/${post.id}`} className="post-card-click-area">
        {post.image_url && (
          <div className="card-cover-container">
            <img src={post.image_url} alt="" className="card-cover-image" />
          </div>
        )}
        <div className="post-card-header">
          <div className="post-author-info">
            <div className="author-initials">
              {post.author_name ? post.author_name.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <span className="author-name">{post.author_name || 'Anonymous'}</span>
              <span className="post-date">
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </div>

        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-snippet">{getContentSnippet(post.content)}</p>

        <div className="post-card-footer">
          <span className="post-metric">
            <Clock size={12} />
            {getReadingTime(post.content)}
          </span>
          
          <span className="post-metric">
            <MessageSquare size={12} />
            {post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </Link>

      <style>{`
        .post-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: var(--border-thick);
          box-shadow: var(--shadow-flat);
          transform: translate(-3px, -3px);
          background: #ffffff;
        }

        .post-card:hover {
          box-shadow: var(--shadow-flat-hover);
          transform: translate(-1px, -1px);
        }

        .card-cover-container {
          border-bottom: var(--border-thick);
          margin: -1.5rem -1.5rem 1.25rem -1.5rem;
          overflow: hidden;
          max-height: 180px;
          display: flex;
        }

        .card-cover-image {
          width: 100%;
          height: auto;
          object-fit: cover;
          filter: grayscale(100%) contrast(110%);
        }

        .post-card-click-area {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          height: 100%;
          text-align: left;
        }

        .post-card-header {
          margin-bottom: 1rem;
        }

        .post-author-info {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .author-initials {
          width: 32px;
          height: 32px;
          background: #000000;
          color: #ffffff;
          font-family: var(--font-meta);
          font-weight: 800;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .author-name {
          display: block;
          font-family: var(--font-meta);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .post-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-family: var(--font-meta);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 0.05rem;
        }

        .post-card-title {
          font-size: 1.45rem;
          font-family: var(--font-display);
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          transition: color var(--transition-fast);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-card:hover .post-card-title {
          text-decoration: underline;
        }

        .post-card-snippet {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-card-footer {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border-top: var(--border-thin);
          padding-top: 1rem;
          margin-top: auto;
        }

        .post-metric {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--font-meta);
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </article>
  );
}
