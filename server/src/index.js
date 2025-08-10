import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import matter from 'gray-matter';
import slugify from 'slugify';
import dayjs from 'dayjs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 环境 & 目录
const PORT = process.env.PORT || 4000;
const SITE_ROOT = path.resolve(process.env.SITE_ROOT || path.join(process.cwd(), '..', 'web'));
const CONTENT_NEWS_DIR = path.join(SITE_ROOT, process.env.CONTENT_NEWS_DIR || 'content/news');
const CONTENT_TEAM_DIR = path.join(SITE_ROOT, process.env.CONTENT_TEAM_DIR || 'content/team');
const STATIC_UPLOAD_DIR = path.join(SITE_ROOT, process.env.STATIC_UPLOAD_DIR || 'static/uploads');

await fs.ensureDir(CONTENT_NEWS_DIR);
await fs.ensureDir(CONTENT_TEAM_DIR);
await fs.ensureDir(STATIC_UPLOAD_DIR);

// 上传
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await fs.ensureDir(STATIC_UPLOAD_DIR);
    cb(null, STATIC_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.bin';
    const base = slugify(path.basename(file.originalname, ext), { lower: true, strict: true });
    const name = `${base}-${Date.now()}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// 工具
function buildMarkdown(frontmatter, body) {
  const fm = matter.stringify(body || '', frontmatter || {});
  return fm;
}

function parseMarkdown(content) {
  const parsed = matter(content);
  return { data: parsed.data, content: parsed.content };
}

function ensureDateISO(dateStr) {
  return dayjs(dateStr || new Date()).format('YYYY-MM-DD');
}

// 统一列表读取
async function listMarkdown(dir) {
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.md'));
  const items = [];
  for (const file of files) {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, 'utf-8');
    const { data, content } = parseMarkdown(raw);
    items.push({ slug: path.basename(file, '.md'), ...data, content });
  }
  // 按日期倒序
  items.sort((a, b) => (new Date(b.date || 0)) - (new Date(a.date || 0)));
  return items;
}

// 分页
function paginate(arr, page = 1, pageSize = 10) {
  const total = arr.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { total, page, pageSize, items: arr.slice(start, end) };
}

// 新闻 CRUD
app.get('/api/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '10', 10);
    const items = await listMarkdown(CONTENT_NEWS_DIR);
    res.json(paginate(items, page, pageSize));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/news/:slug', async (req, res) => {
  try {
    const file = path.join(CONTENT_NEWS_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'not found' });
    const raw = await fs.readFile(file, 'utf-8');
    const { data, content } = parseMarkdown(raw);
    res.json({ slug: req.params.slug, ...data, content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    const { title, author, categories, tags, summary, content, date } = req.body;
    const slug = slugify(req.body.slug || title, { lower: true, strict: true });
    const imageRel = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');
    const front = {
      title,
      date: ensureDateISO(date),
      author,
      categories: categories ? JSON.parse(categories) : [],
      tags: tags ? JSON.parse(tags) : [],
      image: imageRel,
      summary,
    };
    const md = buildMarkdown(front, content || '');
    const file = path.join(CONTENT_NEWS_DIR, `${slug}.md`);
    await fs.outputFile(file, md, 'utf-8');
    res.json({ ok: true, slug });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/news/:slug', upload.single('image'), async (req, res) => {
  try {
    const file = path.join(CONTENT_NEWS_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'not found' });
    const raw = await fs.readFile(file, 'utf-8');
    const { data: oldFront, content: oldBody } = parseMarkdown(raw);
    const imageRel = req.file ? `/uploads/${req.file.filename}` : (req.body.image ?? oldFront.image ?? '');
    const merged = {
      ...oldFront,
      title: req.body.title ?? oldFront.title,
      date: ensureDateISO(req.body.date ?? oldFront.date),
      author: req.body.author ?? oldFront.author,
      categories: req.body.categories ? JSON.parse(req.body.categories) : (oldFront.categories || []),
      tags: req.body.tags ? JSON.parse(req.body.tags) : (oldFront.tags || []),
      summary: req.body.summary ?? oldFront.summary,
      image: imageRel,
    };
    const body = req.body.content ?? oldBody;
    await fs.outputFile(file, buildMarkdown(merged, body), 'utf-8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/news/:slug', async (req, res) => {
  try {
    const file = path.join(CONTENT_NEWS_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'not found' });
    await fs.remove(file);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 记者团风采 CRUD（简单字段：name, role, bio, image）
app.get('/api/team', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '12', 10);
    const items = await listMarkdown(CONTENT_TEAM_DIR);
    res.json(paginate(items, page, pageSize));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/team/:slug', async (req, res) => {
  try {
    const file = path.join(CONTENT_TEAM_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'not found' });
    const raw = await fs.readFile(file, 'utf-8');
    const { data, content } = parseMarkdown(raw);
    res.json({ slug: req.params.slug, ...data, content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/team', upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, content } = req.body;
    const slug = slugify(req.body.slug || name, { lower: true, strict: true });
    const imageRel = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');
    const front = { title: name, role, image: imageRel, date: ensureDateISO(), summary: bio };
    const md = buildMarkdown(front, content || '');
    const file = path.join(CONTENT_TEAM_DIR, `${slug}.md`);
    await fs.outputFile(file, md, 'utf-8');
    res.json({ ok: true, slug });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/team/:slug', upload.single('image'), async (req, res) => {
  try {
    const file = path.join(CONTENT_TEAM_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'not found' });
    const raw = await fs.readFile(file, 'utf-8');
    const { data: oldFront, content: oldBody } = parseMarkdown(raw);
    const imageRel = req.file ? `/uploads/${req.file.filename}` : (req.body.image ?? oldFront.image ?? '');
    const merged = {
      ...oldFront,
      title: req.body.name ?? oldFront.title,
      role: req.body.role ?? oldFront.role,
      image: imageRel,
      summary: req.body.bio ?? oldFront.summary,
    };
    const body = req.body.content ?? oldBody;
    await fs.outputFile(file, buildMarkdown(merged, body), 'utf-8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/team/:slug', async (req, res) => {
  try {
    const file = path.join(CONTENT_TEAM_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(file))) return res.status(404).json({ error: 'not found' });
    await fs.remove(file);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 静态文件访问（预览上传）
app.use('/uploads', express.static(STATIC_UPLOAD_DIR));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, siteRoot: SITE_ROOT });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`[paths] SITE_ROOT=${SITE_ROOT}`);
  console.log(`[paths] CONTENT_NEWS_DIR=${CONTENT_NEWS_DIR}`);
  console.log(`[paths] CONTENT_TEAM_DIR=${CONTENT_TEAM_DIR}`);
  console.log(`[paths] STATIC_UPLOAD_DIR=${STATIC_UPLOAD_DIR}`);
});

process.on('unhandledRejection', (e) => {
  console.error('UNHANDLED', e);
});
process.on('uncaughtException', (e) => {
  console.error('UNCAUGHT', e);
});


