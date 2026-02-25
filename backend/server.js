import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { parse } from 'url';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'visrodeck-secret-change-in-production';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'visrodeck',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt VARCHAR(500),
      author_id INT NOT NULL,
      featured_image VARCHAR(500),
      published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt VARCHAR(500),
      author_id INT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_room (room)
    ) ENGINE=InnoDB
  `);

  // ===========================
  // LABS TABLES
  // ===========================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS labs_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type ENUM('article','code','model','resource','project') DEFAULT 'article',
      category VARCHAR(100) DEFAULT 'other',
      tags VARCHAR(500),
      code_language VARCHAR(50),
      code_content TEXT,
      resource_links TEXT,
      author_id INT NOT NULL,
      votes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id),
      INDEX idx_type (type),
      INDEX idx_category (category),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS labs_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES labs_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS labs_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      UNIQUE KEY unique_vote (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES labs_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB
  `);

  const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin']);
  if (existing.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'admin@visrodeck.com', hash, 'Admin', 'User', true]
    );
    console.log('Default admin created: admin / admin123');
  }

  console.log('Database ready');
}

const auth = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const admin = async (req, res, next) => {
  const [rows] = await pool.query(
    'SELECT is_admin FROM users WHERE id = ?',
    [req.user.userId]
  );

  if (!rows[0]?.is_admin)
    return res.status(403).json({ error: 'Admin required' });

  next();
};

// ======================
// AUTH ROUTES
// ======================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'Required fields missing' });

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      return res.status(400).json({ error: 'Username: 3-20 chars, letters/numbers/underscore only' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0)
      return res.status(400).json({ error: 'Username or email already exists' });

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hash, firstName || null, lastName || null]
    );

    const token = jwt.sign(
      { userId: result.insertId, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: result.insertId,
        username,
        email,
        isAdmin: false
      }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!users.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];

    if (!await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: !!user.is_admin
      }
    });

  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const [users] = await pool.query(
    'SELECT id, username, email, first_name, last_name, is_admin FROM users WHERE id = ?',
    [req.user.userId]
  );

  if (!users.length)
    return res.status(404).json({ error: 'User not found' });

  const u = users[0];

  res.json({
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    isAdmin: !!u.is_admin
  });
});

// ======================
// LABS ROUTES
// ======================

app.get('/api/labs/posts', auth, async (req, res) => {
  try {
    const { category, type } = req.query;

    let query = `
      SELECT p.*, u.username as author_username,
        (SELECT COUNT(*) FROM labs_votes v WHERE v.post_id = p.id) as votes,
        (SELECT COUNT(*) FROM labs_comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM labs_votes v2 WHERE v2.post_id = p.id AND v2.user_id = ?) as user_voted
      FROM labs_posts p JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;

    const params = [req.user.userId];

    if (category && category !== 'all') {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (type && type !== 'all') {
      query += ' AND p.type = ?';
      params.push(type);
    }

    query += ' ORDER BY p.created_at DESC LIMIT 50';

    const [rows] = await pool.query(query, params);

    res.json(rows.map(r => ({
      ...r,
      user_voted: r.user_voted > 0
    })));

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/labs/posts', auth, async (req, res) => {
  try {
    const {
      title, content, type,
      category, tags,
      codeLanguage, codeContent,
      resourceLinks
    } = req.body;

    if (!title || !content)
      return res.status(400).json({ error: 'Title and content required' });

    const [result] = await pool.query(
      `INSERT INTO labs_posts 
       (title, content, type, category, tags, code_language, code_content, resource_links, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        type || 'article',
        category || 'other',
        tags,
        codeLanguage,
        codeContent,
        resourceLinks,
        req.user.userId
      ]
    );

    res.json({ success: true, id: result.insertId });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.post('/api/labs/posts/:id/vote', auth, async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM labs_votes WHERE post_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (existing.length > 0) {
      await pool.query(
        'DELETE FROM labs_votes WHERE post_id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );
    } else {
      await pool.query(
        'INSERT INTO labs_votes (post_id, user_id) VALUES (?, ?)',
        [req.params.id, req.user.userId]
      );
    }

    const [count] = await pool.query(
      'SELECT COUNT(*) as votes FROM labs_votes WHERE post_id = ?',
      [req.params.id]
    );

    res.json({
      votes: count[0].votes,
      voted: existing.length === 0
    });

  } catch {
    res.status(500).json({ error: 'Vote failed' });
  }
});

app.get('/api/labs/posts/:id/comments', auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, u.username
     FROM labs_comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [req.params.id]
  );

  res.json(rows);
});

app.post('/api/labs/posts/:id/comments', auth, async (req, res) => {
  const { content } = req.body;

  if (!content?.trim())
    return res.status(400).json({ error: 'Content required' });

  const [result] = await pool.query(
    'INSERT INTO labs_comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [req.params.id, req.user.userId, content.trim()]
  );

  const [rows] = await pool.query(
    `SELECT c.*, u.username
     FROM labs_comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [result.insertId]
  );

  res.json(rows[0]);
});

// ======================
// HEALTH
// ======================

app.get('/api/health', (req, res) =>
  res.json({ status: 'online' })
);

// ======================
// WEBSOCKET CHAT
// ======================

const clients = new Map();

wss.on('connection', (ws, req) => {
  const { query } = parse(req.url, true);

  let username = 'anonymous';

  try {
    if (query.token)
      username = jwt.verify(query.token, JWT_SECRET).username;
  } catch {
    ws.close(4001, 'Invalid token');
    return;
  }

  clients.set(ws, { username, room: 'general' });
  broadcastCount();

  ws.on('message', async (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const info = clients.get(ws);

      if (data.type === 'join') {
        clients.set(ws, { ...info, room: data.room });

        const [history] = await pool.query(
          'SELECT * FROM chat_messages WHERE room = ? ORDER BY timestamp DESC LIMIT 50',
          [data.room]
        );

        ws.send(JSON.stringify({
          type: 'history',
          room: data.room,
          messages: history.reverse()
        }));
      }

      if (data.type === 'message' && data.text?.trim()) {
        const text = data.text.trim().slice(0, 500);
        const timestamp = new Date().toISOString();

        await pool.query(
          'INSERT INTO chat_messages (room, username, text) VALUES (?, ?, ?)',
          [info.room, info.username, text]
        );

        const payload = JSON.stringify({
          type: 'message',
          room: info.room,
          username: info.username,
          text,
          timestamp
        });

        clients.forEach((c, cws) => {
          if (c.room === info.room && cws.readyState === 1)
            cws.send(payload);
        });
      }

    } catch (e) {
      console.error('WS error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastCount();
  });
});

function broadcastCount() {
  const payload = JSON.stringify({
    type: 'online_count',
    count: clients.size
  });

  clients.forEach((_, ws) => {
    if (ws.readyState === 1)
      ws.send(payload);
  });
}

// ======================
// START SERVER
// ======================

async function start() {
  await initDB();

  server.listen(PORT, () => {
    console.log('VISRODECK SERVER v2 ONLINE');
    console.log(`Port: ${PORT}`);
    console.log(`MySQL: connected`);
    console.log(`WebSocket chat: ready`);
  });
}

start().catch(e => {
  console.error('Startup failed:', e);
  process.exit(1);
});
