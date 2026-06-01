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
      title: 'About Us',
      slug: 'about',
      published: true,
      gjsHtml: `<section style="font-family:'Segoe UI',sans-serif;max-width:860px;margin:60px auto;padding:0 24px">
  <h1 style="font-size:2.6rem;font-weight:800;color:#0f172a;margin-bottom:12px">About Us</h1>
  <p style="font-size:1.1rem;color:#64748b;border-left:4px solid #4f46e5;padding-left:16px;margin-bottom:36px">Janbahal is more than a neighbourhood — it is a living legacy of culture, heritage, and community spirit.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:48px">
    <div>
      <h2 style="font-size:1.4rem;font-weight:700;color:#0f172a;margin-bottom:12px">Who We Are</h2>
      <p style="color:#475569;line-height:1.8">We are a community-driven platform dedicated to the people of Janbahal, Kathmandu. Our mission is to preserve culture, share stories, and keep residents informed about everything happening in our neighbourhood.</p>
    </div>
    <div>
      <h2 style="font-size:1.4rem;font-weight:700;color:#0f172a;margin-bottom:12px">Our Story</h2>
      <p style="color:#475569;line-height:1.8">Born from the desire to connect Janbahal's residents in the digital age, this platform was built to bridge generations — honouring our past while embracing the future of our community.</p>
    </div>
  </div>
  <div style="background:#eef2ff;border-radius:14px;padding:40px;margin-bottom:48px;text-align:center">
    <h2 style="font-size:1.5rem;font-weight:700;color:#4f46e5;margin-bottom:24px">Our Values</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
      <div><div style="font-size:2rem;margin-bottom:8px">🏛️</div><strong style="color:#0f172a">Heritage</strong><p style="color:#64748b;font-size:0.85rem;margin-top:6px">Preserving the rich cultural traditions of Janbahal</p></div>
      <div><div style="font-size:2rem;margin-bottom:8px">🤝</div><strong style="color:#0f172a">Community</strong><p style="color:#64748b;font-size:0.85rem;margin-top:6px">Bringing people together with shared purpose</p></div>
      <div><div style="font-size:2rem;margin-bottom:8px">📢</div><strong style="color:#0f172a">Voice</strong><p style="color:#64748b;font-size:0.85rem;margin-top:6px">Giving every resident a platform to be heard</p></div>
    </div>
  </div>
  <div style="background:#f8fafc;border-radius:14px;padding:36px">
    <h2 style="font-size:1.4rem;font-weight:700;color:#0f172a;margin-bottom:20px">Meet the Team</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      <div style="text-align:center;background:#fff;border-radius:10px;padding:24px;border:1px solid #e2e8f0">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem">R</div>
        <strong style="color:#0f172a">Ram Shrestha</strong><p style="color:#94a3b8;font-size:0.8rem;margin:4px 0 0">Founder & Editor</p>
      </div>
      <div style="text-align:center;background:#fff;border-radius:10px;padding:24px;border:1px solid #e2e8f0">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#0ea5e9,#06b6d4);border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem">S</div>
        <strong style="color:#0f172a">Sita Maharjan</strong><p style="color:#94a3b8;font-size:0.8rem;margin:4px 0 0">Community Manager</p>
      </div>
      <div style="text-align:center;background:#fff;border-radius:10px;padding:24px;border:1px solid #e2e8f0">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem">B</div>
        <strong style="color:#0f172a">Bikash Tuladhar</strong><p style="color:#94a3b8;font-size:0.8rem;margin:4px 0 0">Content Writer</p>
      </div>
    </div>
  </div>
</section>`,
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      published: true,
      gjsHtml: `<section style="font-family:'Segoe UI',sans-serif;max-width:860px;margin:60px auto;padding:0 24px">
  <h1 style="font-size:2.6rem;font-weight:800;color:#0f172a;margin-bottom:12px">Contact Us</h1>
  <p style="font-size:1.1rem;color:#64748b;margin-bottom:48px">We'd love to hear from you. Reach out with news tips, stories, or general enquiries.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
    <div style="background:#f8fafc;border-radius:14px;padding:36px;border:1px solid #e2e8f0">
      <h2 style="font-size:1.2rem;font-weight:700;color:#0f172a;margin-bottom:24px">Get In Touch</h2>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div style="width:40px;height:40px;background:#eef2ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">📍</div>
          <div><strong style="color:#0f172a;display:block;margin-bottom:2px">Address</strong><span style="color:#64748b;font-size:0.9rem">Janbahal, Kathmandu 44600, Nepal</span></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div style="width:40px;height:40px;background:#eef2ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">✉️</div>
          <div><strong style="color:#0f172a;display:block;margin-bottom:2px">Email</strong><span style="color:#64748b;font-size:0.9rem">hello@janbahal.com</span></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div style="width:40px;height:40px;background:#eef2ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">📞</div>
          <div><strong style="color:#0f172a;display:block;margin-bottom:2px">Phone</strong><span style="color:#64748b;font-size:0.9rem">+977 1 4XXXXXX</span></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div style="width:40px;height:40px;background:#eef2ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">🕐</div>
          <div><strong style="color:#0f172a;display:block;margin-bottom:2px">Office Hours</strong><span style="color:#64748b;font-size:0.9rem">Sun – Fri &nbsp; 9:00am – 5:00pm</span></div>
        </div>
      </div>
    </div>
    <div style="background:#fff;border-radius:14px;padding:36px;border:1px solid #e2e8f0;box-shadow:0 1px 8px rgba(0,0,0,0.05)">
      <h2 style="font-size:1.2rem;font-weight:700;color:#0f172a;margin-bottom:24px">Send a Message</h2>
      <div style="display:flex;flex-direction:column;gap:14px">
        <input style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;outline:none" placeholder="Your Name" />
        <input style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;outline:none" type="email" placeholder="Email Address" />
        <input style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;outline:none" placeholder="Subject" />
        <textarea style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.9rem;outline:none;resize:vertical;min-height:100px" placeholder="Your message..."></textarea>
        <button style="padding:12px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:0.95rem;cursor:pointer">Send Message</button>
      </div>
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
    {
      title: 'Top 5 Places to Visit in Janbahal',
      slug: 'top-5-places-janbahal',
      excerpt: 'From ancient courtyards to hidden temples, here are the five must-visit spots in Janbahal that every visitor should explore.',
      content: `<p>Janbahal is full of hidden gems. Whether you are a first-time visitor or a lifelong resident, these five spots are worth exploring.</p>
<h2>1. Janbahal Courtyard (Bahal)</h2>
<p>The historic central courtyard is the heart of the neighbourhood. Lined with traditional Newari architecture, it is a peaceful place to sit and soak in the atmosphere.</p>
<h2>2. The Old Chaitya</h2>
<p>A beautifully preserved Buddhist stupa tucked inside the bahal. Local residents regularly offer flowers and light butter lamps here in the mornings.</p>
<h2>3. The Community Library</h2>
<p>A small but well-stocked library run by volunteers. A great place to find books on Newar culture, history, and local stories.</p>
<h2>4. The Street Food Lane</h2>
<p>Every evening, the narrow lane on the eastern side comes alive with vendors selling <em>chatamari</em>, <em>bara</em>, and <em>samay baji</em> — traditional Newari snacks you shouldn't miss.</p>
<h2>5. The Sunrise Viewpoint</h2>
<p>A rooftop accessible from the northern end of the neighbourhood offers a stunning view of the Kathmandu skyline — especially beautiful at sunrise.</p>`,
      category: 'Travel',
      tags: ['travel', 'places', 'tourism', 'janbahal'],
      status: 'published',
    },
    {
      title: 'Community Clean-Up Drive This Weekend',
      slug: 'community-clean-up-drive',
      excerpt: 'Join us this Saturday as we come together to clean and beautify our neighbourhood streets and public spaces.',
      content: `<p>We are calling all Janbahal residents to join our upcoming <strong>Community Clean-Up Drive</strong> this Saturday!</p>
<h2>Event Details</h2>
<ul>
  <li><strong>Date:</strong> This Saturday</li>
  <li><strong>Time:</strong> 7:00 AM – 10:00 AM</li>
  <li><strong>Meeting Point:</strong> Janbahal Main Courtyard</li>
  <li><strong>What to bring:</strong> Gloves, enthusiasm, and a friend!</li>
</ul>
<h2>Why It Matters</h2>
<p>A clean neighbourhood is a proud neighbourhood. Together, we can make Janbahal a cleaner, greener, and more welcoming place for everyone who lives here and visits.</p>
<h2>How to Join</h2>
<p>Simply show up at the meeting point on Saturday morning. Cleaning supplies will be provided. Light refreshments will be served after the drive.</p>
<p>Let us show what our community can do when we work together. See you there! 🌿</p>`,
      category: 'Community',
      tags: ['community', 'event', 'clean-up', 'environment'],
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
