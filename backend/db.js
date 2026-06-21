import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'blogspot.db');

let db = null;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON;');

  // Initialize tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migrate posts table to include image_url
  try {
    await db.run('ALTER TABLE posts ADD COLUMN image_url TEXT');
  } catch (err) {
    // If column already exists, this query fails, which is expected.
  }

  // Seed default car-themed data if empty
  try {
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount && userCount.count === 0) {
      console.log('Seeding default car-themed data...');
      
      const bcrypt = await import('bcryptjs');
      const passHash = await bcrypt.default.hash('Password123!', 10);
      
      // Seed users
      const users = [
        { username: 'ev_enthusiast', email: 'ev@motorchronicle.com' },
        { username: 'classic_collector', email: 'collector@motorchronicle.com' },
        { username: 'heritage_writer', email: 'heritage@motorchronicle.com' },
        { username: 'road_tripper', email: 'trips@motorchronicle.com' },
        { username: 'spotlight_editor', email: 'editor@motorchronicle.com' },
        { username: 'design_critic', email: 'design@motorchronicle.com' }
      ];

      const userIds = {};
      for (const u of users) {
        const res = await db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [u.username, u.email, passHash]
        );
        userIds[u.username] = res.lastID;
      }

      // Seed Posts
      const postsToSeed = [
        {
          title: "Are EVs actually ready for India's roads?",
          content: "Electric vehicles are arriving in force, but the infrastructure remains a puzzle. As we navigate monsoon floods, potholed highway stretches, and rural charging deserts, the question is real: is an EV ready for India?\n\n## The Infrastructure Divide\nIn major metros like Bengaluru, Mumbai, and Delhi, public charging stations are multiplying fast. However, highway charging is still a game of careful navigation planning. If you get stuck in a multi-hour traffic jam with your air conditioning running, range anxiety becomes very real.\n\n> The transition to electric mobility is inevitable, but India's diverse climates and road conditions require bespoke engineering solutions, not just imported tech.\n\nWith battery thermal management being tested by peak summer heat, the local adaptation of battery packs is crucial.",
          author: 'ev_enthusiast',
          image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: "Why certain old cars are making a comeback",
          content: "Modern cars are safer, faster, and more efficient than ever, yet they often lack a critical ingredient: soul. We are seeing a surge in collectors restoring everyday classics from the 80s and 90s.\n\n## The Analog Connection\nIn an age of digital screens and driver assists, motorists are craving physical feedback. A manual gearbox, a cable-actuated throttle, and hydraulic steering connect you to the tarmac in a way that modern drive-by-wire systems simply cannot.\n\n> We don't buy old cars because they are faster; we buy them because they make us feel something.\n\nWhether it's a retro hatchback or a boxy off-roader, analog machines are reclaiming their space on the road.",
          author: 'classic_collector',
          image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: "The rise of car culture in India — then vs now",
          content: "For decades, the Indian automotive landscape was defined by the reliable Ambassador and the nimble Maruti 800. Today, a vibrant car culture has exploded, spanning track day events, modified car meets, and off-road clubs.\n\n## From Utility to Passion\nHistorically, cars in India were bought strictly as family transit utility. Today, cars have become a medium for self-expression. Cars meets are filling parking lots in major cities, showcasing custom wraps, performance tuning, and classic restorations.\n\n> Car culture in India is no longer just about owning a vehicle; it is about community, heritage, and the joy of driving.\n\nThe future of Indian automotive enthusiasts is brighter and faster than ever.",
          author: 'heritage_writer',
          image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: "Road trip diaries with car photography",
          content: "There is no better way to explore the vast landscapes of India than from behind the wheel. From the winding hairpins of the Himalayas to the coastal roads of Goa, our camera captured the perfect union of machine and nature.\n\n## Packing the Gear\nConquering mountain passes requires a capable 4x4, solid tires, and patience. The reward is capturing a rugged machine set against dust, snow, and endless horizons.\n\n> A road trip isn't measured in miles, but in the memories captured and the roads conquered.\n\nCheck out our photo gallery of the latest expedition across the high-altitude deserts of Ladakh.",
          author: 'road_tripper',
          image_url: 'https://images.unsplash.com/photo-1469037490079-7a13f283d5c1?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: "\"Car of the week\" spotlight posts",
          content: "This week, we shine the spotlight on a legend: the Mitsubishi Lancer Evolution VI. Born in the mud and gravel of the World Rally Championship, the Evo VI remains a benchmark for raw, visceral performance.\n\n## Rally Breeding\nWith its active yaw control, turbocharged inline-four, and aggressive twin-element rear wing, the Lancer Evo VI is a weapon on winding mountain passes.\n\n> The Evo VI doesn't filter the driving experience; it amplifies it, communicating traction directly to your fingertips.\n\nIt remains a timeless icon of the rally-bred era.",
          author: 'spotlight_editor',
          image_url: 'https://images.unsplash.com/photo-1611245801484-8189fa00c72f?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: "Then vs Now: iconic car redesigns",
          content: "How do you modernize an icon without losing its essence? We analyze the design transitions of legendary models like the Land Rover Defender and the Ford Mustang across generations.\n\n## Preserving the Silhouette\nA successful redesign maintains core design elements—the stance, the roofline silhouette, and signature lights—while adapting to modern safety structures and aerodynamics.\n\n> Design is a balance of heritage and innovation; forget your past, and you lose your identity; ignore the future, and you become obsolete.\n\nWe dive deep into the sketches and proportions that define the modern iterations of classic legends.",
          author: 'design_critic',
          image_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
        }
      ];

      for (const p of postsToSeed) {
        await db.run(
          'INSERT INTO posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)',
          [p.title, p.content, userIds[p.author], p.image_url]
        );
      }
      
      console.log('Default car-themed database seeding completed.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }

  return db;
}
