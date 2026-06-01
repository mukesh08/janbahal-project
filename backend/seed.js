// Run: node seed.js
const fs = require('fs'), path = require('path');
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const User      = require('./models/User');
const Page      = require('./models/Page');
const Menu      = require('./models/Menu');
const MenuItem  = require('./models/MenuItem');
const Post      = require('./models/Post');

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Admin user ──────────────────────────────────────────────
  let admin = await User.findOne({ email: 'admin@newacore.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: 'admin@newacore.com', password: 'Admin@1234', role: 'admin' });
    console.log('✅ Admin user created  (email: admin@newacore.com  password: Admin@1234)');
  } else {
    console.log('⏭  Admin user already exists');
  }

  // ── Pages ────────────────────────────────────────────────────
  const pages = [
    {
      title: 'Home',
      slug: 'home',
      published: true,
      gjsHtml: `<section style="font-family:sans-serif;max-width:900px;margin:60px auto;padding:0 20px;text-align:center">
  <h1 style="font-size:2.8rem;font-weight:800;color:#0f172a;margin-bottom:16px">Welcome to Janbahal</h1>
  <p style="font-size:1.1rem;color:#64748b;max-width:600px;margin:0 auto 32px">Your trusted source for news, stories, and community updates from Janbahal.</p>
  <a href="/blog" style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem">Read Our Blog →</a>
</section>
<section style="background:#f8fafc;padding:60px 20px;margin-top:40px">
  <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center">
    <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">
      <div style="font-size:2rem;margin-bottom:12px">📰</div>
      <h3 style="font-weight:700;color:#0f172a;margin:0 0 8px">Latest News</h3>
      <p style="color:#64748b;font-size:0.9rem;margin:0">Stay updated with the latest news from around the community.</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">
      <div style="font-size:2rem;margin-bottom:12px">🏘️</div>
      <h3 style="font-weight:700;color:#0f172a;margin:0 0 8px">Community</h3>
      <p style="color:#64748b;font-size:0.9rem;margin:0">Connect with people and organisations in Janbahal.</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">
      <div style="font-size:2rem;margin-bottom:12px">📖</div>
      <h3 style="font-weight:700;color:#0f172a;margin:0 0 8px">Stories</h3>
      <p style="color:#64748b;font-size:0.9rem;margin:0">Read inspiring stories and history of our neighbourhood.</p>
    </div>
  </div>
</section>`,
    },
    {
      title: 'About',
      slug: 'about',
      published: true,
      gjsHtml: `<section style="font-family:sans-serif;max-width:800px;margin:60px auto;padding:0 20px">
  <h1 style="font-size:2.4rem;font-weight:800;color:#0f172a;margin-bottom:16px">About Janbahal</h1>
  <p style="font-size:1.05rem;color:#475569;line-height:1.8;margin-bottom:20px">Janbahal is a historic neighbourhood located in the heart of Kathmandu. Known for its rich culture, ancient temples, and warm community spirit, it has been home to generations of families.</p>
  <p style="font-size:1.05rem;color:#475569;line-height:1.8;margin-bottom:20px">This website is dedicated to sharing stories, news, and updates about our community — preserving the past while celebrating the present.</p>
  <h2 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin:40px 0 16px">Our Mission</h2>
  <ul style="color:#475569;line-height:2;padding-left:20px">
    <li>Preserve the cultural heritage of Janbahal</li>
    <li>Keep the community informed with local news</li>
    <li>Connect residents and organisations</li>
    <li>Celebrate the stories and people of our neighbourhood</li>
  </ul>
</section>`,
    },
    {
      title: 'Contact',
      slug: 'contact',
      published: true,
      gjsHtml: `<section style="font-family:sans-serif;max-width:600px;margin:60px auto;padding:0 20px">
  <h1 style="font-size:2.4rem;font-weight:800;color:#0f172a;margin-bottom:8px">Contact Us</h1>
  <p style="color:#64748b;margin-bottom:40px">Have a story to share or want to get in touch? We'd love to hear from you.</p>
  <div style="background:#f8fafc;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
    <div style="margin-bottom:20px">
      <div style="font-weight:700;color:#0f172a;margin-bottom:4px">📍 Location</div>
      <div style="color:#475569">Janbahal, Kathmandu, Nepal</div>
    </div>
    <div style="margin-bottom:20px">
      <div style="font-weight:700;color:#0f172a;margin-bottom:4px">✉️ Email</div>
      <div style="color:#475569">hello@janbahal.com</div>
    </div>
    <div>
      <div style="font-weight:700;color:#0f172a;margin-bottom:4px">🕐 Office Hours</div>
      <div style="color:#475569">Sunday – Friday, 9am – 5pm</div>
    </div>
  </div>
</section>`,
    },
  ];

  for (const p of pages) {
    const exists = await Page.findOne({ slug: p.slug });
    if (!exists) {
      await Page.create({ ...p, createdBy: admin._id });
      console.log(`✅ Page created: "${p.title}"`);
    } else {
      console.log(`⏭  Page already exists: "${p.title}"`);
    }
  }

  // ── Main navigation menu ─────────────────────────────────────
  let menu = await Menu.findOne({ slug: 'main-navigation' });
  if (!menu) {
    menu = await Menu.create({ name: 'Main Navigation', slug: 'main-navigation' });
    console.log('✅ Menu created: "Main Navigation"');
  } else {
    console.log('⏭  Menu already exists: "Main Navigation"');
  }

  const menuItems = [
    { label: 'Home',    url: '/',        order: 1 },
    { label: 'About',   url: '/page/about',   order: 2 },
    { label: 'Blog',    url: '/blog',    order: 3 },
    { label: 'Contact', url: '/page/contact', order: 4 },
  ];

  const existingItems = await MenuItem.countDocuments({ menu: menu._id });
  if (existingItems === 0) {
    for (const item of menuItems) {
      await MenuItem.create({ ...item, menu: menu._id });
    }
    console.log('✅ Menu items created (Home, About, Blog, Contact)');
  } else {
    console.log('⏭  Menu items already exist');
  }

  // ── Blog posts ───────────────────────────────────────────────
  const posts = [
    {
      title: 'Welcome to Janbahal Community Website',
      slug: 'welcome-to-janbahal',
      excerpt: 'We are excited to launch the new Janbahal community website — your one-stop destination for local news, stories, and updates.',
      content: `<p>We are thrilled to announce the launch of the official Janbahal community website!</p>
<p>This platform has been built to bring our community closer together — whether you're a long-time resident or someone who has recently moved to Janbahal, this is your space to stay connected.</p>
<h2>What you'll find here</h2>
<ul>
  <li><strong>News</strong> — The latest updates from our neighbourhood</li>
  <li><strong>Stories</strong> — Personal stories and histories from residents</li>
  <li><strong>Events</strong> — Upcoming community events and festivals</li>
  <li><strong>Resources</strong> — Useful local contacts and information</li>
</ul>
<p>We look forward to growing this platform together with you. If you have a story to share, please reach out to us!</p>`,
      category: 'Announcement',
      tags: ['welcome', 'community', 'launch'],
      status: 'published',
    },
    {
      title: 'The History of Janbahal Neighbourhood',
      slug: 'history-of-janbahal',
      excerpt: 'Janbahal is one of the oldest neighbourhoods in Kathmandu, with a rich history dating back several centuries.',
      content: `<p>Janbahal is a historic neighbourhood nestled in the heart of Kathmandu Valley. Its name is derived from the Newari language, and it has been home to the Newar community for generations.</p>
<h2>Ancient Origins</h2>
<p>The area dates back to the medieval period when Kathmandu was known as Kantipur. The neighbourhood has preserved many of its traditional <em>bahal</em> (courtyards) and <em>chaityas</em> (Buddhist shrines) that tell the story of its Buddhist and Hindu heritage.</p>
<h2>Cultural Significance</h2>
<p>Janbahal is known for its annual festivals, traditional architecture, and the warmth of its community. The local <em>guthi</em> system — a traditional social institution — continues to play an important role in organising community events and preserving cultural practices.</p>
<p>Today, Janbahal stands as a living museum of Newar culture, where the old and the new coexist harmoniously.</p>`,
      category: 'Culture',
      tags: ['history', 'culture', 'newar', 'kathmandu'],
      status: 'published',
    },
    {
      title: 'Annual Indra Jatra Festival Celebrations',
      slug: 'indra-jatra-festival',
      excerpt: 'The Indra Jatra festival brings the entire community together for eight days of music, dance, and celebration.',
      content: `<p>Every year, the Janbahal neighbourhood comes alive during the grand Indra Jatra festival — one of the most important festivals in the Kathmandu Valley.</p>
<h2>About the Festival</h2>
<p>Indra Jatra is an eight-day festival celebrated in honour of Indra, the god of rain and harvest. The festival marks the end of the monsoon season and is a time for community gathering, thanksgiving, and celebration.</p>
<h2>Highlights</h2>
<ul>
  <li>The ceremonial raising of the <em>yosin</em> (wooden pole)</li>
  <li>The chariot procession of Kumari, the living goddess</li>
  <li>Traditional <em>Lakhe</em> (demon) dance performances</li>
  <li>Music from traditional <em>dhime</em> and <em>bhusya</em> bands</li>
</ul>
<p>The festival is a wonderful opportunity for residents and visitors alike to experience the vibrant culture of the Newar community.</p>`,
      category: 'Festival',
      tags: ['festival', 'indra jatra', 'culture', 'celebration'],
      status: 'published',
    },
  ];

  for (const p of posts) {
    const exists = await Post.findOne({ slug: p.slug });
    if (!exists) {
      await Post.create({ ...p, author: admin._id, publishedAt: new Date() });
      console.log(`✅ Post created: "${p.title}"`);
    } else {
      console.log(`⏭  Post already exists: "${p.title}"`);
    }
  }

  console.log('\n🎉 Seed complete! You can now log in at /admin');
  console.log('   Email:    admin@newacore.com');
  console.log('   Password: Admin@1234\n');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
