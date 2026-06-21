import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  let db;
  try {
    db = await getDb();
    console.log('✅ SQLite connection established');
    
    // Clear any existing test data (clean slate for tests)
    await db.run('DELETE FROM comments');
    await db.run('DELETE FROM posts');
    await db.run('DELETE FROM users');
    console.log('✅ Database tables cleared');

    // 1. Register test user
    const username = 'testuser';
    const email = 'testuser@example.com';
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const userResult = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    const userId = userResult.lastID;
    console.log(`✅ Test User registered. ID: ${userId}`);

    // Verify login password comparison
    const dbUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    const passMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!passMatch) throw new Error('Password verification failed!');
    console.log('✅ Password bcrypt verification succeeded');

    // 2. Create blog post
    const postTitle = 'Introducing SQLite Blogspot';
    const postContent = 'This is the very first post on our brand new blogging platform. SQLite is awesome!';
    const postResult = await db.run(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [postTitle, postContent, userId]
    );
    const postId = postResult.lastID;
    console.log(`✅ Test Blog Post created. ID: ${postId}`);

    // Verify post retrieval
    const dbPost = await db.get(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `, [postId]);
    if (!dbPost || dbPost.title !== postTitle) throw new Error('Post retrieval failed!');
    console.log(`✅ Post retrieved correctly: "${dbPost.title}" by ${dbPost.author_name}`);

    // 3. Create comment
    const commentContent = 'This is a great starting post! Keep it up.';
    const commentResult = await db.run(
      'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
      [postId, userId, commentContent]
    );
    const commentId = commentResult.lastID;
    console.log(`✅ Test Comment created. ID: ${commentId}`);

    // Verify comment retrieval
    const dbComment = await db.get(`
      SELECT c.*, u.username as author_name 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `, [commentId]);
    if (!dbComment || dbComment.content !== commentContent) throw new Error('Comment retrieval failed!');
    console.log(`✅ Comment retrieved correctly: "${dbComment.content}" by ${dbComment.author_name}`);

    // Verify post deletion cascade
    await db.run('DELETE FROM posts WHERE id = ?', [postId]);
    const deletedPost = await db.get('SELECT * FROM posts WHERE id = ?', [postId]);
    if (deletedPost) throw new Error('Post deletion failed!');
    console.log('✅ Post deletion succeeded');

    const orphanedComments = await db.all('SELECT * FROM comments WHERE post_id = ?', [postId]);
    if (orphanedComments.length > 0) throw new Error('Cascade comment deletion failed!');
    console.log('✅ Cascade deletion of comments succeeded');

    console.log('--- ALL BACKEND INTEGRATION TESTS PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
  }
}

runTests();
