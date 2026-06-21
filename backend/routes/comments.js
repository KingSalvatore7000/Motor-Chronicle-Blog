import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/posts/:postId/comments - Create a new comment (Auth required)
// Note: We mount this on `/posts` in server.js, so the full route will be `/api/posts/:postId/comments`
// Wait! Let's mount the comments router at `/api/posts` for post comments, or `/api/comments` for deletion.
// Let's implement BOTH in this router or adapt accordingly.
// We can define:
// POST /:postId/comments (when mounted at `/api/posts`)
// DELETE /comments/:id (when mounted at `/api/comments` or `/api/posts/comments`)
// Let's design the comments router to handle both:
// 1. POST /:postId/comments (creates comment under post)
// 2. DELETE /comments/:id (deletes comment by id)
// To keep mounting simple, let's mount this comments router at `/api/comments`.
// Then we can do:
// - POST /post/:postId (or just POST /:postId)
// - DELETE /:id
// Let's structure the endpoint URLs exactly as:
// POST /api/comments/post/:postId -> Create comment
// DELETE /api/comments/:id -> Delete comment
// That is very clean and RESTful! Let's do that.

// POST /api/comments/post/:postId
router.post('/post/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  try {
    const db = await getDb();

    // Verify post exists
    const post = await db.get('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Insert comment
    const result = await db.run(
      'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
      [postId, req.user.id, content.trim()]
    );

    const newCommentId = result.lastID;

    // Fetch newly created comment with author name
    const newComment = await db.get(`
      SELECT c.id, c.content, c.created_at, c.author_id, u.username as author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [newCommentId]);

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Internal server error creating comment' });
  }
});

// DELETE /api/comments/:id - Delete a comment (Auth required)
// Can be deleted by: 1) comment author, or 2) post author
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();

    // Fetch comment and the associated post author
    const comment = await db.get(`
      SELECT c.author_id AS comment_author_id, p.author_id AS post_author_id
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      WHERE c.id = ?
    `, [id]);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    const isCommentAuthor = comment.comment_author_id === req.user.id;
    const isPostAuthor = comment.post_author_id === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this comment' });
    }

    // Delete comment
    await db.run('DELETE FROM comments WHERE id = ?', [id]);

    res.json({ message: 'Comment successfully deleted' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Internal server error deleting comment' });
  }
});

export default router;
