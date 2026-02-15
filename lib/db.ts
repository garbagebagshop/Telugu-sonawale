
import { createClient } from '@libsql/client/web';
import { Guide } from '../types';
import { AUTHORS } from '../constants';

const url = "https://telugu-sonwale-vercel-icfg-fctpkxnw9kfbyxywrghysj9s.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzExNTQ4NTIsImlkIjoiYjc4ZmY0N2MtNzhlMi00NTlkLWJiYTktZDcxNjYzNTAyZGQyIiwicmlkIjoiNGM5ODhjY2ItZGUwMC00MDMyLWJhNDctZjE1ODlhNWQ1MWQ0In0.nux_sf42GQRnB_S9_IK5tNiagWcd1qSk2V28vDYgYqIgmUKayuT4Lw5GlcMIzjC4ALK9YaKO6neLRtug0-c0DQ";

export const client = createClient({
  url,
  authToken,
});

export const initDb = async () => {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        summary TEXT,
        content TEXT,
        author_handle TEXT,
        featured_image TEXT,
        image_alt TEXT,
        date TEXT,
        focus_keywords TEXT
      );
    `);
    
    // Migrations for existing tables
    try {
      await client.execute("ALTER TABLE articles ADD COLUMN image_alt TEXT;");
    } catch (e) {}
    try {
      await client.execute("ALTER TABLE articles ADD COLUMN focus_keywords TEXT;");
    } catch (e) {}
    
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};

export const fetchArticles = async (): Promise<Guide[]> => {
  try {
    const result = await client.execute("SELECT * FROM articles ORDER BY date DESC");
    return result.rows.map((row: any) => ({
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      content: row.content,
      author: AUTHORS[row.author_handle.replace('@', '')] || AUTHORS.skulkarni,
      featuredImage: row.featured_image,
      imageAlt: row.image_alt,
      date: row.date,
      focusKeywords: row.focus_keywords
    }));
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
};

export const saveArticleToDb = async (article: Guide) => {
  try {
    await client.execute({
      sql: `INSERT INTO articles (title, slug, summary, content, author_handle, featured_image, image_alt, date, focus_keywords) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        article.title, 
        article.slug, 
        article.summary, 
        article.content, 
        article.author.handle, 
        article.featuredImage || null, 
        article.imageAlt || article.title,
        article.date || new Date().toISOString(),
        article.focusKeywords || null
      ]
    });
    return true;
  } catch (error) {
    console.error("Failed to save article to Turso:", error);
    throw error;
  }
};
