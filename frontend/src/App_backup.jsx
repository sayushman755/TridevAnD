import React, { useState, useEffect } from 'react';
import { products } from './data';
import { FaWhatsapp, FaInstagram, FaFacebook, FaBars, FaTimes } from 'react-icons/fa';
import './App.css';

// --- CONFIGURATION ---
const WHATSAPP_NUMBER = "917838881412"; 
const BRAND_NAME = "Tridevad";

function App() {
  const [category, setCategory] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Track which product is clicked (null = no popup)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Products state with local fallback as initial data
  const [productsList, setProductsList] = useState(products);

  // Fetch products from backend on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setProductsList(data);
      })
      .catch(err => {
        console.warn('Backend API is offline or unreachable. Using local fallback data.', err);
      });
  }, []);

  // Filter Logic
  const filteredProducts = category === "All" 
    ? productsList 
    : productsList.filter(p => p.category === category);

  // WhatsApp Handler
  const handleOrder = (product) => {
    const message = `Hello ${BRAND_NAME}, I am interested in:%0A%0A` +
                    `💎 *${product.name}* %0A` +
                    `💰 Price: ₹${product.price.toLocaleString()} %0A` +
                    `🔗 ID: #${product.id} %0A%0A` +
                    `Please let me know if this is available.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close modal helper
  const closeModal = () => setSelectedProduct(null);

  return (
    <div className="app">
      
      {/* NAVBAR */}
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-container">
           <img 
             src="/Products/LOGO.jpeg" 
             alt="Tridevad Logo" 
             className="brand-logo"
           />
           {/* --- ADD THIS LINE BELOW --- */}
           <span className="brand-text">Tridev A&D Shine</span>
        </div>
        
        {/* ... existing code for nav-actions ... */}
        <div className="nav-actions">
          <button className="contact-btn-small" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}>
            <FaWhatsapp /> <span>Chat</span>
          </button>
          <button className="menu-toggle" onClick={toggleMenu}>
            <FaBars />
          </button>
        </div>
      </nav>

      {/* SIDEBAR MENU */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={toggleMenu}>
          <FaTimes />
        </button>
        <div className="menu-links">
          <a href="#collection" onClick={toggleMenu}>Collection</a>
          <a href="#about" onClick={toggleMenu}>About Us</a>
          <a href="#faq" onClick={toggleMenu}>Customer Care</a>
        </div>
        <div className="menu-footer">
          <p>Follow Us</p>
          <div className="menu-socials">
            <FaInstagram /> <FaFacebook />
          </div>
        </div>
      </div>

      {/* HERO */}
      <header className="hero">
        <div className="hero-overlay">
          <span className="hero-subtitle">EST. 2026</span>
          <h1 className="hero-title">Timeless <br/> Elegance</h1>
          <p className="hero-desc">Discover jewelry that tells your story.</p>
          <div className="hero-buttons">
            <a href="#collection" className="primary-btn">Shop Collection</a>
            <a href="#about" className="secondary-btn">Our Story</a>
          </div>
        </div>
      </header>

      {/* COLLECTION */}
      <section id="collection" className="container">
        <h2 className="section-title">Curated Selection</h2>
        
        <div className="filter-bar">
          {["All", "Necklace", "Ring", "Pendant", "Earrings"].map(cat => (
            <button 
              key={cat} 
              className={category === cat ? "filter-btn active" : "filter-btn"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => setSelectedProduct(product)}
            >
              <div className="image-container">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  onError={(e) => {e.target.src = "https://via.placeholder.com/300?text=No+Image"}} 
                />
              </div>
              <div className="card-content">
                <span className="category-tag">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="price">₹{product.price.toLocaleString()}</p>
                <p className="desc">{product.description}</p>
                
                <button className="buy-btn">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="footer">
        <div className="footer-content">
          <div className="footer-section brand">
            <h3>TRIDEVAD</h3>
            <p className="brand-desc">
              Tridev A&D Shine is an anti-tarnish jewellery brand created for everyday elegance. Inspired by the lotus — a symbol of purity and beauty — our jewellery is designed to stay radiant, just like you.
              We craft lightweight, skin-friendly pieces that keep their shine for longer and suit every occasion, from daily wear to special moments.
              Timeless. Effortless. Always shining.
            </p>
          </div>
          <div className="footer-section help">
            <h4>Customer Care</h4>
            <ul>
              <li><a href="#shipping">Shipping & Delivery</a></li>
              <li><a href="#returns">Returns & Exchange</a></li>
            </ul>
          </div>
          <div className="footer-section contact">
            <h4>Get in Touch</h4>
            <a href="mailto:tridevad54@gmail.com" className="email-link">tridevad54@gmail.com</a>
            <div className="socials">
              <a href="https://www.instagram.com/tridevad/" target="_blank" rel="noopener noreferrer"><FaInstagram className="social-icon" /></a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp className="social-icon" /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Tridevad Jewelry. All rights reserved.</p>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="close-modal-btn" onClick={closeModal}>
              <FaTimes />
            </button>

            <div className="modal-layout">
              <div className="modal-image">
                 <img 
                   src={selectedProduct.image} 
                   alt={selectedProduct.name} 
                   onError={(e) => {e.target.src = "https://via.placeholder.com/300?text=No+Image"}} 
                 />
              </div>
              
              <div className="modal-details">
                <span className="modal-category">{selectedProduct.category}</span>
                <h2>{selectedProduct.name}</h2>
                <p className="modal-price">₹{selectedProduct.price.toLocaleString()}</p>
                
                <div className="modal-description">
                  <p>{selectedProduct.description}</p>
                  <p style={{marginTop:'10px', fontSize:'0.9rem', color:'#888'}}>
                    Handcrafted with precision. Includes authenticity certificate and premium box packaging.
                  </p>
                </div>

                <button 
                  onClick={() => handleOrder(selectedProduct)} 
                  className="buy-btn-large"
                >
                  <FaWhatsapp /> Inquire / Buy Now
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
