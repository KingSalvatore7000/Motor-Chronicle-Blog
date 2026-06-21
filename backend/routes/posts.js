import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/posts - Get all posts with author info
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    // Get posts ordered by latest, showing author's username and comment count
    const posts = await db.all(`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.author_id, 
        p.image_url,
        p.created_at, 
        p.updated_at,
        u.username AS author_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Internal server error fetching posts' });
  }
});

// GET /api/posts/:id - Get single post by id with comments & author info
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    
    // Get post
    const post = await db.get(`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.author_id, 
        p.image_url,
        p.created_at, 
        p.updated_at,
        u.username AS author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments for this post
    const comments = await db.all(`
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.author_id,
        u.username AS author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [id]);

    res.json({ ...post, comments });
  } catch (err) {
    console.error('Fetch single post error:', err);
    res.status(500).json({ error: 'Internal server error fetching post' });
  }
});

// POST /api/posts - Create a new post (Auth required)
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, image_url } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)',
      [title.trim(), content.trim(), req.user.id, image_url ? image_url.trim() : null]
    );

    const newPostId = result.lastID;
    
    const newPost = await db.get(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `, [newPostId]);

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Internal server error creating post' });
  }
});

// PUT /api/posts/:id - Edit an existing post (Auth & ownership required)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const db = await getDb();
    
    // Check ownership
    const post = await db.get('SELECT author_id FROM posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    // Update post
    await db.run(
      'UPDATE posts SET title = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title.trim(), content.trim(), image_url ? image_url.trim() : null, id]
    );

    const updatedPost = await db.get(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `, [id]);

    res.json(updatedPost);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: 'Internal server error updating post' });
  }
});

// DELETE /api/posts/:id - Delete a post (Auth & ownership required)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();

    // Check ownership
    const post = await db.get('SELECT author_id FROM posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    // Delete post (comments will cascade delete)
    await db.run('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ message: 'Post successfully deleted' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Internal server error deleting post' });
  }
});

export default router;
