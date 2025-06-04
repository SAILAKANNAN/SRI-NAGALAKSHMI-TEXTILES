const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    price: Number,
    offerPercentage: Number,
    mrp: Number,
    size: [String],
    mainImage: String,
    additionalImages: [String],
    createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    size: String,
    price: Number,
    mrp: Number,
    quantity: { type: Number, default: 1 },
    phone: String,
    street: String,
    area: String,
    pincode: String,
    district: String,
    state: String,
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, default: 'Pending' },
    orderedAt: { type: Date, default: Date.now }
});

// Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes

// Home Page
app.get('/', (req, res) => {
    if (req.cookies.adminLoggedIn === 'true') {
        return res.redirect('/admin');
    }
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MyShop - E-Commerce Store</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #ff6b6b;
                    --dark-color: #2c3e50;
                    --light-color: #f8f9fa;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--secondary-color);
                    color: var(--dark-color);
                }
                
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.8rem;
                }
                
                .nav-link {
                    font-weight: 500;
                    position: relative;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                .search-box {
                    background-color: rgba(255, 255, 255, 0.9);
                    border-radius: 30px;
                    padding: 8px 15px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                }
                
                .search-btn {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    padding: 5px 15px;
                    transition: all 0.3s;
                }
                
                .search-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .product-card {
                    border: none;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    background: white;
                    margin-bottom: 20px;
                }
                
                .product-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                }
                
                .product-img {
                    height: 200px;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                
                .product-card:hover .product-img {
                    transform: scale(1.05);
                }
                
                .price {
                    font-weight: 700;
                    color: var(--primary-color);
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: #6c757d;
                }
                
                .discount-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--accent-color);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-weight: bold;
                }
                
                footer {
                    background: var(--dark-color);
                    color: white;
                    padding: 40px 0 20px;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-links a:hover {
                    color: white;
                }
                
                .social-icons a {
                    color: white;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    transition: transform 0.3s;
                }
                
                .social-icons a:hover {
                    transform: translateY(-5px);
                }
                
                .back-to-top {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                    z-index: 999;
                }
                
                .back-to-top.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .back-to-top:hover {
                    background: var(--accent-color);
                    transform: translateY(-5px);
                }
                
                /* Pulse animation for featured products */
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(78, 115, 223, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(78, 115, 223, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(78, 115, 223, 0); }
                }
                
                .featured {
                    animation: pulse 2s infinite;
                    border: 2px solid var(--primary-color);
                }
                
                /* Hero Section */
                .hero-section {
                    background: linear-gradient(135deg, var(--primary-color), #224abe);
                    position: relative;
                    overflow: hidden;
                }
                
                .hero-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80') center/cover;
                    opacity: 0.15;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 1;
                }
                
                /* Responsive adjustments */
                @media (max-width: 767.98px) {
                    .navbar-brand {
                        font-size: 1.5rem;
                    }
                    
                    .product-img {
                        height: 150px;
                    }
                    
                    .hero-section {
                        padding: 2rem 0;
                    }
                    
                    .display-4 {
                        font-size: 2.5rem;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .product-col {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                    
                    .search-box {
                        margin-top: 1rem;
                        width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">SRI NAGALAKSHMI</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                        </ul>
                        
                        
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </li>
                          
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Hero Section -->
            <div class="hero-section text-white py-5">
                <div class="container text-center py-5 hero-content animate__animated animate__fadeIn">
                
                        <form class="d-flex search-box me-3" action="/search" method="GET">
                            <input class="search-input flex-grow-1" type="text" name="query" placeholder="Search products...">
                            <button class="search-btn" type="submit">
                                <i class="fas fa-search"></i>
                            </button>
                        </form>
                    <h1 class="display-4 fw-bold mb-4">Welcome to SRI NAGALAKSHMI TEXTILES</h1>
                    <p class="lead mb-4">Discover amazing products at unbeatable prices</p>
                    <a href="#products" class="btn btn-light btn-lg px-4">Shop Now</a>
                </div>
            </div>
            
            <!-- Products Section -->
            <div class="container my-5" id="products">
                <h2 class="text-center mb-5 animate__animated animate__fadeInUp">Our Products</h2>
                <div class="row g-4" id="products-container">
                    <!-- Products will be loaded here -->
                </div>
            </div>
            
            <!-- Newsletter Section -->
            
            
            <!-- Footer -->
            <footer class="mt-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <h5>SRI NAGALAKSHMI TEXTILES</h5>
                            <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login">Login</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Categories</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#">Electronics</a></li>
                                <li><a href="#">Fashion</a></li>
                                <li><a href="#">Home & Kitchen</a></li>
                                <li><a href="#">Beauty</a></li>
                            </ul>
                        </div>
                        <div class="col-md-4 mb-4">
                            <h5>Connect With Us</h5>
                            <div class="social-icons">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                            </div>
                            <div class="mt-3">
                                <p><i class="fas fa-envelope me-2"></i> chennak238@gmail.com</p>
                                <p><i class="fas fa-phone me-2"></i> 63828 87930</p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4 bg-light">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2025 SRI NAGALAKSHMI TEXTILES. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <p class="mb-0">
                                <a href="#" class="text-white me-3">Privacy Policy</a>
                                <a href="#" class="text-white">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Back to Top Button -->
            <a href="#" class="back-to-top animate__animated animate__fadeIn">
                <i class="fas fa-arrow-up"></i>
            </a>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                // Load products on page load
                document.addEventListener('DOMContentLoaded', function() {
                    fetch('/api/products')
                        .then(response => response.json())
                        .then(products => {
                            const container = document.getElementById('products-container');
                            
                            products.forEach((product, index) => {
                                // Create product column
                                const productCol = document.createElement('div');
                                productCol.className = 'col-6 col-md-4 col-lg-3';
                                
                                // Create product card
                                const productCard = document.createElement('div');
                                productCard.className = 'product-card h-100 animate__animated animate__fadeInUp';
                                productCard.style.animationDelay = (index * 0.1) + 's';
                                
                                // Add featured class to first 2 products
                                if (index < 2) {
                                    productCard.classList.add('featured');
                                }
                                
                                productCard.innerHTML = \`
                                    <div class="position-relative">
                                        <img src="\${product.mainImage}" alt="\${product.name}" class="product-img w-100">
                                        <span class="discount-badge">\${product.offerPercentage}% OFF</span>
                                    </div>
                                    <div class="p-3">
                                        <h5 class="mb-2">\${product.name}</h5>
                                        <p class="text-muted small mb-2">\${product.description.substring(0, 60)}...</p>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span class="price">₹\${product.price}</span>
                                                <span class="original-price small ms-2">₹\${product.mrp}</span>
                                            </div>
                                            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation();addToCart('\${product._id}')">
                                                <i class="fas fa-cart-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                \`;
                                
                                productCard.addEventListener('click', () => {
                                    window.location.href = \`/product/\${product._id}\`;
                                });
                                
                                productCol.appendChild(productCard);
                                container.appendChild(productCol);
                            });
                        });
                    
                    // Back to top button
                    const backToTopButton = document.querySelector('.back-to-top');
                    
                    window.addEventListener('scroll', () => {
                        if (window.pageYOffset > 300) {
                            backToTopButton.classList.add('active');
                        } else {
                            backToTopButton.classList.remove('active');
                        }
                    });
                    
                    backToTopButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    });
                });
                
                function addToCart(productId) {
                    // Implement add to cart functionality
                    console.log('Adding product to cart:', productId);
                    // You would typically make a fetch request to your backend here
                }
            </script>
        </body>
        </html>
    `);
});

// About Us Page
app.get('/about', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>About Us - MyShop</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #ff6b6b;
                    --dark-color: #2c3e50;
                    --light-color: #f8f9fa;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--secondary-color);
                    color: var(--dark-color);
                }
                
                /* Navbar styles (consistent with home page) */
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.8rem;
                }
                
                .nav-link {
                    font-weight: 500;
                    position: relative;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                /* About Page Specific Styles */
                .about-hero {
                    background: linear-gradient(135deg, var(--primary-color), #224abe);
                    padding: 5rem 0;
                    position: relative;
                    overflow: hidden;
                    color: white;
                }
                
                .about-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80') center/cover;
                    opacity: 0.15;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 1;
                }
                
                .mission-card {
                    border: none;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    background: white;
                    height: 100%;
                }
                
                .mission-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                }
                
                .team-member {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .team-img {
                    width: 150px;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 50%;
                    border: 5px solid white;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    margin-bottom: 1rem;
                }
                
                .team-member:hover .team-img {
                    transform: scale(1.05);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                }
                
                .timeline {
                    position: relative;
                    padding-left: 50px;
                    margin: 2rem 0;
                }
                
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 15px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--primary-color);
                }
                
                .timeline-item {
                    position: relative;
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                }
                
                .timeline-item::before {
                    content: '';
                    position: absolute;
                    left: -38px;
                    top: 5px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid var(--primary-color);
                }
                
                .stats-item {
                    text-align: center;
                    padding: 2rem;
                    border-radius: 10px;
                    background: white;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    margin-bottom: 1.5rem;
                }
                
                .stats-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
                
                .stats-number {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
                
                /* Footer styles (consistent with home page) */
                footer {
                    background: var(--dark-color);
                    color: white;
                    padding: 40px 0 20px;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-links a:hover {
                    color: white;
                }
                
                .social-icons a {
                    color: white;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    transition: transform 0.3s;
                }
                
                .social-icons a:hover {
                    transform: translateY(-5px);
                }
                
                /* Responsive adjustments */
                @media (max-width: 767.98px) {
                    .navbar-brand {
                        font-size: 1.5rem;
                    }
                    
                    .about-hero {
                        padding: 3rem 0;
                    }
                    
                    .display-4 {
                        font-size: 2.5rem;
                    }
                    
                    .timeline {
                        padding-left: 30px;
                    }
                    
                    .timeline-item::before {
                        left: -28px;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar (consistent with home page) -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">MyShop</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/cart">
                                    <i class="fas fa-shopping-cart me-1"></i> Cart
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Hero Section -->
            <section class="about-hero">
                <div class="container hero-content text-center animate__animated animate__fadeIn">
                    <h1 class="display-4 fw-bold mb-3">About MyShop</h1>
                    <p class="lead">Our journey, values, and the team behind your favorite shopping experience</p>
                </div>
            </section>
            
            <!-- Our Story Section -->
            <section class="py-5">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-6 animate__animated animate__fadeInLeft">
                            <h2 class="mb-4">Our Story</h2>
                            <p class="lead">Founded in 2015, MyShop began as a small startup with a big vision.</p>
                            <p>What started as a simple idea to make online shopping more personal and enjoyable has grown into one of the most trusted e-commerce platforms. We've stayed true to our core values while continuously innovating to serve you better.</p>
                            <p>Today, we serve millions of happy customers worldwide with a curated selection of quality products.</p>
                        </div>
                        <div class="col-lg-6 animate__animated animate__fadeInRight">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Our Team" class="img-fluid rounded shadow">
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Mission and Values -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="animate__animated animate__fadeInUp">Our Mission & Values</h2>
                        <p class="lead animate__animated animate__fadeInUp" style="animation-delay: 0.2s">What drives us every day</p>
                    </div>
                    <div class="row g-4">
                        <div class="col-md-4 animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
                            <div class="mission-card p-4">
                                <div class="text-center mb-3">
                                    <i class="fas fa-bullseye fa-3x text-primary mb-3"></i>
                                    <h4>Our Mission</h4>
                                </div>
                                <p>To provide an exceptional shopping experience with high-quality products, competitive prices, and outstanding customer service that makes people's lives better.</p>
                            </div>
                        </div>
                        <div class="col-md-4 animate__animated animate__fadeInUp" style="animation-delay: 0.4s">
                            <div class="mission-card p-4">
                                <div class="text-center mb-3">
                                    <i class="fas fa-lightbulb fa-3x text-primary mb-3"></i>
                                    <h4>Our Vision</h4>
                                </div>
                                <p>To become the most customer-centric e-commerce platform where people can find and discover anything they want to buy online with trust and confidence.</p>
                            </div>
                        </div>
                        <div class="col-md-4 animate__animated animate__fadeInUp" style="animation-delay: 0.5s">
                            <div class="mission-card p-4">
                                <div class="text-center mb-3">
                                    <i class="fas fa-heart fa-3x text-primary mb-3"></i>
                                    <h4>Our Values</h4>
                                </div>
                                <p>Customer obsession, innovation, operational excellence, long-term thinking, and social responsibility guide every decision we make.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Timeline Section -->
            <section class="py-5">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="animate__animated animate__fadeInUp">Our Journey</h2>
                        <p class="lead animate__animated animate__fadeInUp" style="animation-delay: 0.2s">Milestones along the way</p>
                    </div>
                    <div class="timeline animate__animated animate__fadeIn">
                        <div class="timeline-item">
                            <h4>2015 - Foundation</h4>
                            <p>MyShop was founded by a small team of passionate entrepreneurs with a vision to revolutionize online shopping.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>2016 - First 10,000 Customers</h4>
                            <p>We reached our first major milestone of serving 10,000 happy customers within the first year of operation.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>2018 - Mobile App Launch</h4>
                            <p>Launched our award-winning mobile app, making shopping even more convenient for our customers.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>2020 - International Expansion</h4>
                            <p>Expanded our operations to serve customers in 5 new countries across North America and Europe.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>2023 - Current</h4>
                            <p>Serving millions of customers worldwide with a team of over 200 dedicated professionals.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Team Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="animate__animated animate__fadeInUp">Meet Our Team</h2>
                        <p class="lead animate__animated animate__fadeInUp" style="animation-delay: 0.2s">The people behind MyShop</p>
                    </div>
                    <div class="row">
                        <div class="col-md-3 col-6 animate__animated animate__fadeIn" style="animation-delay: 0.3s">
                            <div class="team-member">
                                <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Team Member" class="team-img">
                                <h5>Sarah Johnson</h5>
                                <p class="text-muted">CEO & Founder</p>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 animate__animated animate__fadeIn" style="animation-delay: 0.4s">
                            <div class="team-member">
                                <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Team Member" class="team-img">
                                <h5>Michael Chen</h5>
                                <p class="text-muted">CTO</p>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 animate__animated animate__fadeIn" style="animation-delay: 0.5s">
                            <div class="team-member">
                                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Team Member" class="team-img">
                                <h5>Emma Rodriguez</h5>
                                <p class="text-muted">Marketing Director</p>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 animate__animated animate__fadeIn" style="animation-delay: 0.6s">
                            <div class="team-member">
                                <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Team Member" class="team-img">
                                <h5>David Kim</h5>
                                <p class="text-muted">Customer Experience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Stats Section -->
            <section class="py-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-3 animate__animated animate__fadeIn" style="animation-delay: 0.3s">
                            <div class="stats-item">
                                <div class="stats-number" data-count="1000000">0</div>
                                <h5>Happy Customers</h5>
                            </div>
                        </div>
                        <div class="col-md-3 animate__animated animate__fadeIn" style="animation-delay: 0.4s">
                            <div class="stats-item">
                                <div class="stats-number" data-count="50000">0</div>
                                <h5>Products Available</h5>
                            </div>
                        </div>
                        <div class="col-md-3 animate__animated animate__fadeIn" style="animation-delay: 0.5s">
                            <div class="stats-item">
                                <div class="stats-number" data-count="200">0</div>
                                <h5>Team Members</h5>
                            </div>
                        </div>
                        <div class="col-md-3 animate__animated animate__fadeIn" style="animation-delay: 0.6s">
                            <div class="stats-item">
                                <div class="stats-number" data-count="10">0</div>
                                <h5>Countries Served</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Footer (consistent with home page) -->
            <footer class="mt-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <h5>MyShop</h5>
                            <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login">Login</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Categories</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#">Electronics</a></li>
                                <li><a href="#">Fashion</a></li>
                                <li><a href="#">Home & Kitchen</a></li>
                                <li><a href="#">Beauty</a></li>
                            </ul>
                        </div>
                        <div class="col-md-4 mb-4">
                            <h5>Connect With Us</h5>
                            <div class="social-icons">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                            </div>
                            <div class="mt-3">
                                <p><i class="fas fa-envelope me-2"></i> info@myshop.com</p>
                                <p><i class="fas fa-phone me-2"></i> +1 (123) 456-7890</p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4 bg-light">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2023 MyShop. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <p class="mb-0">
                                <a href="#" class="text-white me-3">Privacy Policy</a>
                                <a href="#" class="text-white">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Back to Top Button -->
            <a href="#" class="back-to-top animate__animated animate__fadeIn">
                <i class="fas fa-arrow-up"></i>
            </a>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                // Animate stats counters when they come into view
                function animateCounters() {
                    const counters = document.querySelectorAll('.stats-number');
                    const speed = 200;
                    
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-count');
                        const count = +counter.innerText;
                        const increment = target / speed;
                        
                        if(count < target && isElementInViewport(counter)) {
                            counter.innerText = Math.ceil(count + increment);
                            setTimeout(animateCounters, 1);
                        } else {
                            counter.innerText = target;
                        }
                    });
                }
                
                // Check if element is in viewport
                function isElementInViewport(el) {
                    const rect = el.getBoundingClientRect();
                    return (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );
                }
                
                // Back to top button
                const backToTopButton = document.querySelector('.back-to-top');
                
                window.addEventListener('scroll', () => {
                    if (window.pageYOffset > 300) {
                        backToTopButton.classList.add('active');
                    } else {
                        backToTopButton.classList.remove('active');
                    }
                    
                    // Check if counters should animate
                    animateCounters();
                });
                
                backToTopButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
                
                // Initialize animations when page loads
                document.addEventListener('DOMContentLoaded', function() {
                    // Trigger counter animation if stats are already visible
                    setTimeout(animateCounters, 500);
                });
            </script>
        </body>
        </html>
    `);
});
// Contact Us Page
app.get('/contact', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contact Us - MyShop</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #ff6b6b;
                    --dark-color: #2c3e50;
                    --light-color: #f8f9fa;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--secondary-color);
                    color: var(--dark-color);
                }
                
                /* Navbar styles (consistent with other pages) */
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.8rem;
                }
                
                .nav-link {
                    font-weight: 500;
                    position: relative;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                /* Contact Page Specific Styles */
                .contact-hero {
                    background: linear-gradient(135deg, var(--primary-color), #224abe);
                    padding: 5rem 0;
                    position: relative;
                    overflow: hidden;
                    color: white;
                }
                
                .contact-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80') center/cover;
                    opacity: 0.15;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 1;
                }
                
                .contact-card {
                    border: none;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    background: white;
                    height: 100%;
                    padding: 2rem;
                }
                
                .contact-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                }
                
                .contact-icon {
                    font-size: 2.5rem;
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .form-control:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
                }
                
                .btn-primary {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                }
                
                .btn-primary:hover {
                    background-color: #3a5bc7;
                    border-color: #3a5bc7;
                }
                
                .map-container {
                    position: relative;
                    overflow: hidden;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                .map-container iframe {
                    width: 100%;
                    height: 400px;
                    border: 0;
                }
                
                /* Social Media Links */
                .social-contact a {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    margin-right: 10px;
                    transition: all 0.3s ease;
                }
                
                .social-contact a:hover {
                    background: var(--accent-color);
                    transform: translateY(-5px);
                }
                
                /* Footer styles (consistent with other pages) */
                footer {
                    background: var(--dark-color);
                    color: white;
                    padding: 40px 0 20px;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-links a:hover {
                    color: white;
                }
                
                .social-icons a {
                    color: white;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    transition: transform 0.3s;
                }
                
                .social-icons a:hover {
                    transform: translateY(-5px);
                }
                
                /* Responsive adjustments */
                @media (max-width: 767.98px) {
                    .navbar-brand {
                        font-size: 1.5rem;
                    }
                    
                    .contact-hero {
                        padding: 3rem 0;
                    }
                    
                    .display-4 {
                        font-size: 2.5rem;
                    }
                    
                    .map-container iframe {
                        height: 300px;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar (consistent with other pages) -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">MyShop</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/contact">Contact Us</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/cart">
                                    <i class="fas fa-shopping-cart me-1"></i> Cart
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Hero Section -->
            <section class="contact-hero">
                <div class="container hero-content text-center animate__animated animate__fadeIn">
                    <h1 class="display-4 fw-bold mb-3">Contact Us</h1>
                    <p class="lead">We'd love to hear from you! Get in touch with our team.</p>
                </div>
            </section>
            
            <!-- Contact Methods Section -->
            <section class="py-5">
                <div class="container">
                    <div class="row g-4">
                        <div class="col-md-4 animate__animated animate__fadeInUp" style="animation-delay: 0.2s">
                            <div class="contact-card text-center">
                                <div class="contact-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <h4>Our Location</h4>
                                <p>123 Main Street<br>City, State 10001<br>Country</p>
                            </div>
                        </div>
                        <div class="col-md-4 animate__animated animate__fadeInUp" style="animation-delay: 0.4s">
                            <div class="contact-card text-center">
                                <div class="contact-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <h4>Email Us</h4>
                                <p>info@myshop.com<br>support@myshop.com<br>sales@myshop.com</p>
                            </div>
                        </div>
                        <div class="col-md-4 animate__animated animate__fadeInUp" style="animation-delay: 0.6s">
                            <div class="contact-card text-center">
                                <div class="contact-icon">
                                    <i class="fas fa-phone-alt"></i>
                                </div>
                                <h4>Call Us</h4>
                                <p>+1 (123) 456-7890<br>+1 (234) 567-8901<br>Mon-Fri: 9AM-6PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Contact Form and Map Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="row g-4 align-items-center">
                        <div class="col-lg-6 animate__animated animate__fadeInLeft">
                            <h2 class="mb-4">Send Us a Message</h2>
                            <form id="contactForm">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Your Name</label>
                                    <input type="text" class="form-control" id="name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="subject" class="form-label">Subject</label>
                                    <input type="text" class="form-control" id="subject" required>
                                </div>
                                <div class="mb-3">
                                    <label for="message" class="form-label">Message</label>
                                    <textarea class="form-control" id="message" rows="5" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
                            </form>
                        </div>
                        <div class="col-lg-6 animate__animated animate__fadeInRight">
                            <div class="map-container">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215256627446!2d-73.9878449241645!3d40.74844097138965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1689872271451!5m2!1sen!2sus" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Social Media Section -->
            <section class="py-5">
                <div class="container text-center">
                    <h2 class="mb-4 animate__animated animate__fadeInUp">Connect With Us</h2>
                    <p class="lead mb-5 animate__animated animate__fadeInUp">Follow us on social media for updates and promotions</p>
                    <div class="social-contact animate__animated animate__fadeIn" style="animation-delay: 0.3s">
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-pinterest-p"></i></a>
                    </div>
                </div>
            </section>
            
            <!-- FAQ Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="animate__animated animate__fadeInUp">Frequently Asked Questions</h2>
                        <p class="lead animate__animated animate__fadeInUp">Find answers to common questions</p>
                    </div>
                    <div class="accordion" id="faqAccordion">
                        <div class="accordion-item animate__animated animate__fadeInUp" style="animation-delay: 0.2s">
                            <h3 class="accordion-header" id="headingOne">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                                    How can I track my order?
                                </button>
                            </h3>
                            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our website or the carrier's website.
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
                            <h3 class="accordion-header" id="headingTwo">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                                    What is your return policy?
                                </button>
                            </h3>
                            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    We offer a 30-day return policy for most items. Items must be unused and in their original packaging. Please contact our support team to initiate a return.
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item animate__animated animate__fadeInUp" style="animation-delay: 0.4s">
                            <h3 class="accordion-header" id="headingThree">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                                    Do you offer international shipping?
                                </button>
                            </h3>
                            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary depending on the destination. You'll see the options during checkout.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Footer (consistent with other pages) -->
            <footer class="mt-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <h5>MyShop</h5>
                            <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login">Login</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Categories</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#">Electronics</a></li>
                                <li><a href="#">Fashion</a></li>
                                <li><a href="#">Home & Kitchen</a></li>
                                <li><a href="#">Beauty</a></li>
                            </ul>
                        </div>
                        <div class="col-md-4 mb-4">
                            <h5>Connect With Us</h5>
                            <div class="social-icons">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                            </div>
                            <div class="mt-3">
                                <p><i class="fas fa-envelope me-2"></i> info@myshop.com</p>
                                <p><i class="fas fa-phone me-2"></i> +1 (123) 456-7890</p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4 bg-light">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2023 MyShop. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <p class="mb-0">
                                <a href="#" class="text-white me-3">Privacy Policy</a>
                                <a href="#" class="text-white">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Back to Top Button -->
            <a href="#" class="back-to-top animate__animated animate__fadeIn">
                <i class="fas fa-arrow-up"></i>
            </a>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                // Form submission handling
                document.getElementById('contactForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Get form values
                    const name = document.getElementById('name').value;
                    const email = document.getElementById('email').value;
                    const subject = document.getElementById('subject').value;
                    const message = document.getElementById('message').value;
                    
                    // Here you would typically send the data to your server
                    console.log('Form submitted:', { name, email, subject, message });
                    
                    // Show success message
                    alert('Thank you for your message! We will get back to you soon.');
                    
                    // Reset form
                    this.reset();
                });
                
                // Back to top button
                const backToTopButton = document.querySelector('.back-to-top');
                
                window.addEventListener('scroll', () => {
                    if (window.pageYOffset > 300) {
                        backToTopButton.classList.add('active');
                    } else {
                        backToTopButton.classList.remove('active');
                    }
                });
                
                backToTopButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            </script>
        </body>
        </html>
    `);
});
// Login Page
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login - MyShop</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #ff6b6b;
                    --dark-color: #2c3e50;
                    --light-color: #f8f9fa;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--secondary-color);
                    color: var(--dark-color);
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                
                /* Navbar styles (consistent with other pages) */
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.8rem;
                }
                
                .nav-link {
                    font-weight: 500;
                    position: relative;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                /* Login Page Specific Styles */
                .login-hero {
                    background: linear-gradient(135deg, var(--primary-color), #224abe);
                    padding: 3rem 0;
                    position: relative;
                    overflow: hidden;
                    color: white;
                }
                
                .login-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80') center/cover;
                    opacity: 0.15;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 1;
                }
                
                .login-container {
                    max-width: 500px;
                    margin: 2rem auto;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    background: white;
                    position: relative;
                    overflow: hidden;
                }
                
                .login-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 5px;
                    height: 100%;
                    background: var(--primary-color);
                }
                
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .login-icon {
                    font-size: 3rem;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                    animation: bounce 2s infinite;
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                    40% {transform: translateY(-20px);}
                    60% {transform: translateY(-10px);}
                }
                
                .form-control:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
                }
                
                .btn-login {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    padding: 0.5rem 1.5rem;
                    font-weight: 500;
                    transition: all 0.3s;
                }
                
                .btn-login:hover {
                    background-color: #3a5bc7;
                    border-color: #3a5bc7;
                    transform: translateY(-2px);
                }
                
                .login-footer {
                    text-align: center;
                    margin-top: 1.5rem;
                }
                
                .login-footer a {
                    color: var(--primary-color);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .login-footer a:hover {
                    color: var(--accent-color);
                }
                
                /* Social Login */
                .social-login {
                    margin-top: 2rem;
                    text-align: center;
                }
                
                .social-login p {
                    position: relative;
                    margin-bottom: 1.5rem;
                }
                
                .social-login p::before,
                .social-login p::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    width: 30%;
                    height: 1px;
                    background: #ddd;
                }
                
                .social-login p::before {
                    left: 0;
                }
                
                .social-login p::after {
                    right: 0;
                }
                
                .social-icons {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }
                
                .social-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: white;
                    transition: all 0.3s;
                }
                
                .social-btn:hover {
                    transform: translateY(-3px);
                }
                
                .btn-google {
                    background: #DB4437;
                }
                
                .btn-facebook {
                    background: #4267B2;
                }
                
                .btn-twitter {
                    background: #1DA1F2;
                }
                
                /* Footer styles (consistent with other pages) */
                footer {
                    background: var(--dark-color);
                    color: white;
                    padding: 40px 0 20px;
                    margin-top: auto;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-links a:hover {
                    color: white;
                }
                
                .social-icons-footer a {
                    color: white;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    transition: transform 0.3s;
                }
                
                .social-icons-footer a:hover {
                    transform: translateY(-5px);
                }
                
                /* Responsive adjustments */
                @media (max-width: 767.98px) {
                    .navbar-brand {
                        font-size: 1.5rem;
                    }
                    
                    .login-hero {
                        padding: 2rem 0;
                    }
                    
                    .login-container {
                        margin: 1rem;
                        padding: 1.5rem;
                    }
                    
                    .display-4 {
                        font-size: 2rem;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .login-container {
                        margin: 1rem 0.5rem;
                        padding: 1rem;
                    }
                    
                    .social-login p::before,
                    .social-login p::after {
                        width: 25%;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar (consistent with other pages) -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">SRI NAGALAKSHMI </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link active" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </li>
                           
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Hero Section -->
            <section class="login-hero">
                <div class="container hero-content text-center animate__animated animate__fadeIn">
                    <h1 class="display-4 fw-bold mb-3">Admin Login</h1>
                    <p class="lead">Secure access to your account</p>
                </div>
            </section>
            
            <!-- Main Content -->
            <main class="flex-grow-1">
                <div class="container my-5">
                    <div class="login-container animate__animated animate__fadeInUp">
                        <div class="login-header">
                            <div class="login-icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <h2>Welcome Back</h2>
                            <p class="text-muted">Please enter your credentials to login</p>
                        </div>
                        
                        <form action="/login" method="POST">
                            <div class="mb-4">
                                <label for="phone" class="form-label">Phone Number</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-mobile-alt"></i></span>
                                    <input type="text" class="form-control" id="phone" name="phone" placeholder="Enter your phone number" required>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label for="password" class="form-label">Password</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-key"></i></span>
                                    <input type="password" class="form-control" id="password" name="password" placeholder="Enter your password" required>
                                    <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="rememberMe">
                                    <label class="form-check-label" for="rememberMe">Remember me</label>
                                </div>
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" class="btn btn-login btn-lg" >Login</button>
                            </div>
                        </form>
                        
                     
                        
                        <div class="social-login">
                            <p class="text-muted">or login with</p>
                            <div class="social-icons">
                                <a href="#" class="social-btn btn-google animate__animated animate__fadeIn" style="animation-delay: 0.2s">
                                    <i class="fab fa-google"></i>
                                </a>
                                <a href="#" class="social-btn btn-facebook animate__animated animate__fadeIn" style="animation-delay: 0.4s">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" class="social-btn btn-twitter animate__animated animate__fadeIn" style="animation-delay: 0.6s">
                                    <i class="fab fa-twitter"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <!-- Footer (consistent with other pages) -->
            <footer>
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <h5>SRI NAGALAKSHMI TEXTILES</h5>
                            <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login">Login</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Categories</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#">Electronics</a></li>
                                <li><a href="#">Fashion</a></li>
                                <li><a href="#">Home & Kitchen</a></li>
                                <li><a href="#">Beauty</a></li>
                            </ul>
                        </div>
                        <div class="col-md-4 mb-4">
                            <h5>Connect With Us</h5>
                            <div class="social-icons-footer">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                            </div>
                            <div class="mt-3">
                                <p><i class="fas fa-envelope me-2"></i> chennak238@gmail.com</p>
                                <p><i class="fas fa-phone me-2"></i> 63828 87930</p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4 bg-light">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2023 SRI NAGALAKSHMI TEXTILES. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <p class="mb-0">
                                <a href="#" class="text-white me-3">Privacy Policy</a>
                                <a href="#" class="text-white">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Back to Top Button -->
            <a href="#" class="back-to-top animate__animated animate__fadeIn">
                <i class="fas fa-arrow-up"></i>
            </a>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                // Toggle password visibility
                document.getElementById('togglePassword').addEventListener('click', function() {
                    const passwordInput = document.getElementById('password');
                    const icon = this.querySelector('i');
                    
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        passwordInput.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
                
                // Form validation
                document.querySelector('form').addEventListener('submit', function(e) {
                    const phone = document.getElementById('phone').value;
                    const password = document.getElementById('password').value;
                    
                    if (!phone || !password) {
                        e.preventDefault();
                        alert('Please fill in all fields');
                    }
                    
                    // Additional validation can be added here
                });
                
                // Back to top button
                const backToTopButton = document.querySelector('.back-to-top');
                
                window.addEventListener('scroll', () => {
                    if (window.pageYOffset > 300) {
                        backToTopButton.classList.add('active');
                    } else {
                        backToTopButton.classList.remove('active');
                    }
                });
                
                backToTopButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            </script>
        </body>
        </html>
    `);
});
// Login POST
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    if (phone === 'nagalakshmi' && password === 'n@g@l@kshmi') {
        res.cookie('adminLoggedIn', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year cookie
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=1');
    }
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('adminLoggedIn');
    res.redirect('/');
});

// Admin Dashboard
// Admin Dashboard Route
app.get('/admin', (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Dashboard | MyShop</title>
            <!-- Bootstrap 5 CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- DataTables CSS -->
            <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .navbar-admin {
                    background-color: #343a40;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .card-product {
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .card-product:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .product-image {
                    height: 200px;
                    object-fit: contain;
                    background: #f8f9fa;
                }
                .stats-card {
                    transition: transform 0.3s;
                }
                .stats-card:hover {
                    transform: translateY(-3px);
                }
                .dropdown-menu {
                    border: none;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .dropdown-item:hover {
                    background-color: #f8f9fa;
                }
                .table-responsive {
                    overflow-x: auto;
                }
                #ordersTable_wrapper .row {
                    margin: 0;
                }
                #ordersTable_wrapper .col-sm-12 {
                    padding: 0;
                }
            </style>
        </head>
        <body>
            <!-- Top Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-dark navbar-admin sticky-top">
                <div class="container">
                    <a class="navbar-brand fw-bold" href="/admin">
                        <i class="fas fa-crown me-2"></i>TEXTILE Admin
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="adminNavbar">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link active" href="/admin">
                                    <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/orders">
                                    <i class="fas fa-shopping-bag me-1"></i>Orders
                                </a>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" id="productsDropdown" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-boxes me-1"></i>Products
                                </a>
                                <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/admin/add-product">Add New Product</a></li>

                                </ul>
                            </li>
                         
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-user-cog me-1"></i>Admin
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="/logout"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <div class="container py-4">
                <!-- Dashboard Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0"><i class="fas fa-tachometer-alt me-2"></i>Dashboard Overview</h2>
                    <div>
                        
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="row mb-4 g-4">
                    <div class="col-md-3">
                        <div class="card stats-card border-0 shadow-sm bg-primary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title">Total Products</h6>
                                        <h3 id="totalProducts" class="mb-0">0</h3>
                                    </div>
                                    <i class="fas fa-box fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stats-card border-0 shadow-sm bg-success text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title">Total Orders</h6>
                                        <h3 id="totalOrders" class="mb-0">0</h3>
                                    </div>
                                    <i class="fas fa-shopping-bag fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stats-card border-0 shadow-sm bg-warning text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title">Pending Orders</h6>
                                        <h3 id="pendingOrders" class="mb-0">0</h3>
                                    </div>
                                    <i class="fas fa-clock fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card stats-card border-0 shadow-sm bg-info text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title">Total Revenue</h6>
                                        <h3 id="totalRevenue" class="mb-0">₹0</h3>
                                    </div>
                                    <i class="fas fa-rupee-sign fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Products -->
                <div class="card mb-4 border-0 shadow-sm">
                    <div class="card-header bg-white border-0 py-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-boxes me-2"></i>Recent Products</h5>
                            <a href="/admin/products" class="btn btn-sm btn-outline-primary">View All</a>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-4" id="products-container">
                            <!-- Products will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <!-- Recent Orders Table -->
                
            </div>

            <!-- Footer -->
       <footer class="bg-dark text-white py-4 mt-5">
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <h5><i class="fas fa-crown me-2"></i>SRI NAGALAKSHMI  Admin</h5>
                <p>Complete e-commerce administration panel</p>
            </div>
            <div class="col-md-3">
                <h5>Quick Links</h5>
                <ul class="list-unstyled">
                    <li><a href="/admin" class="text-decoration-none text-white">Dashboard</a></li>
                    <li><a href="/admin/orders" class="text-decoration-none text-white">Orders</a></li>
                    <li><a href="/admin/products" class="text-decoration-none text-white">Products</a></li>
                </ul>
            </div>
            <div class="col-md-3">
                <h5>Support</h5>
                <ul class="list-unstyled">
                    <li><a href="#" class="text-decoration-none text-white">Documentation</a></li>
                    <li><a href="#" class="text-decoration-none text-white">Help Center</a></li>
                    <li><a href="#" class="text-decoration-none text-white">Contact</a></li>
                </ul>
            </div>
        </div>
        <hr class="my-4 bg-white">
        <div class="text-center">
            <p class="mb-0">© <script>document.write(new Date().getFullYear())</script> SRI NAGALAKSHMI TEXTILES Admin Panel. All rights reserved.</p>
        </div>
    </div>
</footer>


            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <!-- jQuery -->
            <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
            <!-- DataTables JS -->
            <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
            <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
            
            <script>
                // Initialize DataTable with proper error handling
                $(document).ready(function() {
                    $('#ordersTable').DataTable({
                        ajax: {
                            url: '/api/orders',
                            dataSrc: 'data',
                            error: function(xhr, error, thrown) {
                                console.error('DataTables error:', error, thrown);
                                // Show error message to user
                                $('#ordersTable').html('<div class="alert alert-danger">Failed to load orders data. Please try again later.</div>');
                            }
                        },
                        columns: [
                            { data: '_id' },
                            { 
                                data: 'customer',
                                render: function(data, type, row) {
                                    return data?.name || 'Guest';
                                }
                            },
                            { 
                                data: 'createdAt',
                                render: function(data) {
                                    return new Date(data).toLocaleDateString();
                                }
                            },
                            { 
                                data: 'totalAmount',
                                render: function(data) {
                                    return '₹' + (data || 0).toLocaleString();
                                }
                            },
                            { 
                                data: 'status',
                                render: function(data) {
                                    let badgeClass = 'bg-secondary';
                                    if (data === 'Delivered') badgeClass = 'bg-success';
                                    if (data === 'Pending') badgeClass = 'bg-warning';
                                    if (data === 'Cancelled') badgeClass = 'bg-danger';
                                    return '<span class="badge ' + badgeClass + '">' + (data || 'Processing') + '</span>';
                                }
                            },
                            {
                                data: null,
                                render: function(data, type, row) {
                                    return \`
                                        <div class="d-flex gap-2">
                                            <a href="/admin/order/\${row._id}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <button class="btn btn-sm btn-outline-success" onclick="updateOrderStatus('\${row._id}', 'Delivered')">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </div>
                                    \`;
                                }
                            }
                        ],
                        responsive: true,
                        order: [[2, 'desc']] // Sort by date descending
                    });
                });

                // Load dashboard stats
                function loadDashboardStats() {
                    fetch('/api/dashboard-stats')
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.json();
                        })
                        .then(stats => {
                            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
                            document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
                            document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
                            document.getElementById('totalRevenue').textContent = '₹' + (stats.totalRevenue || 0).toLocaleString();
                        })
                        .catch(error => {
                            console.error('Error loading dashboard stats:', error);
                        });
                }

                // Load products
                function loadProducts() {
                    fetch('/api/products?limit=4')
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.json();
                        })
                        .then(products => {
                            const container = document.getElementById('products-container');
                            container.innerHTML = '';
                            
                            products.forEach(product => {
                                const productCol = document.createElement('div');
                                productCol.className = 'col-md-3 col-6';
                                productCol.innerHTML = \`
                                    <div class="card card-product h-100 border-0 shadow-sm">
                                        <img src="\${product.mainImage}" class="card-img-top product-image p-3" alt="\${product.name}">
                                        <div class="card-body">
                                            <h5 class="card-title">\${product.name}</h5>
                                            <p class="card-text text-muted small">\${product.description.substring(0, 50)}...</p>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span class="fw-bold text-danger">₹\${product.price}</span>
                                                    <small class="text-decoration-line-through text-muted ms-2">₹\${product.mrp}</small>
                                                </div>
                                                <span class="badge bg-success">\${product.offerPercentage}% off</span>
                                            </div>
                                        </div>
                                        <div class="card-footer bg-white border-0">
                                            <div class="d-flex justify-content-between">
                                                <a href="/admin/edit-product/\${product._id}" class="btn btn-sm btn-outline-primary">
                                                    <i class="fas fa-edit me-1"></i>Edit
                                                </a>
                                                <button onclick="deleteProduct('\${product._id}')" class="btn btn-sm btn-outline-danger">
                                                    <i class="fas fa-trash me-1"></i>Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                \`;
                                container.appendChild(productCol);
                            });
                        })
                        .catch(error => {
                            console.error('Error loading products:', error);
                            document.getElementById('products-container').innerHTML = 
                                '<div class="col-12 text-center text-muted">Failed to load products. Please try again.</div>';
                        });
                }

                // Delete product function
                function deleteProduct(id) {
                    if (confirm('Are you sure you want to delete this product?')) {
                        fetch(\`/api/products/\${id}\`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                alert('Error deleting product');
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                            alert('Error deleting product');
                        });
                    }
                }

                // Update order status function
                function updateOrderStatus(orderId, status) {
                    if (confirm(\`Are you sure you want to mark this order as \${status}?\`)) {
                        fetch(\`/api/orders/\${orderId}/status\`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status })
                        }).then(response => {
                            if (response.ok) {
                                $('#ordersTable').DataTable().ajax.reload();
                            } else {
                                alert('Error updating order status');
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                            alert('Error updating order status');
                        });
                    }
                }

                // Initialize the page
                loadDashboardStats();
                loadProducts();
            </script>
        </body>
        </html>
    `);
});

// API Endpoints needed for the dashboard
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const revenueResult = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        res.json({
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customer', 'name email');

        res.json({
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
// Admin Orders Page
app.get('/admin/orders', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    const orders = await Order.find().sort({ orderedAt: -1 }).populate('productId');
    
    let ordersHTML = '';
    for (const order of orders) {
        // Get product details including image
        const product = await Product.findById(order.productId);
        const productImage = product ? product.mainImage : '';
        const statusClass = getStatusClass(order.status);
        
        ordersHTML += `
            <div class="order-card card mb-4 animate__animated animate__fadeIn">
                <div class="row g-0">
                    <div class="col-md-3">
                        ${productImage ? `
                        <div class="product-image-container">
                            <img src="${productImage}" class="img-fluid rounded-start" alt="${order.productName}">
                        </div>
                        ` : '<div class="no-image-placeholder p-3 bg-light text-center">No Image</div>'}
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <h5 class="card-title">Order #${order._id}</h5>
                                <span class="badge ${statusClass}">${order.status}</span>
                            </div>
                            
                            <div class="row mt-2">
                                <div class="col-md-6">
                                    <p class="card-text"><strong>Product:</strong> ${order.productName}</p>
                                    <p class="card-text"><strong>Size:</strong> ${order.size}</p>
                                    <p class="card-text"><strong>Price:</strong> ₹${order.price}</p>
                                    <p class="card-text"><strong>Quantity:</strong> ${order.quantity}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="card-text"><strong>Customer Phone:</strong> ${order.phone}</p>
                                    <p class="card-text"><strong>Ordered At:</strong> ${new Date(order.orderedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div class="mt-2">
                                <p class="card-text"><strong>Address:</strong> ${order.street}, ${order.area}, ${order.district}, ${order.state} - ${order.pincode}</p>
                            </div>
                            
                            <div class="mt-3 d-flex justify-content-end">
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="updateOrderStatus('${order._id}', 'processing')">
                                    <i class="fas fa-cog me-1"></i> Processing
                                </button>
                                <button class="btn btn-sm btn-outline-success me-2" onclick="updateOrderStatus('${order._id}', 'shipped')">
                                    <i class="fas fa-truck me-1"></i> Shipped
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="updateOrderStatus('${order._id}', 'cancelled')">
                                    <i class="fas fa-times me-1"></i> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Orders | SRI NAGALAKSHMI TEXTILES</title>
            
            <!-- Bootstrap 5 CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            
            <!-- Custom CSS -->
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #2e59d9;
                    --dark-color: #5a5c69;
                }
                
                body {
                    background-color: #f8f9fc;
                    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                
                .navbar-brand {
                    font-weight: 800;
                    font-size: 1.5rem;
                    color: var(--primary-color) !important;
                }
                
                .admin-navbar {
                    background: white;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                    padding: 0.75rem 1.5rem;
                }
                
                .nav-link {
                    font-weight: 600;
                    color: var(--dark-color);
                    padding: 0.5rem 1rem !important;
                    border-radius: 0.35rem;
                    transition: all 0.3s;
                }
                
                .nav-link:hover, .nav-link.active {
                    color: var(--primary-color);
                    background-color: rgba(78, 115, 223, 0.1);
                }
                
                .order-card {
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
                    transition: transform 0.3s, box-shadow 0.3s;
                    overflow: hidden;
                }
                
                .order-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1.5rem rgba(58, 59, 69, 0.2);
                }
                
                .product-image-container {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f8f9fa;
                    padding: 1rem;
                }
                
                .product-image-container img {
                    max-height: 200px;
                    object-fit: contain;
                }
                
                .no-image-placeholder {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-style: italic;
                }
                
                .status-badge {
                    font-size: 0.8rem;
                    padding: 0.35rem 0.65rem;
                    border-radius: 0.25rem;
                }
                
                .badge-processing {
                    background-color: #f6c23e;
                    color: #000;
                }
                
                .badge-shipped {
                    background-color: #1cc88a;
                    color: #fff;
                }
                
                .badge-delivered {
                    background-color: #36b9cc;
                    color: #fff;
                }
                
                .badge-cancelled {
                    background-color: #e74a3b;
                    color: #fff;
                }
                
                .page-footer {
                    background-color: white;
                    padding: 1.5rem 0;
                    margin-top: 3rem;
                    box-shadow: 0 -0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
                }
                
                .loading-spinner {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                    z-index: 9999;
                    justify-content: center;
                    align-items: center;
                }
                
                .spinner-border {
                    width: 3rem;
                    height: 3rem;
                }
                
                @media (max-width: 768px) {
                    .order-card .row {
                        flex-direction: column;
                    }
                    
                    .order-card .col-md-3 {
                        width: 100%;
                    }
                    
                    .order-card .col-md-9 {
                        width: 100%;
                    }
                    
                    .product-image-container {
                        height: 200px;
                    }
                }
                
                /* Animation for status change */
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .status-change {
                    animation: pulse 0.5s ease-in-out;
                }
            </style>
        </head>
        <body>
            <!-- Loading Spinner -->
            <div id="loadingSpinner" class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg admin-navbar">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/admin">SRI NAGALAKSHMI </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="adminNavbar">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link" href="/admin"><i class="fas fa-home me-1"></i> Dashboard</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/admin/orders"><i class="fas fa-shopping-bag me-1"></i> Orders</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/add-product"><i class="fas fa-plus-circle me-1"></i> Add Product</a>
                            </li>
                           
                        </ul>
                        <div class="d-flex">
                            <a href="/logout" class="btn btn-outline-danger"><i class="fas fa-sign-out-alt me-1"></i> Logout</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <!-- Main Content -->
            <main class="container my-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0"><i class="fas fa-clipboard-list me-2"></i> Orders Management</h2>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown">
                            <i class="fas fa-filter me-1"></i> Filter Orders
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="filterOrders('all')">All Orders</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="filterOrders('pending')">Pending</a></li>
                            <li><a class="dropdown-item" href="#" onclick="filterOrders('processing')">Processing</a></li>
                            <li><a class="dropdown-item" href="#" onclick="filterOrders('shipped')">Shipped</a></li>
                            <li><a class="dropdown-item" href="#" onclick="filterOrders('delivered')">Delivered</a></li>
                            <li><a class="dropdown-item" href="#" onclick="filterOrders('cancelled')">Cancelled</a></li>
                        </ul>
                    </div>
                </div>
                
                ${orders.length > 0 ? ordersHTML : `
                    <div class="text-center py-5">
                        <i class="fas fa-box-open fa-4x mb-3 text-muted"></i>
                        <h3 class="text-muted">No Orders Found</h3>
                        <p class="text-muted">There are currently no orders in the system.</p>
                    </div>
                `}
            </main>
            
            <!-- Footer -->
            <footer class="page-footer">
                <div class="container text-center">
                    <p class="mb-0">&copy; ${new Date().getFullYear()} SRI NAGALAKSHMI TEXTILES Admin Panel. All rights reserved.</p>
                    <p class="text-muted small mb-0">v1.0.0</p>
                </div>
            </footer>
            
            <!-- Bootstrap 5 JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <!-- Custom JavaScript -->
            <script>
                function getStatusClass(status) {
                    switch(status.toLowerCase()) {
                        case 'pending': return 'bg-warning';
                        case 'processing': return 'bg-info';
                        case 'shipped': return 'bg-primary';
                        case 'delivered': return 'bg-success';
                        case 'cancelled': return 'bg-danger';
                        default: return 'bg-secondary';
                    }
                }
                
                function filterOrders(status) {
                    document.getElementById('loadingSpinner').style.display = 'flex';
                    window.location.href = '/admin/orders?status=' + status;
                }
                
                async function updateOrderStatus(orderId, newStatus) {
                    try {
                        document.getElementById('loadingSpinner').style.display = 'flex';
                        
                        const response = await fetch('/admin/orders/update-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                orderId: orderId,
                                newStatus: newStatus
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            // Find the order card and update the status badge with animation
                            const orderCards = document.querySelectorAll('.order-card');
                            orderCards.forEach(card => {
                                if (card.textContent.includes(orderId)) {
                                    const badge = card.querySelector('.badge');
                                    badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                                    badge.className = 'badge ' + getStatusClass(newStatus);
                                    badge.classList.add('status-change');
                                    
                                    // Remove animation class after animation completes
                                    setTimeout(() => {
                                        badge.classList.remove('status-change');
                                    }, 500);
                                }
                            });
                            
                            // Show success toast
                            showToast('Status updated successfully!', 'success');
                        } else {
                            showToast('Failed to update status: ' + result.message, 'danger');
                        }
                    } catch (error) {
                        showToast('An error occurred: ' + error.message, 'danger');
                    } finally {
                        document.getElementById('loadingSpinner').style.display = 'none';
                    }
                }
                
                function showToast(message, type) {
                    // Create toast container if it doesn't exist
                    let toastContainer = document.getElementById('toastContainer');
                    if (!toastContainer) {
                        toastContainer = document.createElement('div');
                        toastContainer.id = 'toastContainer';
                        toastContainer.style.position = 'fixed';
                        toastContainer.style.top = '20px';
                        toastContainer.style.right = '20px';
                        toastContainer.style.zIndex = '1100';
                        document.body.appendChild(toastContainer);
                    }
                    
                    // Create toast element
                    const toast = document.createElement('div');
                    toast.className = \`toast show align-items-center text-white bg-\${type} border-0\`;
                    toast.role = 'alert';
                    toast.style.marginBottom = '10px';
                    
                    toast.innerHTML = \`
                        <div class="d-flex">
                            <div class="toast-body">
                                \${message}
                            </div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                        </div>
                    \`;
                    
                    // Add to container
                    toastContainer.appendChild(toast);
                    
                    // Auto remove after 5 seconds
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                            if (toastContainer.children.length === 0) {
                                toastContainer.remove();
                            }
                        }, 300);
                    }, 5000);
                    
                    // Add click to dismiss
                    toast.querySelector('.btn-close').addEventListener('click', () => {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                            if (toastContainer.children.length === 0) {
                                toastContainer.remove();
                            }
                        }, 300);
                    });
                }
                
                // Hide loading spinner when page is fully loaded
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        document.getElementById('loadingSpinner').style.display = 'none';
                    }, 500);
                });
            </script>
        </body>
        </html>
    `);
});

// Helper function to get appropriate Bootstrap class for status
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'badge-processing';
        case 'processing': return 'badge-processing';
        case 'shipped': return 'badge-shipped';
        case 'delivered': return 'badge-delivered';
        case 'cancelled': return 'badge-cancelled';
        default: return 'badge-secondary';
    }
}
app.post('/admin/orders/update-status', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
        const { orderId, newStatus } = req.body;
        
        const order = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Add Product Page
app.get('/admin/add-product', (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Add Product | MyShop Admin</title>
            
            <!-- Bootstrap 5 CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            
            <!-- Custom CSS -->
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #2e59d9;
                    --dark-color: #5a5c69;
                }
                
                body {
                    background-color: #f8f9fc;
                    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                
                .navbar-brand {
                    font-weight: 800;
                    font-size: 1.5rem;
                    color: var(--primary-color) !important;
                }
                
                .admin-navbar {
                    background: white;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                    padding: 0.75rem 1.5rem;
                }
                
                .nav-link {
                    font-weight: 600;
                    color: var(--dark-color);
                    padding: 0.5rem 1rem !important;
                    border-radius: 0.35rem;
                    transition: all 0.3s;
                }
                
                .nav-link:hover, .nav-link.active {
                    color: var(--primary-color);
                    background-color: rgba(78, 115, 223, 0.1);
                }
                
                .product-form-container {
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
                    padding: 2rem;
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                    animation: fadeInUp 0.5s ease-out;
                }
                
                .form-title {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                    position: relative;
                    padding-bottom: 0.5rem;
                }
                
                .form-title:after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 50px;
                    height: 3px;
                    background: var(--primary-color);
                }
                
                .form-control, .form-select {
                    border-radius: 0.35rem;
                    padding: 0.75rem 1rem;
                    border: 1px solid #d1d3e2;
                    transition: all 0.3s;
                }
                
                .form-control:focus, .form-select:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
                }
                
                .file-upload-wrapper {
                    position: relative;
                    margin-bottom: 1rem;
                }
                
                .file-upload-input {
                    position: absolute;
                    left: 0;
                    top: 0;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
                
                .file-upload-label {
                    display: block;
                    padding: 1.5rem;
                    border: 2px dashed #d1d3e2;
                    border-radius: 0.35rem;
                    text-align: center;
                    transition: all 0.3s;
                    background-color: #f8f9fc;
                }
                
                .file-upload-label:hover {
                    border-color: var(--primary-color);
                    background-color: rgba(78, 115, 223, 0.05);
                }
                
                .file-upload-icon {
                    font-size: 2rem;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
                
                .file-upload-text {
                    font-weight: 600;
                    color: var(--dark-color);
                }
                
                .file-upload-hint {
                    font-size: 0.875rem;
                    color: #858796;
                }
                
                .preview-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .preview-item {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    border-radius: 0.35rem;
                    overflow: hidden;
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                }
                
                .preview-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .preview-item .remove-btn {
                    position: absolute;
                    top: 0.25rem;
                    right: 0.25rem;
                    width: 1.5rem;
                    height: 1.5rem;
                    background: rgba(231, 74, 59, 0.8);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .preview-item:hover .remove-btn {
                    opacity: 1;
                }
                
                .btn-submit {
                    background-color: var(--primary-color);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                
                .btn-submit:hover {
                    background-color: var(--accent-color);
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }
                
                .btn-submit:active {
                    transform: translateY(0);
                }
                
                .page-footer {
                    background-color: white;
                    padding: 1.5rem 0;
                    margin-top: 3rem;
                    box-shadow: 0 -0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
                }
                
                .loading-spinner {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                    z-index: 9999;
                    justify-content: center;
                    align-items: center;
                }
                
                .spinner-border {
                    width: 3rem;
                    height: 3rem;
                }
                
                /* Animation for form elements */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .form-group {
                    animation: fadeInUp 0.5s ease-out;
                    animation-fill-mode: both;
                }
                
                /* Delay animations for each form group */
                .form-group:nth-child(1) { animation-delay: 0.1s; }
                .form-group:nth-child(2) { animation-delay: 0.2s; }
                .form-group:nth-child(3) { animation-delay: 0.3s; }
                .form-group:nth-child(4) { animation-delay: 0.4s; }
                .form-group:nth-child(5) { animation-delay: 0.5s; }
                .form-group:nth-child(6) { animation-delay: 0.6s; }
                .form-group:nth-child(7) { animation-delay: 0.7s; }
                .form-group:nth-child(8) { animation-delay: 0.8s; }
                .form-group:nth-child(9) { animation-delay: 0.9s; }
                
                @media (max-width: 768px) {
                    .product-form-container {
                        padding: 1.5rem;
                    }
                    
                    .form-title {
                        font-size: 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Loading Spinner -->
            <div id="loadingSpinner" class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg admin-navbar">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/admin">SRI NAGALAKSHMI  </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="adminNavbar">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link" href="/admin"><i class="fas fa-home me-1"></i> Dashboard</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/orders"><i class="fas fa-shopping-bag me-1"></i> Orders</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/admin/add-product"><i class="fas fa-plus-circle me-1"></i> Add Product</a>
                            </li>
                           
                        </ul>
                        <div class="d-flex">
                            <a href="/logout" class="btn btn-outline-danger"><i class="fas fa-sign-out-alt me-1"></i> Logout</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <!-- Main Content -->
            <main class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="product-form-container animate__animated animate__fadeInUp">
                            <h2 class="form-title"><i class="fas fa-plus-circle me-2"></i>Add New Product</h2>
                            
                            <form id="productForm" enctype="multipart/form-data">
                                <!-- Product Name -->
                                <div class="form-group mb-4">
                                    <label for="name" class="form-label">Product Name</label>
                                    <input type="text" class="form-control" id="name" name="name" required>
                                </div>
                                
                                <!-- Category -->
                                <div class="form-group mb-4">
                                    <label for="category" class="form-label">Category</label>
                                    <select class="form-select" id="category" name="category" required>
                                        <option value="" selected disabled>Select a category</option>
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Kids">Kids</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Footwear">Footwear</option>
                                    </select>
                                </div>
                                
                                <!-- Description -->
                                <div class="form-group mb-4">
                                    <label for="description" class="form-label">Description</label>
                                    <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
                                </div>
                                
                                <!-- Price Information -->
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-group mb-4">
                                            <label for="price" class="form-label">Price (₹)</label>
                                            <input type="number" class="form-control" id="price" name="price" step="0.01" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group mb-4">
                                            <label for="offerPercentage" class="form-label">Offer (%)</label>
                                            <input type="number" class="form-control" id="offerPercentage" name="offerPercentage" min="0" max="100" required>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group mb-4">
                                            <label for="mrp" class="form-label">MRP (₹)</label>
                                            <input type="number" class="form-control" id="mrp" name="mrp" step="0.01" required>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Sizes -->
                                <div class="form-group mb-4">
                                    <label for="size" class="form-label">Available Sizes</label>
                                    <div class="d-flex flex-wrap gap-2" id="sizeTagsContainer">
                                        <!-- Size tags will be added here -->
                                    </div>
                                    <input type="text" class="form-control mt-2" id="sizeInput" placeholder="Enter sizes separated by commas (e.g., S,M,L,XL)">
                                    <input type="hidden" id="size" name="size">
                                    <small class="text-muted">Click 'Add' after entering each size or separate with commas</small>
                                </div>
                                
                                <!-- Main Image -->
                                <div class="form-group mb-4">
                                    <label class="form-label">Main Image</label>
                                    <div class="file-upload-wrapper">
                                        <input type="file" class="file-upload-input" id="mainImage" name="mainImage" accept="image/*" required>
                                        <label for="mainImage" class="file-upload-label">
                                            <div class="file-upload-icon">
                                                <i class="fas fa-cloud-upload-alt"></i>
                                            </div>
                                            <div class="file-upload-text">Click to upload main image</div>
                                            <div class="file-upload-hint">Recommended size: 800x800px</div>
                                        </label>
                                    </div>
                                    <div class="preview-container" id="mainImagePreview"></div>
                                </div>
                                
                                <!-- Additional Images -->
                                <div class="form-group mb-4">
                                    <label class="form-label">Additional Images</label>
                                    <div class="file-upload-wrapper">
                                        <input type="file" class="file-upload-input" id="additionalImages" name="additionalImages" accept="image/*" multiple>
                                        <label for="additionalImages" class="file-upload-label">
                                            <div class="file-upload-icon">
                                                <i class="fas fa-images"></i>
                                            </div>
                                            <div class="file-upload-text">Click to upload additional images</div>
                                            <div class="file-upload-hint">You can select multiple files</div>
                                        </label>
                                    </div>
                                    <div class="preview-container" id="additionalImagesPreview"></div>
                                </div>
                                
                                <!-- Submit Button -->
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary btn-submit">
                                        <i class="fas fa-plus-circle me-2"></i> Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            
            <!-- Footer -->
            <footer class="page-footer">
                <div class="container text-center">
                    <p class="mb-0">&copy; ${new Date().getFullYear()} SRI NAGALAKSHMI TEXTILES Admin Panel. All rights reserved.</p>
                    <p class="text-muted small mb-0">v1.0.0</p>
                </div>
            </footer>
            
            <!-- Bootstrap 5 JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <!-- Custom JavaScript -->
            <script>
                // Handle size tags
                const sizeInput = document.getElementById('sizeInput');
                const sizeTagsContainer = document.getElementById('sizeTagsContainer');
                const sizeHiddenInput = document.getElementById('size');
                let sizes = [];
                
                sizeInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addSizeTag();
                    }
                });
                
                function addSizeTag() {
                    const value = sizeInput.value.trim();
                    if (!value) return;
                    
                    // Split by commas if present
                    const newSizes = value.split(',').map(s => s.trim()).filter(s => s);
                    
                    newSizes.forEach(size => {
                        if (size && !sizes.includes(size)) {
                            sizes.push(size);
                            renderSizeTags();
                        }
                    });
                    
                    sizeInput.value = '';
                }
                
                function removeSizeTag(sizeToRemove) {
                    sizes = sizes.filter(size => size !== sizeToRemove);
                    renderSizeTags();
                }
                
                function renderSizeTags() {
                    sizeTagsContainer.innerHTML = '';
                    sizes.forEach(size => {
                        const tag = document.createElement('span');
                        tag.className = 'badge bg-primary d-inline-flex align-items-center';
                        tag.innerHTML = \`
                            \${size}
                            <button type="button" class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;" 
                                onclick="removeSizeTag('\${size}')"></button>
                        \`;
                        sizeTagsContainer.appendChild(tag);
                    });
                    sizeHiddenInput.value = JSON.stringify(sizes);
                }
                
                // Handle image previews
                document.getElementById('mainImage').addEventListener('change', function(e) {
                    const previewContainer = document.getElementById('mainImagePreview');
                    previewContainer.innerHTML = '';
                    
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const previewItem = createPreviewItem(e.target.result, true);
                            previewContainer.appendChild(previewItem);
                        };
                        reader.readAsDataURL(this.files[0]);
                    }
                });
                
                document.getElementById('additionalImages').addEventListener('change', function(e) {
                    const previewContainer = document.getElementById('additionalImagesPreview');
                    previewContainer.innerHTML = '';
                    
                    if (this.files) {
                        Array.from(this.files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                const previewItem = createPreviewItem(e.target.result, false);
                                previewContainer.appendChild(previewItem);
                            };
                            reader.readAsDataURL(file);
                        });
                    }
                });
                
                function createPreviewItem(src, isMain) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item animate__animated animate__fadeIn';
                    
                    const img = document.createElement('img');
                    img.src = src;
                    previewItem.appendChild(img);
                    
                    if (!isMain) {
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-btn';
                        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                        removeBtn.addEventListener('click', function() {
                            previewItem.classList.add('animate__fadeOut');
                            setTimeout(() => {
                                previewItem.remove();
                            }, 300);
                        });
                        previewItem.appendChild(removeBtn);
                    }
                    
                    return previewItem;
                }
                
                // Handle form submission
                document.getElementById('productForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Validate sizes
                    if (sizes.length === 0) {
                        showToast('Please add at least one size', 'danger');
                        return;
                    }
                    
                    document.getElementById('loadingSpinner').style.display = 'flex';
                    
                    const formData = new FormData(this);
                    formData.set('size', JSON.stringify(sizes));
                    
                    fetch('/api/products', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showToast('Product added successfully!', 'success');
                            setTimeout(() => {
                                window.location.href = '/admin';
                            }, 1500);
                        } else {
                            showToast('Error adding product: ' + data.message, 'danger');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showToast('Error adding product', 'danger');
                    })
                    .finally(() => {
                        document.getElementById('loadingSpinner').style.display = 'none';
                    });
                });
                
                // Show toast notification
                function showToast(message, type) {
                    // Create toast container if it doesn't exist
                    let toastContainer = document.getElementById('toastContainer');
                    if (!toastContainer) {
                        toastContainer = document.createElement('div');
                        toastContainer.id = 'toastContainer';
                        toastContainer.style.position = 'fixed';
                        toastContainer.style.top = '20px';
                        toastContainer.style.right = '20px';
                        toastContainer.style.zIndex = '1100';
                        document.body.appendChild(toastContainer);
                    }
                    
                    // Create toast element
                    const toast = document.createElement('div');
                    toast.className = \`toast show align-items-center text-white bg-\${type} border-0\`;
                    toast.role = 'alert';
                    toast.style.marginBottom = '10px';
                    
                    toast.innerHTML = \`
                        <div class="d-flex">
                            <div class="toast-body">
                                \${message}
                            </div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                        </div>
                    \`;
                    
                    // Add to container
                    toastContainer.appendChild(toast);
                    
                    // Auto remove after 5 seconds
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                            if (toastContainer.children.length === 0) {
                                toastContainer.remove();
                            }
                        }, 300);
                    }, 5000);
                    
                    // Add click to dismiss
                    toast.querySelector('.btn-close').addEventListener('click', () => {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                            if (toastContainer.children.length === 0) {
                                toastContainer.remove();
                            }
                        }, 300);
                    });
                }
                
                // Hide loading spinner when page is fully loaded
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        document.getElementById('loadingSpinner').style.display = 'none';
                    }, 500);
                });
            </script>
        </body>
        </html>
    `);
});
// Edit Product Page
app.get('/admin/edit-product/:id', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Edit Product</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <style>
                    .navbar-brand {
                        font-weight: bold;
                    }
                    .product-image {
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 5px;
                        margin-bottom: 10px;
                    }
                    .additional-images img {
                        max-width: 80px;
                        max-height: 80px;
                        margin-right: 5px;
                        margin-bottom: 5px;
                    }
                    @media (max-width: 768px) {
                        .navbar-nav {
                            flex-direction: row;
                            flex-wrap: wrap;
                        }
                        .nav-link {
                            padding: 0.5rem 0.5rem;
                        }
                    }
                </style>
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/admin">MyShop Admin</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/orders">Orders</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/add-product">Add Product</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-8 col-md-10">
                            <div class="card shadow-sm mb-4">
                                <div class="card-body">
                                    <h2 class="card-title mb-4">Edit Product</h2>
                                    <form id="productForm" enctype="multipart/form-data">
                                        <div class="mb-3">
                                            <label for="name" class="form-label">Product Name</label>
                                            <input type="text" class="form-control" id="name" name="name" value="${product.name}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="category" class="form-label">Category</label>
                                            <input type="text" class="form-control" id="category" name="category" value="${product.category}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="description" class="form-label">Description</label>
                                            <textarea class="form-control" id="description" name="description" rows="3" required>${product.description}</textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-4 mb-3">
                                                <label for="price" class="form-label">Price</label>
                                                <input type="number" class="form-control" id="price" name="price" value="${product.price}" required>
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label for="offerPercentage" class="form-label">Offer Percentage</label>
                                                <input type="number" class="form-control" id="offerPercentage" name="offerPercentage" value="${product.offerPercentage}" required>
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label for="mrp" class="form-label">MRP</label>
                                                <input type="number" class="form-control" id="mrp" name="mrp" value="${product.mrp}" required>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="size" class="form-label">Sizes (comma separated)</label>
                                            <input type="text" class="form-control" id="size" name="size" value="${product.size.join(',')}" required placeholder="S,M,L,XL">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Current Main Image</label>
                                            <div>
                                                <img src="${product.mainImage}" class="product-image" style="max-height: 200px;">
                                            </div>
                                            <label for="mainImage" class="form-label">Change Main Image</label>
                                            <input class="form-control" type="file" id="mainImage" name="mainImage" accept="image/*">
                                        </div>
                                        <div class="mb-4">
                                            <label class="form-label">Current Additional Images</label>
                                            <div class="additional-images d-flex flex-wrap">
                                                ${product.additionalImages.map(img => `<img src="${img}" class="img-thumbnail">`).join('')}
                                            </div>
                                            <label for="additionalImages" class="form-label">Change Additional Images (multiple)</label>
                                            <input class="form-control" type="file" id="additionalImages" name="additionalImages" multiple accept="image/*">
                                        </div>
                                        <div class="d-grid gap-2">
                                            <button type="button" class="btn btn-primary" onclick="updateProduct('${product._id}')">
                                                <i class="fas fa-save me-2"></i>Update Product
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    function updateProduct(id) {
                        const form = document.getElementById('productForm');
                        const formData = new FormData(form);
                        
                        // Convert sizes to array
                        const sizes = formData.get('size').split(',').map(s => s.trim());
                        formData.set('size', JSON.stringify(sizes));
                        
                        fetch(\`/api/products/\${id}\`, {
                            method: 'PUT',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('Product updated successfully!');
                                window.location.href = '/admin';
                            } else {
                                alert('Error updating product: ' + data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error updating product');
                        });
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error loading product');
    }
});
// View Product Page
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${product.name} | MyShop</title>
                <!-- Bootstrap 5 CSS -->
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <!-- Animate.css -->
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
                <!-- Font Awesome -->
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    .product-image-main {
                        transition: transform 0.3s ease;
                    }
                    .product-image-main:hover {
                        transform: scale(1.03);
                    }
                    .thumbnail {
                        cursor: pointer;
                        transition: all 0.3s ease;
                        border: 2px solid transparent;
                    }
                    .thumbnail:hover {
                        border-color: #0d6efd;
                        transform: translateY(-5px);
                    }
                    .active-thumbnail {
                        border-color: #0d6efd !important;
                    }
                    .size-option {
                        cursor: pointer;
                    }
                    .size-option input[type="radio"] {
                        opacity: 0;
                        position: absolute;
                        width: 0;
                        height: 0;
                    }
                    .size-option input[type="radio"]:checked + label {
                        background-color: #0d6efd;
                        color: white;
                    }
                    .price-section {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 15px;
                    }
                    .navbar {
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    footer {
                        background-color: #f8f9fa;
                        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                    }
                    .product-description {
                        white-space: pre-wrap;
                    }
                    .error-message {
                        color: #dc3545;
                        font-size: 0.875em;
                        margin-top: 0.25rem;
                        display: none;
                    }
                    .is-invalid {
                        border-color: #dc3545 !important;
                    }
                </style>
            </head>
            <body>
                <!-- Navbar -->
                <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                    <div class="container">
                        <a class="navbar-brand fw-bold" href="/">SRI NAGALAKSHMI</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">About Us</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/contact">Contact Us</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/login"><i class="fas fa-user me-1"></i>Login</a>
                                </li>
                           
                            </ul>
                        </div>
                    </div>
                </nav>

                <!-- Product Section -->
                <div class="container my-5 animate__animated animate__fadeIn">
                    <div class="row g-4">
                        <!-- Product Images -->
                        <div class="col-lg-6">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-3 text-center">
                                    <img id="mainImage" src="${product.mainImage}" alt="${product.name}" 
                                        class="product-image-main img-fluid mb-3" style="max-height: 500px;">
                                    
                                    <div class="d-flex flex-wrap justify-content-center gap-2">
                                        ${product.additionalImages.map((img, index) => `
                                            <div class="thumbnail ${index === 0 ? 'active-thumbnail' : ''}" 
                                                onclick="changeMainImage('${img}')">
                                                <img src="${img}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Product Details -->
                        <div class="col-lg-6">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-4">
                                    <h1 class="h2 fw-bold">${product.name}</h1>
                                    <p class="text-muted">${product.category}</p>
                                    
                                    <div class="price-section mb-4">
                                        <div class="d-flex align-items-center gap-3">
                                            <span class="h3 fw-bold text-danger">₹${product.price}</span>
                                            <span class="text-decoration-line-through text-muted">₹${product.mrp}</span>
                                            <span class="badge bg-success">${product.offerPercentage}% OFF</span>
                                        </div>
                                        <div class="mt-2">
                                            <span class="text-success">
                                                <i class="fas fa-check-circle"></i> In Stock
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <h3 class="h5 fw-bold">Description</h3>
                                        <p class="product-description">${product.description}</p>
                                    </div>
                                    
                                    <form id="buyForm" action="/checkout" method="POST" novalidate>
                                        <input type="hidden" name="productId" value="${product._id}">
                                        <input type="hidden" name="productName" value="${product.name}">
                                        <input type="hidden" name="price" value="${product.price}">
                                        <input type="hidden" name="mrp" value="${product.mrp}">
                                        
                                        <!-- Size Selection -->
                                        <div class="mb-3">
                                            <h4 class="h6 fw-bold">Size <span class="text-danger">*</span></h4>
                                            <div class="d-flex flex-wrap gap-2" id="sizeContainer">
                                                ${product.size.map(s => `
                                                    <div class="size-option">
                                                        <input type="radio" id="size-${s}" name="size" value="${s}" required>
                                                        <label for="size-${s}" class="btn btn-outline-primary">${s}</label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                            <div id="sizeError" class="error-message">Please select a size</div>
                                        </div>
                                        
                                        <!-- Quantity -->
                                        <div class="mb-4">
                                            <label for="quantity" class="form-label fw-bold">Quantity</label>
                                            <input type="number" class="form-control w-25" name="quantity" value="1" min="1">
                                        </div>
                                        
                                        <!-- Action Buttons -->
                                        <div class="d-flex gap-3">
                                            <button type="submit" class="btn btn-warning fw-bold flex-grow-1 py-2">
                                                <i class="fas fa-bolt me-2"></i>Buy Now
                                            </button>
                                           
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="py-5 mt-5">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-4 mb-4">
                                <h5 class="fw-bold">SRI NAGALAKSHMI</h5>
                                <p class="text-muted">Your one-stop shop for all your needs.</p>
                                <div class="social-icons">
                                    <a href="#" class="text-decoration-none me-2"><i class="fab fa-facebook-f"></i></a>
                                    <a href="#" class="text-decoration-none me-2"><i class="fab fa-twitter"></i></a>
                                    <a href="#" class="text-decoration-none me-2"><i class="fab fa-instagram"></i></a>
                                    <a href="#" class="text-decoration-none"><i class="fab fa-linkedin-in"></i></a>
                                </div>
                            </div>
                            <div class="col-md-2 mb-4">
                                <h5 class="fw-bold">Shop</h5>
                                <ul class="list-unstyled">
                                    <li><a href="#" class="text-decoration-none text-muted">All Products</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">New Arrivals</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Featured</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Discounts</a></li>
                                </ul>
                            </div>
                            <div class="col-md-2 mb-4">
                                <h5 class="fw-bold">Support</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/contact" class="text-decoration-none text-muted">Contact Us</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">FAQs</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Shipping</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Returns</a></li>
                                </ul>
                            </div>
                            
                        </div>
                        <hr>
                        <div class="text-center text-muted">
                            <p class="mb-0">© ${new Date().getFullYear()} SRI NAGALAKSHMI TEXTILES. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                <!-- Bootstrap JS Bundle with Popper -->
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    function changeMainImage(newSrc) {
                        const mainImage = document.getElementById('mainImage');
                        mainImage.classList.add('animate__animated', 'animate__fadeIn');
                        mainImage.src = newSrc;
                        
                        // Update active thumbnail
                        document.querySelectorAll('.thumbnail').forEach(thumb => {
                            thumb.classList.remove('active-thumbnail');
                        });
                        event.currentTarget.classList.add('active-thumbnail');
                        
                        // Remove animation classes after animation completes
                        mainImage.addEventListener('animationend', () => {
                            mainImage.classList.remove('animate__animated', 'animate__fadeIn');
                        }, {once: true});
                    }

                    // Custom form validation
                    document.getElementById('buyForm').addEventListener('submit', function(e) {
                        const sizeSelected = document.querySelector('input[name="size"]:checked');
                        const sizeError = document.getElementById('sizeError');
                        const sizeContainer = document.getElementById('sizeContainer');
                        
                        if (!sizeSelected) {
                            e.preventDefault();
                            sizeError.style.display = 'block';
                            sizeContainer.classList.add('is-invalid');
                            
                            // Add shake animation to size options
                            document.querySelectorAll('.size-option label').forEach(label => {
                                label.classList.add('animate__animated', 'animate__shakeX');
                                label.addEventListener('animationend', () => {
                                    label.classList.remove('animate__animated', 'animate__shakeX');
                                }, {once: true});
                            });
                            
                            // Focus on the first size option (even though it's hidden)
                            const firstSizeOption = document.querySelector('.size-option input');
                            if (firstSizeOption) {
                                firstSizeOption.focus({ preventScroll: true });
                            }
                        }
                    });

                    // Hide error when a size is selected
                    document.querySelectorAll('input[name="size"]').forEach(radio => {
                        radio.addEventListener('change', function() {
                            document.getElementById('sizeError').style.display = 'none';
                            document.getElementById('sizeContainer').classList.remove('is-invalid');
                        });
                    });

                    // Alternative solution to prevent default browser validation
                    document.addEventListener('invalid', (function(){
                        return function(e) {
                            e.preventDefault();
                        };
                    })(), true);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error loading product');
    }
});
// Checkout Page
// Checkout Page - Updated to show product image
app.post('/checkout', async (req, res) => {
    const { productId, productName, price, mrp, size, quantity } = req.body;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const totalPrice = price * (quantity || 1);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Checkout | MyShop</title>
                <!-- Bootstrap 5 CSS -->
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <!-- Font Awesome -->
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body {
                        background-color: #f8f9fa;
                    }
                    .checkout-container {
                        max-width: 1200px;
                    }
                    .form-section, .summary-section {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    }
                    .payment-option {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 15px;
                        transition: all 0.3s ease;
                    }
                    .payment-option:hover {
                        border-color: #0d6efd;
                        background-color: #f8f9fa;
                    }
                    .payment-option input[type="radio"]:checked + label {
                        color: #0d6efd;
                        font-weight: bold;
                    }
                    .product-thumbnail {
                        width: 100px;
                        height: 100px;
                        object-fit: contain;
                    }
                    .navbar {
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    footer {
                        background-color: #f8f9fa;
                        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                    }
                    .form-control:focus {
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
                    }
                </style>
            </head>
            <body>
                <!-- Navbar -->
                <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                    <div class="container">
                        <a class="navbar-brand fw-bold" href="/">SRI NAGALAKSHMI</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">About Us</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/contact">Contact Us</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/login"><i class="fas fa-user me-1"></i>Login</a>
                                </li>
                              
                            </ul>
                        </div>
                    </div>
                </nav>

                <!-- Main Content -->
                <div class="container checkout-container my-4">
                    <div class="row g-4">
                        <!-- Delivery Address Form -->
                        <div class="col-lg-7">
                            <div class="form-section p-4">
                                <h2 class="mb-4 fw-bold">Delivery Address</h2>
                                
                                <form action="/complete-order" method="POST">
                                    <input type="hidden" name="productId" value="${productId}">
                                    <input type="hidden" name="productName" value="${productName}">
                                    <input type="hidden" name="price" value="${price}">
                                    <input type="hidden" name="mrp" value="${mrp}">
                                    <input type="hidden" name="size" value="${size}">
                                    <input type="hidden" name="quantity" value="${quantity || 1}">
                                    
                                    <div class="mb-3">
                                        <label for="phone" class="form-label">Phone Number</label>
                                        <input type="text" class="form-control" id="phone" name="phone" required>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="street" class="form-label">Street Address</label>
                                        <input type="text" class="form-control" id="street" name="street" required>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="area" class="form-label">Area Name</label>
                                            <input type="text" class="form-control" id="area" name="area" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="pincode" class="form-label">Pincode</label>
                                            <input type="text" class="form-control" id="pincode" name="pincode" required>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="district" class="form-label">District</label>
                                            <input type="text" class="form-control" id="district" name="district" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="state" class="form-label">State</label>
                                            <input type="text" class="form-control" id="state" name="state" required>
                                        </div>
                                    </div>
                                    
                                    <h3 class="mt-5 mb-3 fw-bold">Payment Method</h3>
                                    
                                    <div class="payment-option">
                                        <input type="radio" id="cod" name="paymentMethod" value="COD" checked class="d-none">
                                        <label for="cod" class="w-100 d-block">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i class="fas fa-money-bill-wave me-2"></i>
                                                    Cash on Delivery (COD)
                                                </div>
                                                <i class="fas fa-check-circle text-primary"></i>
                                            </div>
                                            <p class="text-success mb-0 mt-2"><i class="fas fa-shipping-fast me-1"></i> Free shipping</p>
                                        </label>
                                    </div>
                                    
                                    
                                    
                                    <button type="submit" class="btn btn-warning btn-lg w-100 mt-4 py-3 fw-bold">
                                        <i class="fas fa-check-circle me-2"></i> Complete Order
                                    </button>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="col-lg-5">
                            <div class="summary-section p-4 sticky-top" style="top: 80px;">
                                <h2 class="mb-4 fw-bold">Order Summary</h2>
                                
                                <div class="d-flex gap-3 mb-4">
                                    <img src="${product.mainImage}" alt="${productName}" class="product-thumbnail rounded">
                                    <div>
                                        <h5 class="fw-bold">${productName}</h5>
                                        <p class="text-muted mb-1">Size: ${size}</p>
                                        <p class="text-muted">Quantity: ${quantity || 1}</p>
                                    </div>
                                </div>
                                
                                <div class="border-top pt-3">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Item Price:</span>
                                        <span>₹${price}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Quantity:</span>
                                        <span>${quantity || 1}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Delivery:</span>
                                        <span class="text-success">FREE</span>
                                    </div>
                                </div>
                                
                                <div class="border-top border-bottom py-3 my-3">
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span>₹${totalPrice}</span>
                                    </div>
                                </div>
                                
                                <div class="alert alert-success">
                                    <i class="fas fa-check-circle me-2"></i>
                                    Your order is eligible for FREE delivery
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="py-5 mt-5">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-4 mb-4">
                                <h5 class="fw-bold">SRI NAGALAKSHMI TEXTILES</h5>
                                <p class="text-muted">Your one-stop shop for all your needs.</p>
                                <div class="social-icons">
                                    <a href="#" class="text-decoration-none me-2"><i class="fab fa-facebook-f"></i></a>
                                    <a href="#" class="text-decoration-none me-2"><i class="fab fa-twitter"></i></a>
                                    <a href="#" class="text-decoration-none me-2"><i class="fab fa-instagram"></i></a>
                                    <a href="#" class="text-decoration-none"><i class="fab fa-linkedin-in"></i></a>
                                </div>
                            </div>
                            <div class="col-md-2 mb-4">
                                <h5 class="fw-bold">Shop</h5>
                                <ul class="list-unstyled">
                                    <li><a href="#" class="text-decoration-none text-muted">All Products</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">New Arrivals</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Featured</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Discounts</a></li>
                                </ul>
                            </div>
                            <div class="col-md-2 mb-4">
                                <h5 class="fw-bold">Support</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/contact" class="text-decoration-none text-muted">Contact Us</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">FAQs</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Shipping</a></li>
                                    <li><a href="#" class="text-decoration-none text-muted">Returns</a></li>
                                </ul>
                            </div>
                            
                        </div>
                        <hr>
                        <div class="text-center text-muted">
                            <p class="mb-0">© ${new Date().getFullYear()} SRI NAGALAKSHMI TEXTILES. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                <!-- Bootstrap JS Bundle with Popper -->
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    // Highlight selected payment method
                    document.querySelectorAll('.payment-option input[type="radio"]').forEach(radio => {
                        radio.addEventListener('change', function() {
                            document.querySelectorAll('.payment-option label').forEach(label => {
                                const icon = label.querySelector('.fa-check-circle, .fa-circle');
                                if (icon) {
                                    if (this.checked && this.id === label.htmlFor) {
                                        icon.classList.replace('fa-circle', 'fa-check-circle');
                                        icon.classList.add('text-primary');
                                    } else {
                                        icon.classList.replace('fa-check-circle', 'fa-circle');
                                        icon.classList.remove('text-primary');
                                    }
                                }
                            });
                        });
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error loading product details');
    }
});
// Complete Order
app.post('/complete-order', async (req, res) => {
    try {
        const { productId, productName, price, mrp, size, quantity, phone, street, area, pincode, district, state, paymentMethod } = req.body;
        
        const order = new Order({
            productId,
            productName,
            price,
            mrp,
            size,
            quantity,
            phone,
            street,
            area,
            pincode,
            district,
            state,
            paymentMethod
        });
        
        await order.save();
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Complete | MyShop</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <style>
                    .navbar-brand {
                        font-weight: bold;
                    }
                    .confirmation-card {
                        border: none;
                        border-radius: 10px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .confirmation-icon {
                        font-size: 4rem;
                        color: #28a745;
                        margin-bottom: 1rem;
                    }
                    .order-details {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 1.5rem;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 2rem 0;
                        margin-top: 3rem;
                    }
                    .continue-btn {
                        background-color: #FFA41C;
                        border: none;
                        padding: 10px 30px;
                        font-weight: 600;
                    }
                    .continue-btn:hover {
                        background-color: #e5941a;
                    }
                </style>
            </head>
            <body>
                <!-- Navigation Bar -->
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container">
                        <a class="navbar-brand" href="/">SRI NAGALAKSHMI</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">About Us</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/contact">Contact Us</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/login"><i class="fas fa-user me-1"></i>Login</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <!-- Main Content -->
                <div class="container my-5">
                    <div class="row justify-content-center">
                        <div class="col-lg-8">
                            <div class="card confirmation-card text-center py-4 px-3">
                                <div class="card-body">
                                    <div class="confirmation-icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <h2 class="card-title mb-4">Thank You for Your Order!</h2>
                                    <p class="lead mb-4">Your order has been placed successfully.</p>
                                    
                                    <div class="order-details text-start mb-4">
                                        <h5 class="mb-3">Order Details</h5>
                                        <p><strong>Order ID:</strong> ${order._id}</p>
                                        <p><strong>Product:</strong> ${productName}</p>
                                        <p><strong>Size:</strong> ${size}</p>
                                        <p><strong>Quantity:</strong> ${quantity}</p>
                                        <p><strong>Total Amount:</strong> ₹${price * quantity}</p>
                                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                                    </div>
                                    
                                    <div class="delivery-details text-start mb-4">
                                        <h5 class="mb-3">Delivery Address</h5>
                                        <p>${street}, ${area}</p>
                                        <p>${district}, ${state} - ${pincode}</p>
                                        <p><strong>Phone:</strong> ${phone}</p>
                                    </div>
                                    
                                    <a href="/" class="btn continue-btn mt-3">
                                        <i class="fas fa-shopping-bag me-2"></i>Continue Shopping
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="footer">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-4 mb-4 mb-md-0">
                                <h5>SRI NAGALAKSHMI TEXTILES</h5>
                                <p>Your one-stop shop for quality products at affordable prices.</p>
                            </div>
                            <div class="col-md-4 mb-4 mb-md-0">
                                <h5>Quick Links</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/" class="text-decoration-none">Home</a></li>
                                    <li><a href="/about" class="text-decoration-none">About Us</a></li>
                                    <li><a href="/contact" class="text-decoration-none">Contact Us</a></li>
                                </ul>
                            </div>
                            <div class="col-md-4">
                                <h5>Connect With Us</h5>
                                <div class="social-links">
                                    <a href="#" class="me-2"><i class="fab fa-facebook-f"></i></a>
                                    <a href="#" class="me-2"><i class="fab fa-twitter"></i></a>
                                    <a href="#" class="me-2"><i class="fab fa-instagram"></i></a>
                                    <a href="#" class="me-2"><i class="fab fa-linkedin-in"></i></a>
                                </div>
                            </div>
                        </div>
                        <hr class="my-4">
                        <div class="text-center">
                            <p class="mb-0">&copy; ${new Date().getFullYear()} MyShop. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error completing order');
    }
});
// Search Products
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
    
    let productsHTML = '';
    products.forEach(product => {
        productsHTML += `
            <div style="border: 1px solid #ddd; padding: 10px; cursor: pointer;" onclick="window.location.href='/product/${product._id}'">
                <img src="${product.mainImage}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 50)}...</p>
                <p>Price: ₹${product.price} <span style="text-decoration: line-through;">₹${product.mrp}</span> <span style="color: green;">${product.offerPercentage}% off</span></p>
            </div>
        `;
    });
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Search Results</title>
        </head>
        <body>
            <header>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: #f0f0f0;">
                    <div style="display: flex; align-items: center;">
                        <h1 style="margin: 0 20px 0 0;">MyShop</h1>
                        <a href="/" style="margin-right: 15px; text-decoration: none; color: black;">Home</a>
                        <a href="/about" style="margin-right: 15px; text-decoration: none; color: black;">About Us</a>
                        <a href="/contact" style="margin-right: 15px; text-decoration: none; color: black;">Contact Us</a>
                    </div>
                    <div>
                        <a href="/login" style="margin-right: 15px; text-decoration: none; color: black;">Login</a>
                    </div>
                </div>
                <div style="padding: 10px; background: #e0e0e0;">
                    <form action="/search" method="GET" style="display: flex;">
                        <input type="text" name="query" placeholder="Search products..." value="${query}" style="flex-grow: 1; padding: 8px;">
                        <button type="submit" style="padding: 8px 15px;">Search</button>
                    </form>
                </div>
            </header>
            
            <div style="padding: 20px;">
                <h2>Search Results for "${query}"</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                    ${productsHTML}
                </div>
            </div>
        </body>
        </html>
    `);
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new product
app.post('/api/products', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), async (req, res) => {
    try {
        const { name, category, description, price, offerPercentage, mrp, size } = req.body;
        
        // Get file paths - store relative paths from public directory
        const mainImage = req.files['mainImage'] ? '/uploads/' + req.files['mainImage'][0].filename : '';
        const additionalImages = req.files['additionalImages'] ? 
            req.files['additionalImages'].map(file => '/uploads/' + file.filename) : [];
        
        // Create product
        const product = new Product({
            name,
            category,
            description,
            price: parseFloat(price),
            offerPercentage: parseFloat(offerPercentage),
            mrp: parseFloat(mrp),
            size: JSON.parse(size),
            mainImage,
            additionalImages
        });
        
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        // Similar to POST /api/products but update existing product
        // In a real app, implement proper file handling
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            const parts = body.split('------WebKitFormBoundary');
            const data = {};
            
            parts.forEach(part => {
                if (part.includes('name="')) {
                    const nameMatch = part.match(/name="([^"]+)"/);
                    if (nameMatch) {
                        const name = nameMatch[1];
                        const value = part.split('\r\n\r\n')[1].split('\r\n')[0];
                        data[name] = value;
                    }
                }
            });
            
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            
            // Update fields
            product.name = data.name || product.name;
            product.category = data.category || product.category;
            product.description = data.description || product.description;
            product.price = parseFloat(data.price) || product.price;
            product.offerPercentage = parseFloat(data.offerPercentage) || product.offerPercentage;
            product.mrp = parseFloat(data.mrp) || product.mrp;
            product.size = JSON.parse(data.size) || product.size;
            
            // Update main image if provided
            if (data.mainImage) {
                product.mainImage = 'data:image/jpeg;base64,' + Buffer.from(data.mainImage).toString('base64');
            }
            
            await product.save();
            res.json({ success: true, product });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});