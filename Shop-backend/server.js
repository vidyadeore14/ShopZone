const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const qs = require('querystring');
require('dotenv').config();


// ✅ Razorpay Integration
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});



// ✅ Connect MongoDB
const connectDB = require('./db');
connectDB();

// MODELS
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/order');  // ✅ Add this at the top with other models



// 🔍 GET ALL PRODUCTS (प्रत्येक वेळी चेक करण्यासाठी)
Product.find()
  .then(products => console.log("📦 Products:", products))
  .catch(err => console.error("❌ Error fetching products:", err));

// JSON file paths
const usersFile = path.join(__dirname, 'data', 'users.json');
const reviewsFile = path.join(__dirname, 'data', 'reviews.json');

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
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
    const allowedExt = ['.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.glb', '.patt'];

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
          '.gif': 'image/gif',
          '.glb': 'model/gltf-binary',
          '.patt': 'application/octet-stream' // ✅ add this line
        }[ext] || 'application/octet-stream';

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
// ✅ Razorpay Order Creation
if (req.method === 'POST' && parsedUrl.pathname === '/api/create-order') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { amount } = JSON.parse(body);
      const order = await razorpay.orders.create({
        amount: Number(amount) * 100,  // Razorpay expects paise
        currency: 'INR',
        receipt: 'receipt_' + Date.now(),
        payment_capture: 1
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(order));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error creating order' }));
    }
  });
  return;
}

  if (req.method === 'POST' && parsedUrl.pathname === '/api/order') {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { userId, items, totalAmount, trackingId, shippingAddress } = JSON.parse(body);

      const newOrder = new Order({
        userId,
        items,
        totalAmount,
        trackingId,
        shippingAddress,
        status: "Order Confirmed"
      });

      await newOrder.save();

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Order placed", trackingId }));
    } catch (err) {
      console.error("❌ Failed to save order:", err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Order save failed" }));
    }
  });
  return;
}
if (req.method === 'GET' && parsedUrl.pathname === '/api/track') {
  const query = new URLSearchParams(parsedUrl.query);
  const trackingId = query.get('trackingId');

  const orders = fs.existsSync('orders.json') ? JSON.parse(fs.readFileSync('orders.json', 'utf-8')) : [];
  const order = orders.find(o => o.trackingId === trackingId);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(order || {}));
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

