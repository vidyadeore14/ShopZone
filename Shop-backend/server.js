const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const qs = require('querystring');

// ✅ Connect MongoDB
const connectDB = require('./db');
connectDB();

// MODELS
const User = require('./models/User');
const Product = require('./models/Product');

// ➕ SAVE USER
const user = new User({
  name: "Vidya",
  email: "vidyadere47@gmail.com",
  password: "sanjay123",
  address: "Pune"
});

user.save()
  .then(() => console.log("✅ User saved"))
  .catch(err => console.error("❌ Error saving user:", err));

// 🔍 GET ALL PRODUCTS (प्रत्येक वेळी चेक करण्यासाठी)
Product.find()
  .then(products => console.log("📦 Products:", products))
  .catch(err => console.error("❌ Error fetching products:", err));

// JSON file paths
const usersFile = path.join(__dirname, 'data', 'users.json');
const reviewsFile = path.join(__dirname, 'data', 'reviews.json');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Recommendation API (GET /api/recommend?name=PRODUCT_NAME)
if (req.method === 'GET' && parsedUrl.pathname === '/api/recommend') {
  const product = parsedUrl.query.name;

  const python = spawn('python', ['recommendations/recommend.py', product]);

  let data = '';
  python.stdout.on('data', chunk => data += chunk);

  python.stderr.on('data', err => console.error(`stderr: ${err}`));

  python.on('close', code => {
    if (code !== 0) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end("Error running Python script");
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data); // data is already JSON string from Python
  });

  return;
}

  if (req.method === 'GET' && parsedUrl.pathname === '/api/products') {
  Product.find()
    .then(products => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(products));
    })
    .catch(err => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error fetching products');
    });
  return;
}

  // Serve static files (HTML/CSS/JS/Images)
  if (req.method === 'GET') {
    const filePath = path.join(__dirname, '../Shop', parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    const ext = path.extname(filePath);
    const allowedExt = ['.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.gif'];

    if (allowedExt.includes(ext)) {
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          return res.end('<h1>404 Not Found</h1>');
        }

        const contentType = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif'
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
      return;
    }
  }

  // Registration
  // ✅ Registration with MongoDB
if (req.method === 'POST' && parsedUrl.pathname === '/register') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { name, email, password, address } = JSON.parse(body);

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Email already exists');
      }

      // Save new user to MongoDB
      const newUser = new User({ name, email, password, address });
      await newUser.save();

      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end('User registered successfully');
    } catch (err) {
      console.error('❌ Error saving user:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
  return;
}


  // Login
  // ✅ LOGIN ROUTE - Final Cleaned Version
if (req.method === 'POST' && parsedUrl.pathname === '/login') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { email, password } = JSON.parse(body); // ✔️ Get email & password
    console.log('🟡 Login Attempt:', email, password);  // Debug log

    try {
      const user = await User.findOne({ email, password }); // ✔️ MongoDB query
      console.log('🟢 Found user:', user);  // Debug log

      if (user) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Login successful');
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Invalid credentials');
      }
    } catch (err) {
      console.error('❌ Error logging in:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
  return;
}



  // Save review
  if (req.method === 'POST' && parsedUrl.pathname === '/api/reviews') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { productId, review, rating } = qs.parse(body);
      if (!productId || !review || !rating) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Missing fields');
      }

      let reviews = fs.existsSync(reviewsFile) ? JSON.parse(fs.readFileSync(reviewsFile, 'utf-8')) : [];
      reviews.push({ productId, review, rating: Number(rating), date: new Date().toISOString() });

      fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Review saved');
    });
    return;
  }
  // Payment API
if (req.method === 'POST' && parsedUrl.pathname === '/api/payment') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { orderId, amount } = JSON.parse(body);

    // Simulate successful payment (no real gateway)
    if (orderId && amount) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'success', message: 'Payment completed successfully' }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'error', message: 'Invalid payment details' }));
    }
  });
  return;
}

  // ✅ PLACE ORDER
if (req.method === 'POST' && parsedUrl.pathname === '/api/order') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { name, phone, address } = JSON.parse(body);

    // ✅ Print received order for now
    console.log('🛒 Order received:', { name, phone, address });

    // TODO: Save to DB or start Razorpay flow
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Order placed successfully!');
  });
  return;
}

  // If no match
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1>');
});

const { spawn } = require('child_process');

// ✅ Run on dynamic port for Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

