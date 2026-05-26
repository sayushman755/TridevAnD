import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { products } from "./data";
import AdminPanel from "./Admin";
import {
  API_BASE_URL,
  WHATSAPP_NUMBER,
  BRAND_NAME,
  createWhatsAppLink,
} from "./config";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaStar,
  FaShieldAlt,
  FaGem,
  FaHeart,
  FaRegHeart,
  FaTruck,
  FaLeaf,
  FaShoppingBag,
  FaMinus,
  FaPlus,
  FaTrash,
  FaCreditCard,
  FaLock,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import "./App.css";



const createSlug = (name) =>
  String(name || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const getProductSlug = (product) => product.slug || createSlug(product.name);

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://via.placeholder.com/600x750?text=Product+Image";
  }

  if (imagePath.startsWith("/uploads")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  return imagePath;
};

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname, search]);

  return null;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [productsList, setProductsList] = useState(products);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("tridevad_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("tridevad_wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend unavailable");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(data);
        }
      })
      .catch((err) => {
        console.warn("Using local product data because backend is offline.", err);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("tridevad_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("tridevad_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const wishlistCount = wishlistItems.length;

  const addToCart = (product, quantity = 1) => {
    const availableStock = Number(product.stock ?? 0);

    if (availableStock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    let shouldShowCart = true;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const existingQuantity = existingItem ? existingItem.quantity : 0;
      const requestedQuantity = existingQuantity + quantity;

      if (requestedQuantity > availableStock) {
        alert(`Only ${availableStock} item(s) available in stock.`);
        shouldShowCart = false;
        return prevItems;
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? {
              ...item,
              quantity: item.quantity + quantity,
              stock: availableStock,
            }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          slug: getProductSlug(product),
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          stock: availableStock,
          quantity,
        },
      ];
    });

    if (!shouldShowCart) return;

    setCartToast({
      name: product.name,
      image: product.image,
      quantity,
    });

    setIsCartOpen(true);

    setTimeout(() => {
      setCartToast(null);
    }, 2200);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== productId) return item;

        const availableStock = Number(item.stock ?? 0);

        if (availableStock > 0 && quantity > availableStock) {
          alert(`Only ${availableStock} item(s) available in stock.`);
          return item;
        }

        return {
          ...item,
          quantity,
        };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleWishlist = (product) => {
    setWishlistItems((prevItems) => {
      const alreadyExists = prevItems.some((item) => item.id === product.id);

      if (alreadyExists) {
        return prevItems.filter((item) => item.id !== product.id);
      }

      return [
        ...prevItems,
        {
          id: product.id,
          slug: getProductSlug(product),
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          description: product.description,
          stock: product.stock,
        },
      ];
    });
  };

  const isWishlisted = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const openWhatsApp = () => {
    const message =
      `Hello ${BRAND_NAME}, I have a query about your jewellery collection.`;

    window.open(createWhatsAppLink(message), "_blank");
  };
  return (
    <div className="app">
      <ScrollToTop />

      <Navbar
        setIsMenuOpen={setIsMenuOpen}
        openWhatsApp={openWhatsApp}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        setIsCartOpen={setIsCartOpen}
      />

      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        openWhatsApp={openWhatsApp}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />

      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        cartTotal={cartTotal}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
      />

      <CartToast cartToast={cartToast} />

      <QuickViewModal
        product={quickViewProduct}
        setQuickViewProduct={setQuickViewProduct}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        isWishlisted={isWishlisted}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              productsList={productsList}
              openWhatsApp={openWhatsApp}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              isWishlisted={isWishlisted}
              setQuickViewProduct={setQuickViewProduct}
            />
          }
        />

        <Route
          path="/collection"
          element={
            <CollectionPage
              productsList={productsList}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              isWishlisted={isWishlisted}
              setQuickViewProduct={setQuickViewProduct}
            />
          }
        />

        <Route
          path="/product/:slug"
          element={
            <ProductPage
              productsList={productsList}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              isWishlisted={isWishlisted}
              setQuickViewProduct={setQuickViewProduct}
            />
          }
        />

        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlistItems={wishlistItems}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              setQuickViewProduct={setQuickViewProduct}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              cartTotal={cartTotal}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cartItems={cartItems}
              cartTotal={cartTotal}
              clearCart={clearCart}
            />
          }
        />

        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/care"
          element={<CustomerCarePage openWhatsApp={openWhatsApp} />}
        />

        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route path="/admin" element={<AdminPanel />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer openWhatsApp={openWhatsApp} />
    </div>
  );
}

function Navbar({
  setIsMenuOpen,
  openWhatsApp,
  cartCount,
  wishlistCount,
  setIsCartOpen,
}) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <img
          src="/Products/LOGO.jpeg"
          alt="Tridev A&D Shine Logo"
          className="brand-logo"
        />
        <span className="brand-text">Tridev A&D Shine</span>
      </Link>

      <div className="desktop-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/collection">Shop</NavLink>
        <NavLink to="/wishlist">Wishlist</NavLink>
        <NavLink to="/track">Track Order</NavLink>
        <NavLink to="/about">Our Story</NavLink>
        <NavLink to="/care">Care</NavLink>
      </div>

      <div className="nav-actions">
        <button className="contact-btn-small" onClick={openWhatsApp}>
          <FaWhatsapp />
          <span>Chat</span>
        </button>

        <Link to="/wishlist" className="cart-nav-btn wishlist-nav-btn">
          <FaHeart />
          <span>Wishlist</span>
          {wishlistCount > 0 && <strong>{wishlistCount}</strong>}
        </Link>

        <button className="cart-nav-btn" onClick={() => setIsCartOpen(true)}>
          <FaShoppingBag />
          <span>Cart</span>
          {cartCount > 0 && <strong>{cartCount}</strong>}
        </button>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>
      </div>
    </nav>
  );
}

function MobileMenu({
  isMenuOpen,
  setIsMenuOpen,
  openWhatsApp,
  cartCount,
  wishlistCount,
}) {
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <aside className={`side-menu ${isMenuOpen ? "open" : ""}`}>
        <button className="close-menu" onClick={closeMenu} aria-label="Close menu">
          <FaTimes />
        </button>

        <div>
          <div className="menu-brand">
            <img src="/Products/LOGO.jpeg" alt="Tridev A&D Shine" />
            <p>Tridev A&D Shine</p>
          </div>

          <div className="menu-links">
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/collection" onClick={closeMenu}>
              Shop Collection
            </Link>
            <Link to="/wishlist" onClick={closeMenu}>
              Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
            </Link>
            <Link to="/track" onClick={closeMenu}>
              Track Order
            </Link>
            <Link to="/cart" onClick={closeMenu}>
              Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>
            <Link to="/about" onClick={closeMenu}>
              Our Story
            </Link>
            <Link to="/care" onClick={closeMenu}>
              Customer Care
            </Link>
          </div>
        </div>

        <div className="menu-footer">
          <p>Need help choosing jewellery?</p>

          <button className="menu-whatsapp" onClick={openWhatsApp}>
            <FaWhatsapp />
            Talk to us
          </button>

          <div className="menu-socials">
            <a
              href="https://www.instagram.com/tridevad/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
          </div>
        </div>
      </aside>

      {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
    </>
  );
}

function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cartItems,
  cartTotal,
  updateCartQuantity,
  removeFromCart,
}) {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <aside className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <div>
            <span className="section-kicker">Your Bag</span>
            <h2>Selected Jewellery</h2>
          </div>

          <button
            className="close-cart-drawer"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <FaTimes />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-drawer-empty">
            <FaShoppingBag />
            <h3>Your cart is empty.</h3>
            <p>Add your favourite jewellery pieces and review them here.</p>

            <Link
              to="/collection"
              className="primary-btn"
              onClick={() => setIsCartOpen(false)}
            >
              Shop Collection
              <FaArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {cartItems.map((item) => (
                <div className="cart-drawer-item" key={item.id}>
                  <Link
                    to={`/product/${item.slug}`}
                    className="cart-drawer-image"
                    onClick={() => setIsCartOpen(false)}
                  >
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  </Link>

                  <div className="cart-drawer-info">
                    <span>{item.category}</span>

                    <Link
                      to={`/product/${item.slug}`}
                      onClick={() => setIsCartOpen(false)}
                    >
                      <h3>{item.name}</h3>
                    </Link>

                    <p>{formatPrice(item.price)}</p>

                    <div className="cart-drawer-actions">
                      <div className="quantity-control drawer-quantity">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <FaMinus />
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <button
                        className="drawer-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="drawer-summary-row">
                <span>Total Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="drawer-summary-row total">
                <span>Subtotal</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <p>
                Delivery charges and final availability will be confirmed before
                payment.
              </p>

              <Link
                to="/checkout"
                className="drawer-checkout-btn"
                onClick={() => setIsCartOpen(false)}
              >
                Checkout
                <FaArrowRight />
              </Link>

              <Link
                to="/cart"
                className="drawer-view-cart"
                onClick={() => setIsCartOpen(false)}
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>

      {isCartOpen && (
        <div
          className="cart-drawer-backdrop"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}
    </>
  );
}

function CartToast({ cartToast }) {
  if (!cartToast) return null;

  return (
    <div className="cart-toast">
      <div className="cart-toast-image">
        <img src={getImageUrl(cartToast.image)} alt={cartToast.name} />
      </div>

      <div>
        <span>Added to cart</span>
        <h4>{cartToast.name}</h4>
        <p>Quantity: {cartToast.quantity}</p>
      </div>
    </div>
  );
}

function QuickViewModal({
  product,
  setQuickViewProduct,
  addToCart,
  toggleWishlist,
  isWishlisted,
}) {
  if (!product) return null;

  const slug = getProductSlug(product);
  const isOutOfStock = Number(product.stock ?? 0) <= 0;

  return (
    <div className="quick-view-overlay" onClick={() => setQuickViewProduct(null)}>
      <div className="quick-view-modal" onClick={(event) => event.stopPropagation()}>
        <button
          className="quick-view-close"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
        >
          <FaTimes />
        </button>

        <div className="quick-view-image">
          <img src={getImageUrl(product.image)} alt={product.name} />
        </div>

        <div className="quick-view-info">
          <span className="modal-category">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="quick-view-price">{formatPrice(product.price)}</p>
          <p>{product.description}</p>

          <p className={isOutOfStock ? "stock-badge out" : "stock-badge"}>
            {isOutOfStock
              ? "Out of stock"
              : Number(product.stock ?? 0) <= 3
                ? `Only ${product.stock} left`
                : "In stock"}
          </p>

          <div className="quick-view-points">
            <span>Anti-tarnish inspired</span>
            <span>Lightweight comfort</span>
            <span>Gift-ready style</span>
          </div>

          <div className="quick-view-actions">
            <button
              className={
                isOutOfStock ? "buy-btn-large disabled-cart-btn" : "buy-btn-large"
              }
              onClick={() => {
                addToCart(product, 1);
                if (!isOutOfStock) setQuickViewProduct(null);
              }}
              disabled={isOutOfStock}
            >
              <FaShoppingBag />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              className="outline-wide-btn"
              onClick={() => toggleWishlist(product)}
            >
              {isWishlisted(product.id) ? <FaHeart /> : <FaRegHeart />}
              Wishlist
            </button>
          </div>

          <Link
            to={`/product/${slug}`}
            className="quick-view-full-link"
            onClick={() => setQuickViewProduct(null)}
          >
            View full product details
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

function HomePage({
  productsList,
  openWhatsApp,
  addToCart,
  toggleWishlist,
  isWishlisted,
  setQuickViewProduct,
}) {
  const featuredProducts = productsList.slice(0, 4);

  const bestseller =
    productsList.find((product) =>
      getProductSlug(product).includes("sunburst")
    ) || productsList[0];

  const featured =
    productsList.find((product) =>
      getProductSlug(product).includes("classic-ribbed")
    ) ||
    productsList[1] ||
    productsList[0];

  return (
    <>
      <section className="hero page-animate">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">Anti-tarnish jewellery</span>

            <h1>Jewellery that makes every look feel finished.</h1>

            <p>
              Discover premium-looking, lightweight and skin-friendly jewellery
              made for daily styling, gifting, festive moments and effortless
              confidence.
            </p>

            <div className="hero-buttons">
              <Link to="/collection" className="primary-btn">
                Shop Collection
                <FaArrowRight />
              </Link>

              <Link to="/track" className="secondary-btn">
                Track Order
              </Link>
            </div>

            <div className="trust-row hero-trust-row">
              <div>
                <FaShieldAlt />
                <span>Anti-tarnish inspired</span>
              </div>

              <div>
                <FaGem />
                <span>Premium finish</span>
              </div>

              <div>
                <FaHeart />
                <span>Gift-ready pieces</span>
              </div>
            </div>
          </div>

          <div className="hero-visual premium-hero-visual">
            <div className="hero-main-product">
              <img src={getImageUrl(bestseller?.image)} alt={bestseller?.name} />
            </div>

            <div className="hero-product-card">
              <img src={getImageUrl(featured?.image)} alt={featured?.name} />

              <div>
                <span>Featured piece</span>
                <h3>{featured?.name}</h3>
                <p>{formatPrice(featured?.price)}</p>
              </div>
            </div>

            <div className="hero-mini-badge hero-badge-one">
              <FaStar />
              <span>Best seller shine</span>
            </div>

            <div className="hero-mini-badge hero-badge-two">
              <FaShieldAlt />
              <span>Everyday wear</span>
            </div>
          </div>
        </div>
      </section>

      <section className="category-strip">
        <Link to="/collection?category=Earrings">
          Earrings <FaArrowRight />
        </Link>
        <Link to="/collection?category=Ring">
          Rings <FaArrowRight />
        </Link>
        <Link to="/collection?category=Necklace">
          Necklaces <FaArrowRight />
        </Link>
        <Link to="/collection?category=Pendant">
          Pendants <FaArrowRight />
        </Link>
      </section>

      <section className="collection-intro">
        <div>
          <span className="section-kicker">The Collection</span>
          <h2>Shop the pieces customers choose most.</h2>
        </div>

        <p>
          A focused edit of daily-wear, gifting and statement jewellery. Browse
          by category, quick-view products, save favourites or add directly to
          cart.
        </p>
      </section>

      <section className="container">
        <ProductGrid
          productsList={featuredProducts}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isWishlisted={isWishlisted}
          setQuickViewProduct={setQuickViewProduct}
        />
      </section>

      <section className="customer-attraction-section">
        <div className="attraction-card large">
          <span>Why customers love us</span>
          <h2>Premium look without complicated styling.</h2>
          <p>
            Our pieces are easy to pair, light enough for long wear and polished
            enough to upgrade your everyday outfit instantly.
          </p>
          <Link to="/collection">
            Explore all products
            <FaArrowRight />
          </Link>
        </div>

        <div className="attraction-card image-card">
          <img
            src="/Products/Golden Based Minimal Chain.jpeg"
            alt="Golden chain"
          />
        </div>

        <div className="attraction-card">
          <FaShoppingBag />
          <h3>Add to cart</h3>
          <p>
            Choose products, review your cart and checkout when you are ready.
          </p>
        </div>
      </section>

      <section className="occasion-section">
        <div className="occasion-header">
          <span className="section-kicker">Shop by Occasion</span>
          <h2>Choose jewellery for the moment you are dressing for.</h2>
          <p>
            Customers do not always shop by category. Sometimes they shop by
            mood, outfit, event or gifting need.
          </p>
        </div>

        <div className="occasion-grid">
          <Link to="/collection?category=Earrings" className="occasion-card">
            <span>01</span>
            <h3>Office & Daily Wear</h3>
            <p>Minimal, lightweight pieces that polish your everyday outfit.</p>
            <FaArrowRight />
          </Link>

          <Link to="/collection?category=Ring" className="occasion-card">
            <span>02</span>
            <h3>Party Styling</h3>
            <p>Statement rings and earrings that make your look feel complete.</p>
            <FaArrowRight />
          </Link>

          <Link to="/collection?category=Pendant" className="occasion-card">
            <span>03</span>
            <h3>Gifting</h3>
            <p>Meaningful heart pendants and elegant pieces made for gifting.</p>
            <FaArrowRight />
          </Link>

          <Link to="/collection?category=Necklace" className="occasion-card">
            <span>04</span>
            <h3>Layered Looks</h3>
            <p>Chains that work beautifully alone or with pendants.</p>
            <FaArrowRight />
          </Link>
        </div>
      </section>

      <section className="bestseller-banner">
        <div className="bestseller-image">
          <img src={getImageUrl(bestseller?.image)} alt={bestseller?.name} />
        </div>

        <div className="bestseller-content">
          <span className="section-kicker">Best Seller Energy</span>
          <h2>One piece can change the whole outfit.</h2>
          <p>
            Our statement pieces are selected for customers who want jewellery
            that looks premium, photographs beautifully and adds instant
            confidence.
          </p>

          <div className="bestseller-points">
            <div>
              <strong>01</strong>
              <span>Instant festive glow</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Premium gold-finish look</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Perfect for photos and events</span>
            </div>
          </div>

          <Link to="/collection" className="primary-btn">
            View Statement Pieces
            <FaArrowRight />
          </Link>
        </div>
      </section>

      <section className="promise-section">
        <div className="promise-card">
          <FaShieldAlt />
          <h3>Anti-tarnish inspired</h3>
          <p>Selected to hold shine longer with the right care routine.</p>
        </div>

        <div className="promise-card">
          <FaGem />
          <h3>Premium finish</h3>
          <p>Jewellery that gives a rich look without complicating styling.</p>
        </div>

        <div className="promise-card">
          <FaHeart />
          <h3>Gift-ready feel</h3>
          <p>Elegant pieces suitable for birthdays, occasions and self-love.</p>
        </div>

        <div className="promise-card">
          <FaCreditCard />
          <h3>Checkout ready</h3>
          <p>Add to cart, review your bag and proceed with checkout options.</p>
        </div>
      </section>

      <section className="shine-system">
        <div className="shine-header">
          <span className="section-kicker">The Shine System</span>
          <h2>Build your look in four steps.</h2>
        </div>

        <div className="shine-grid">
          <Link to="/collection?category=Earrings" className="shine-step">
            <span>1 / Earrings</span>
            <h3>Frame the face</h3>
            <p>Hoops and studs that make your outfit look complete instantly.</p>
          </Link>

          <Link to="/collection?category=Necklace" className="shine-step">
            <span>2 / Chains</span>
            <h3>Layer the neckline</h3>
            <p>Minimal chains that work solo or with your favourite pendant.</p>
          </Link>

          <Link to="/collection?category=Ring" className="shine-step">
            <span>3 / Rings</span>
            <h3>Style the hands</h3>
            <p>Soft statement rings for clean, elegant styling.</p>
          </Link>

          <Link to="/collection?category=Pendant" className="shine-step">
            <span>4 / Pendants</span>
            <h3>Add meaning</h3>
            <p>Small symbolic pieces made for emotion, memory and gifting.</p>
          </Link>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <span className="section-kicker">Need help?</span>
          <h2>Not sure what to choose?</h2>
          <p>
            Message us and we will help you pick a product based on your look,
            budget, gifting need or occasion.
          </p>
        </div>

        <button onClick={openWhatsApp}>
          <FaWhatsapp />
          Ask on WhatsApp
        </button>
      </section>
    </>
  );
}

function CollectionPage({
  productsList,
  addToCart,
  toggleWishlist,
  isWishlisted,
  setQuickViewProduct,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  const categories = useMemo(() => {
    const uniqueCategories = productsList.map((product) => product.category);
    return ["All", ...new Set(uniqueCategories)];
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    let result =
      category === "All"
        ? [...productsList]
        : productsList.filter((product) => product.category === category);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((product) => {
        const searchableText = `
          ${product.name}
          ${product.category}
          ${product.description}
          ${product.shortDescription || ""}
          ${product.occasion || ""}
        `.toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (sortBy === "low-high") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [category, productsList, sortBy, searchQuery]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    navigate(cat === "All" ? "/collection" : `/collection?category=${cat}`);
  };

  return (
    <main className="page-shell page-animate">
      <section className="page-hero">
        <span className="section-kicker">Shop Collection</span>
        <h1>Find your everyday shine.</h1>
        <p>
          Search by product name, occasion, category or style. Click any product
          to open the full product page and add it to cart.
        </p>
      </section>

      <section className="collection-control-panel">
        <div className="collection-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search earrings, rings, gifting, office wear..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="collection-sort-box">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </section>

      <section className="shop-toolbar">
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "filter-btn active" : "filter-btn"}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="container collection-page-container">
        {filteredProducts.length > 0 ? (
          <ProductGrid
            productsList={filteredProducts}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            isWishlisted={isWishlisted}
            setQuickViewProduct={setQuickViewProduct}
          />
        ) : (
          <div className="collection-empty-state">
            <FaSearch />
            <h2>No products found.</h2>
            <p>
              Try searching with another keyword or choose a different category.
            </p>

            <button
              className="primary-btn"
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("All");
              }}
            >
              Reset Filters
              <FaArrowRight />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ProductGrid({
  productsList,
  addToCart,
  toggleWishlist,
  isWishlisted,
  setQuickViewProduct,
}) {
  return (
    <div className="product-grid">
      {productsList.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isWishlisted={isWishlisted}
          setQuickViewProduct={setQuickViewProduct}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  index,
  addToCart,
  toggleWishlist,
  isWishlisted,
  setQuickViewProduct,
}) {
  const slug = getProductSlug(product);
  const wishlisted = isWishlisted ? isWishlisted(product.id) : false;
  const isOutOfStock = Number(product.stock ?? 0) <= 0;

  return (
    <article
      className="product-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="product-floating-actions">
        <button
          className={wishlisted ? "wishlist-icon-btn active" : "wishlist-icon-btn"}
          onClick={() => toggleWishlist(product)}
          aria-label="Add to wishlist"
        >
          {wishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>

        <button
          className="wishlist-icon-btn"
          onClick={() => setQuickViewProduct(product)}
          aria-label="Quick view"
        >
          <FaEye />
        </button>
      </div>

      <Link to={`/product/${slug}`} className="product-card-link">
        <div className="image-container">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src =
                "https://via.placeholder.com/600x750?text=Product+Image";
            }}
          />

          <div className="quick-view-pill">
            View Product
            <FaArrowRight />
          </div>
        </div>

        <div className="card-content">
          <div className="product-meta">
            <span className="category-tag">{product.category}</span>
            <span className="price">{formatPrice(product.price)}</span>
          </div>

          <h3>{product.name}</h3>

          <p className={isOutOfStock ? "stock-badge out" : "stock-badge"}>
            {isOutOfStock
              ? "Out of stock"
              : Number(product.stock ?? 0) <= 3
                ? `Only ${product.stock} left`
                : "In stock"}
          </p>

          <p className="desc">{product.description}</p>

          <div className="product-card-footer">
            <span>Anti-tarnish</span>
            <span>Skin-friendly</span>
          </div>
        </div>
      </Link>

      <div className="quick-add-wrap">
        <button
          className={
            isOutOfStock ? "quick-add-btn disabled-cart-btn" : "quick-add-btn"
          }
          onClick={() => addToCart(product, 1)}
          disabled={isOutOfStock}
        >
          <FaShoppingBag />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

function ProductPage({
  productsList,
  addToCart,
  toggleWishlist,
  isWishlisted,
  setQuickViewProduct,
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");

  const product = productsList.find((item) => getProductSlug(item) === slug);

  if (!product) {
    return <NotFoundPage />;
  }

  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = Number(product.stock ?? 0) <= 0;

  const relatedProducts = productsList
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      setAddedMessage("This product is currently out of stock.");
      setTimeout(() => setAddedMessage(""), 1800);
      return;
    }

    addToCart(product, quantity);
    setAddedMessage("Added to cart successfully.");
    setTimeout(() => setAddedMessage(""), 1800);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      setAddedMessage("This product is currently out of stock.");
      setTimeout(() => setAddedMessage(""), 1800);
      return;
    }

    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <main className="product-page page-animate">
      <section className="product-detail-layout">
        <div className="product-gallery">
          <div className="main-product-image">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src =
                  "https://via.placeholder.com/700x850?text=Product+Image";
              }}
            />
          </div>

          <div className="mini-product-strip">
            <div>
              <FaShieldAlt />
              <span>Anti-tarnish</span>
            </div>

            <div>
              <FaLeaf />
              <span>Skin-friendly</span>
            </div>

            <div>
              <FaGem />
              <span>Premium shine</span>
            </div>
          </div>
        </div>

        <div className="product-info-panel">
          <Link to="/collection" className="back-link">
            ← Back to collection
          </Link>

          <span className="modal-category">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="rating-row">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <span>Customer favourite</span>
          </div>

          <p className="product-page-price">{formatPrice(product.price)}</p>

          <p className={isOutOfStock ? "stock-badge out" : "stock-badge"}>
            {isOutOfStock
              ? "Out of stock"
              : Number(product.stock ?? 0) <= 3
                ? `Only ${product.stock} left`
                : `In stock - ${product.stock} available`}
          </p>

          <p className="product-long-description">{product.description}</p>

          {product.shortDescription && (
            <p className="product-short-description">{product.shortDescription}</p>
          )}

          <div className="quantity-box">
            <span>
              Quantity{" "}
              {isOutOfStock
                ? "(Out of stock)"
                : `(Available: ${Number(product.stock ?? 0)})`}
            </span>

            <div className="quantity-control">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={isOutOfStock}
              >
                <FaMinus />
              </button>

              <strong>{quantity}</strong>

              <button
                onClick={() =>
                  setQuantity((prev) =>
                    Math.min(Number(product.stock ?? 1), prev + 1)
                  )
                }
                disabled={isOutOfStock}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="product-highlight-box">
            <h3>Why you will love it</h3>

            <ul>
              {(product.benefits || [
                "Anti-tarnish inspired finish for longer-lasting shine.",
                "Lightweight feel for everyday comfort.",
                "Easy to pair with ethnic, western and office outfits.",
                "Beautiful gifting choice for birthdays and special occasions.",
              ]).map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          {addedMessage && <p className="cart-success-message">{addedMessage}</p>}

          <div className="product-cta-row two-buttons">
            <button
              className={
                isOutOfStock ? "buy-btn-large disabled-cart-btn" : "buy-btn-large"
              }
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <FaShoppingBag />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              className={
                isOutOfStock
                  ? "outline-wide-btn solid-checkout disabled-cart-btn"
                  : "outline-wide-btn solid-checkout"
              }
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Unavailable" : "Buy Now"}
              <FaArrowRight />
            </button>
          </div>

          <button
            className="wishlist-wide-btn"
            onClick={() => toggleWishlist(product)}
          >
            {wishlisted ? <FaHeart /> : <FaRegHeart />}
            {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
          </button>

          <div className="product-accordion">
            <details open>
              <summary>Product Details</summary>
              <p>
                Category: {product.category}.{" "}
                {product.materialNote || "Gold-inspired premium polish."} Best
                for: {product.occasion || "daily styling, gifting and occasion wear"}.
              </p>
            </details>

            <details>
              <summary>Care Instructions</summary>
              {product.care ? (
                <ul className="care-list">
                  {product.care.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  Keep away from perfume, water and harsh chemicals. Store in a
                  dry pouch after use to maintain shine.
                </p>
              )}
            </details>

            <details>
              <summary>Checkout Options</summary>
              <p>
                Add this product to cart and checkout. Your order will be created
                with an Order ID. You can track it using your phone number.
              </p>
            </details>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-section">
          <div className="related-header">
            <span className="section-kicker">You may also like</span>
            <h2>More from {product.category}</h2>
          </div>

          <ProductGrid
            productsList={relatedProducts}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            isWishlisted={isWishlisted}
            setQuickViewProduct={setQuickViewProduct}
          />
        </section>
      )}
    </main>
  );
}

function WishlistPage({
  wishlistItems,
  addToCart,
  toggleWishlist,
  setQuickViewProduct,
}) {
  return (
    <main className="page-shell page-animate">
      <section className="page-hero">
        <span className="section-kicker">Wishlist</span>
        <h1>Your saved favourites.</h1>
        <p>
          Keep products here while deciding. Add them to cart when you are ready
          to checkout.
        </p>
      </section>

      <section className="container">
        {wishlistItems.length === 0 ? (
          <div className="collection-empty-state">
            <FaRegHeart />
            <h2>No wishlist items yet.</h2>
            <p>Save products you like and come back to them anytime.</p>

            <Link to="/collection" className="primary-btn">
              Explore Collection
              <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => {
              const isOutOfStock = Number(product.stock ?? 0) <= 0;

              return (
                <div className="wishlist-card" key={product.id}>
                  <Link to={`/product/${product.slug}`} className="wishlist-image">
                    <img src={getImageUrl(product.image)} alt={product.name} />
                  </Link>

                  <div className="wishlist-info">
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{formatPrice(product.price)}</p>

                    <div className="wishlist-actions">
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={isOutOfStock}
                      >
                        <FaShoppingBag />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <button onClick={() => setQuickViewProduct(product)}>
                        <FaEye />
                        Quick View
                      </button>

                      <button onClick={() => toggleWishlist(product)}>
                        <FaTrash />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function CartPage({
  cartItems,
  cartTotal,
  updateCartQuantity,
  removeFromCart,
}) {
  return (
    <main className="page-shell page-animate">
      <section className="page-hero cart-page-hero">
        <span className="section-kicker">Your Cart</span>
        <h1>Review your selected shine.</h1>
        <p>
          Check your selected jewellery pieces, update quantity and continue to
          checkout when ready.
        </p>
      </section>

      {cartItems.length === 0 ? (
        <section className="empty-cart-section">
          <FaShoppingBag />
          <h2>Your cart is empty.</h2>
          <p>Explore the collection and add your favourite jewellery pieces.</p>
          <Link to="/collection" className="primary-btn">
            Shop Collection
            <FaArrowRight />
          </Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div className="cart-item-card" key={item.id}>
                <Link to={`/product/${item.slug}`} className="cart-item-image">
                  <img src={getImageUrl(item.image)} alt={item.name} />
                </Link>

                <div className="cart-item-info">
                  <span>{item.category}</span>

                  <Link to={`/product/${item.slug}`}>
                    <h3>{item.name}</h3>
                  </Link>

                  <p>{formatPrice(item.price)}</p>
                  <small>Available stock: {item.stock ?? "N/A"}</small>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <FaMinus />
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    className="remove-cart-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>

                <strong className="cart-line-total">
                  {formatPrice(item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
        </section>
      )}
    </main>
  );
}

function OrderSummary({ cartItems, cartTotal }) {
  return (
    <aside className="order-summary">
      <span className="section-kicker">Order Summary</span>

      <div className="summary-row">
        <span>Items</span>
        <strong>{cartItems.reduce((total, item) => total + item.quantity, 0)}</strong>
      </div>

      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{formatPrice(cartTotal)}</strong>
      </div>

      <div className="summary-row">
        <span>Delivery</span>
        <strong>Confirmed later</strong>
      </div>

      <div className="summary-total">
        <span>Total</span>
        <strong>{formatPrice(cartTotal)}</strong>
      </div>

      <p>Final delivery charge and availability will be confirmed before payment.</p>

      <Link to="/checkout" className="checkout-btn">
        Proceed to Checkout
        <FaArrowRight />
      </Link>

      <Link to="/collection" className="continue-shopping-link">
        Continue shopping
      </Link>
    </aside>
  );
}

function CheckoutPage({ cartItems, cartTotal, clearCart }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });

  const [paymentOption, setPaymentOption] = useState("whatsapp");
  const [error, setError] = useState("");

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const saveOrderToBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
          },
          items: cartItems,
          subtotal: cartTotal,
          paymentMethod: "whatsapp",
          note: formData.note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save order.");
      }

      return {
        success: true,
        order: data.order,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const buildWhatsAppMessage = (orderNumber) => {
    const productLines = cartItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\n` +
          `Category: ${item.category}\n` +
          `Quantity: ${item.quantity}\n` +
          `Price: ${formatPrice(item.price)}\n` +
          `Item Total: ${formatPrice(item.price * item.quantity)}`
      )
      .join("\n\n");

    return (
      `Hello ${BRAND_NAME}, I want to confirm my order.\n\n` +
      `Order ID: ${orderNumber || "Generated"}\n\n` +
      `Customer Details:\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `City: ${formData.city}\n` +
      `Address: ${formData.address}\n` +
      `Note: ${formData.note || "No note"}\n\n` +
      `Order Details:\n${productLines}\n\n` +
      `Total Items: ${totalItems}\n` +
      `Subtotal: ${formatPrice(cartTotal)}\n\n` +
      `Please confirm availability, delivery charges and payment details.`
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add products before checkout.");
      return;
    }

    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      setError("Please fill name, phone, city and address.");
      return;
    }

    if (paymentOption === "online") {
      setError(
        "Online payment gateway is coming soon. For now, please confirm your order through WhatsApp."
      );
      return;
    }

    setError("");

    const orderSaveResult = await saveOrderToBackend();

    if (!orderSaveResult.success) {
      setError(orderSaveResult.message);
      return;
    }

    const savedOrder = orderSaveResult.order;

    window.open(
      createWhatsAppLink(buildWhatsAppMessage(savedOrder?.orderNumber)),
      "_blank"
    );

    navigate("/order-success", {
      state: {
        method: "WhatsApp Confirmation",
        customer: formData.name,
        phone: formData.phone,
        total: cartTotal,
        items: totalItems,
        orderNumber: savedOrder?.orderNumber,
      },
    });

    clearCart();
  };

  if (cartItems.length === 0) {
    return (
      <main className="page-shell page-animate">
        <section className="empty-cart-section checkout-empty">
          <FaShoppingBag />
          <h2>No products in checkout.</h2>
          <p>Add products to cart before proceeding to checkout.</p>
          <Link to="/collection" className="primary-btn">
            Shop Collection
            <FaArrowRight />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell page-animate">
      <section className="page-hero checkout-hero">
        <span className="section-kicker">Checkout</span>
        <h1>Complete your order details.</h1>
        <p>
          Add customer details and confirm your order through WhatsApp. You will
          receive an Order ID to track your order.
        </p>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-form-header">
            <FaLock />
            <div>
              <h2>Customer Information</h2>
              <p>Your details will be used only for order confirmation.</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Full Name *
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </label>

            <label>
              Phone Number *
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              City *
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
              />
            </label>

            <label className="full-field">
              Address *
              <textarea
                name="address"
                placeholder="Enter complete delivery address"
                value={formData.address}
                onChange={handleChange}
              />
            </label>

            <label className="full-field">
              Order Note
              <textarea
                name="note"
                placeholder="Gift packing, preferred delivery time, or any special request"
                value={formData.note}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="payment-options">
            <h3>Order Confirmation Option</h3>

            <label
              className={
                paymentOption === "whatsapp"
                  ? "payment-option-card selected-payment"
                  : "payment-option-card"
              }
            >
              <input
                type="radio"
                name="payment"
                value="whatsapp"
                checked={paymentOption === "whatsapp"}
                onChange={() => setPaymentOption("whatsapp")}
              />
              <FaWhatsapp />
              <div>
                <strong>Confirm on WhatsApp</strong>
                <span>
                  Your order will be saved, and your cart details will be sent
                  to WhatsApp for final confirmation.
                </span>
              </div>
            </label>

            <label
              className={
                paymentOption === "online"
                  ? "payment-option-card selected-payment disabled-option"
                  : "payment-option-card disabled-option"
              }
            >
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentOption === "online"}
                onChange={() => setPaymentOption("online")}
              />
              <FaCreditCard />
              <div>
                <strong>Online Payment Gateway</strong>
                <span>
                  Coming soon. For now, orders are confirmed through WhatsApp.
                </span>
              </div>
            </label>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button className="place-order-btn" type="submit">
            {paymentOption === "whatsapp" && (
              <>
                <FaWhatsapp />
                Place Order & Confirm on WhatsApp
              </>
            )}

            {paymentOption === "online" && (
              <>
                <FaCreditCard />
                Continue to Payment
              </>
            )}
          </button>
        </form>

        <aside className="checkout-summary">
          <span className="section-kicker">Your Order</span>

          <div className="checkout-items">
            {cartItems.map((item) => (
              <div className="checkout-item" key={item.id}>
                <img src={getImageUrl(item.image)} alt={item.name} />

                <div>
                  <h4>{item.name}</h4>
                  <p>
                    Qty {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>

                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-total checkout-total">
            <span>Subtotal</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <p className="checkout-note">
            After placing the order, you will receive an Order ID to track your
            order status.
          </p>

          <button className="clear-cart-btn" type="button" onClick={clearCart}>
            Clear Cart
          </button>

          <button
            className="clear-cart-btn"
            type="button"
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </button>
        </aside>
      </section>
    </main>
  );
}

function OrderSuccessPage() {
  const location = useLocation();

  const orderData = location.state || {
    method: "Order Request",
    customer: "Customer",
    phone: "",
    total: 0,
    items: 0,
    orderNumber: "",
  };

  return (
    <main className="page-shell page-animate">
      <section className="order-success-section">
        <div className="success-icon-wrap">
          <FaShoppingBag />
        </div>

        <span className="section-kicker">Order Request Sent</span>

        <h1>Thank you, {orderData.customer}.</h1>

        <p>
          Your order request has been created through{" "}
          <strong>{orderData.method}</strong>. Our team will confirm product
          availability, delivery charges and final payment details.
        </p>

        {orderData.orderNumber && (
          <div className="order-id-box">
            <span>Your Order ID</span>
            <strong>{orderData.orderNumber}</strong>
            <p>
              Save this Order ID. You can track your order using this ID and
              your phone number.
            </p>
          </div>
        )}

        <div className="success-summary">
          <div>
            <span>Total Items</span>
            <strong>{orderData.items}</strong>
          </div>

          <div>
            <span>Order Value</span>
            <strong>{formatPrice(orderData.total)}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>Pending Confirmation</strong>
          </div>
        </div>

        <div className="success-actions">
          <Link
            to={`/track?orderNumber=${orderData.orderNumber || ""}&phone=${orderData.phone || ""
              }`}
            className="primary-btn"
          >
            Track Order
            <FaArrowRight />
          </Link>

          <Link to="/collection" className="secondary-btn">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

function TrackOrderPage() {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    orderNumber: searchParams.get("orderNumber") || "",
    phone: searchParams.get("phone") || "",
  });

  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  const statusSteps = [
    {
      key: "pending_confirmation",
      label: "Pending Confirmation",
      description: "Your order request has been received.",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      description: "Your order has been confirmed by the team.",
    },
    {
      key: "packed",
      label: "Packed",
      description: "Your jewellery is packed and ready.",
    },
    {
      key: "shipped",
      label: "Shipped",
      description: "Your order has been handed over for delivery.",
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Your order has been delivered.",
    },
  ];

  const getCurrentStepIndex = (status) => {
    if (status === "cancelled") return -1;

    const index = statusSteps.findIndex((step) => step.key === status);
    return index === -1 ? 0 : index;
  };

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleTrackOrder = async (event) => {
    event.preventDefault();

    if (!formData.orderNumber || !formData.phone) {
      setTrackingError("Please enter Order ID and phone number.");
      return;
    }

    try {
      setTrackingLoading(true);
      setTrackingError("");
      setTrackingOrder(null);

      const response = await fetch(
        `${API_BASE_URL}/api/orders/track?orderNumber=${encodeURIComponent(
          formData.orderNumber
        )}&phone=${encodeURIComponent(formData.phone)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order not found.");
      }

      setTrackingOrder(data.order);
    } catch (error) {
      setTrackingError(error.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (formData.orderNumber && formData.phone) {
      handleTrackOrder({ preventDefault: () => { } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStepIndex = getCurrentStepIndex(trackingOrder?.orderStatus);

  return (
    <main className="page-shell page-animate">
      <section className="page-hero">
        <span className="section-kicker">Track Order</span>
        <h1>Track your jewellery order.</h1>
        <p>
          Enter your Order ID and phone number to check the latest order status.
        </p>
      </section>

      <section className="track-order-section">
        <form className="track-order-form" onSubmit={handleTrackOrder}>
          <label>
            Order ID
            <input
              type="text"
              name="orderNumber"
              placeholder="Example: TADS-1712345678901"
              value={formData.orderNumber}
              onChange={handleChange}
            />
          </label>

          <label>
            Phone Number
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number used in order"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>

          <button type="submit">
            {trackingLoading ? "Checking..." : "Track Order"}
            <FaArrowRight />
          </button>
        </form>

        {trackingError && <p className="tracking-error">{trackingError}</p>}

        {trackingOrder && (
          <div className="tracking-result-card">
            <div className="tracking-result-header">
              <div>
                <span>Order ID</span>
                <h2>{trackingOrder.orderNumber}</h2>
                <p>
                  Customer: {trackingOrder.customer?.name} | Phone:{" "}
                  {trackingOrder.customer?.phone}
                </p>
              </div>

              <strong>
                {trackingOrder.orderStatus === "cancelled"
                  ? "Cancelled"
                  : trackingOrder.orderStatus?.replaceAll("_", " ")}
              </strong>
            </div>

            {trackingOrder.orderStatus === "cancelled" ? (
              <div className="cancelled-order-box">
                <h3>Order Cancelled</h3>
                <p>
                  This order has been cancelled. Please contact support if you
                  need more details.
                </p>
              </div>
            ) : (
              <div className="order-tracker-timeline">
                {statusSteps.map((step, index) => (
                  <div
                    className={
                      index <= currentStepIndex
                        ? "tracker-step active"
                        : "tracker-step"
                    }
                    key={step.key}
                  >
                    <div className="tracker-dot">{index + 1}</div>

                    <div>
                      <h3>{step.label}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="tracking-order-items">
              <h3>Ordered Products</h3>

              {trackingOrder.items?.map((item) => (
                <div className="tracking-order-item" key={item.id}>
                  <img src={getImageUrl(item.image)} alt={item.name} />

                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      Qty {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>

                  <p>{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="tracking-total-row">
              <span>Total</span>
              <strong>{formatPrice(trackingOrder.subtotal)}</strong>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page-shell page-animate">
      <section className="page-hero">
        <span className="section-kicker">Our Story</span>
        <h1>Jewellery made for daily confidence.</h1>
        <p>
          Tridev A&D Shine is built around a simple idea: jewellery should feel
          beautiful, wearable and meaningful without being difficult to maintain.
        </p>
      </section>

      <section className="about-split">
        <div>
          <img src="/Products/LOGO.jpeg" alt="Tridev A&D Shine" />
        </div>

        <div>
          <span className="section-kicker">Brand Philosophy</span>
          <h2>Timeless. Effortless. Always shining.</h2>
          <p>
            Inspired by purity, beauty and everyday elegance, our collection is
            made for people who want jewellery that supports their personal
            style.
          </p>

          <div className="about-stat-grid">
            <div>
              <strong>01</strong>
              <span>Anti-tarnish inspired shine</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Lightweight daily comfort</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Customer-first ordering</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CustomerCarePage({ openWhatsApp }) {
  return (
    <main className="page-shell page-animate">
      <section className="page-hero">
        <span className="section-kicker">Customer Care</span>
        <h1>We help you choose before you buy.</h1>
        <p>
          Ask us about product availability, styling suggestions, gifting,
          delivery, packaging and care.
        </p>
      </section>

      <section className="care-grid">
        <div className="care-card">
          <FaWhatsapp />
          <h3>WhatsApp Support</h3>
          <p>
            Ask product questions, confirm availability and get help before
            placing your order.
          </p>
          <button onClick={openWhatsApp}>Message Us</button>
        </div>

        <div className="care-card">
          <FaShoppingBag />
          <h3>Cart Checkout</h3>
          <p>
            Add multiple products to cart, review your order and proceed to
            checkout.
          </p>
        </div>

        <div className="care-card">
          <FaTruck />
          <h3>Track Order</h3>
          <p>
            Use your Order ID and phone number to check the latest order status.
          </p>
        </div>
      </section>
    </main>
  );
}

function PolicyLayout({ label, title, intro, sections }) {
  return (
    <main className="page-shell page-animate">
      <section className="page-hero policy-hero">
        <span className="section-kicker">{label}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>

      <section className="policy-page-section">
        {sections.map((section) => (
          <article className="policy-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function ShippingPage() {
  return (
    <PolicyLayout
      label="Shipping"
      title="Shipping Information"
      intro="Everything customers should know before placing an order with Tridev A&D Shine."
      sections={[
        {
          title: "Order Confirmation",
          content:
            "Orders are currently confirmed through WhatsApp. Product availability, delivery charges and final payment details are confirmed before the order is processed.",
        },
        {
          title: "Delivery Timeline",
          content:
            "Delivery timeline depends on customer location, product availability and courier service. The final estimated delivery time will be shared after order confirmation.",
        },
        {
          title: "Order Tracking",
          content:
            "Once an order is placed, customers receive an Order ID. They can track order status using the Order ID and phone number.",
        },
      ]}
    />
  );
}

function ReturnsPage() {
  return (
    <PolicyLayout
      label="Returns"
      title="Returns & Exchange"
      intro="Our return and exchange policy is designed to keep the buying experience clear and transparent."
      sections={[
        {
          title: "Eligibility",
          content:
            "Returns or exchanges may be considered only for damaged, incorrect or defective products reported soon after delivery with clear photos and order details.",
        },
        {
          title: "Non-returnable Cases",
          content:
            "Used products, damaged packaging after use, or items exposed to water, perfume, sweat or chemicals may not be eligible for return or exchange.",
        },
        {
          title: "How to Raise a Request",
          content:
            "Customers can contact support through WhatsApp with product photos, order details and issue description.",
        },
      ]}
    />
  );
}

function PrivacyPage() {
  return (
    <PolicyLayout
      label="Privacy"
      title="Privacy Policy"
      intro="This page explains how customer information is handled on the website."
      sections={[
        {
          title: "Information We Collect",
          content:
            "During checkout, customers may provide name, phone number, city, address and order note. This information is used only for order confirmation and delivery support.",
        },
        {
          title: "How We Use Information",
          content:
            "Customer details are used to confirm product availability, delivery location, payment details and order communication.",
        },
        {
          title: "Third-party Services",
          content:
            "WhatsApp may be used for order confirmation. Payment gateway integration may be added later.",
        },
      ]}
    />
  );
}

function TermsPage() {
  return (
    <PolicyLayout
      label="Terms"
      title="Terms & Conditions"
      intro="Please read these terms before using the website or placing an order."
      sections={[
        {
          title: "Product Information",
          content:
            "Product images, prices and descriptions are provided for customer convenience. Slight differences in color or shine may occur due to lighting, screen settings or photography.",
        },
        {
          title: "Order Acceptance",
          content:
            "Submitting an order request does not automatically confirm the order. Final confirmation depends on product availability, delivery feasibility and payment confirmation.",
        },
        {
          title: "Website Usage",
          content:
            "Customers should use the website for lawful shopping and inquiry purposes only.",
        },
      ]}
    />
  );
}

function RefundPage() {
  return (
    <PolicyLayout
      label="Refund"
      title="Refund Policy"
      intro="Refunds are handled carefully after reviewing the order case."
      sections={[
        {
          title: "Refund Eligibility",
          content:
            "Refunds may be considered if the order cannot be fulfilled, payment was received for an unavailable product, or a valid return case is approved.",
        },
        {
          title: "Refund Timeline",
          content:
            "Refund timeline depends on the payment method and payment provider. Once processed, customers will be informed through the available contact channel.",
        },
        {
          title: "Manual Review",
          content:
            "Every refund request is reviewed manually to confirm order details, product condition and payment status.",
        },
      ]}
    />
  );
}

function NotFoundPage() {
  return (
    <main className="page-shell page-animate">
      <section className="page-hero">
        <span className="section-kicker">404</span>
        <h1>Page not found.</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="primary-btn">
          Go Home
          <FaArrowRight />
        </Link>
      </section>
    </main>
  );
}

function Footer({ openWhatsApp }) {
  return (
    <footer className="footer">
      <div className="footer-top-band">
        <div>
          <span>Anti-tarnish jewellery</span>
          <strong>Everyday shine, gift-ready elegance.</strong>
        </div>

        <Link to="/collection">
          Shop the Collection
          <FaArrowRight />
        </Link>
      </div>

      <div className="footer-content">
        <div className="footer-section footer-brand-section">
          <Link to="/" className="footer-logo-block">
            <img src="/Products/LOGO.jpeg" alt="Tridev A&D Shine Logo" />

            <div>
              <h3>Tridev A&D Shine</h3>
              <p>Everyday anti-tarnish jewellery.</p>
            </div>
          </Link>

          <p className="brand-desc">
            Premium-looking, lightweight and gift-ready jewellery created for
            daily styling, festive moments and effortless elegance.
          </p>

          <div className="footer-socials">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>

            <a href="mailto:tridevad54@gmail.com">
              <FaEnvelope />
            </a>

            <button type="button" onClick={openWhatsApp}>
              <FaWhatsapp />
            </button>
          </div>
        </div>

        <div className="footer-section">
          <h4>
            <Link to="/collection">Shop</Link>
          </h4>
          <ul>
            <li>
              <Link to="/collection">All Jewellery</Link>
            </li>
            <li>
              <Link to="/collection?category=Earrings">Earrings</Link>
            </li>
            <li>
              <Link to="/collection?category=Ring">Rings</Link>
            </li>
            <li>
              <Link to="/collection?category=Necklace">Necklace</Link>
            </li>
            <li>
              <Link to="/collection?category=Pendant">Pendants</Link>
            </li>
            <li>
              <Link to="/wishlist">Wishlist</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>
            <Link to="/care">Customer Support</Link>
          </h4>
          <ul>
            <li>
              <Link to="/cart">View Cart</Link>
            </li>
            <li>
              <Link to="/checkout">Checkout</Link>
            </li>
            <li>
              <Link to="/track">Track Order</Link>
            </li>
            <li>
              <Link to="/care">Customer Care</Link>
            </li>
            <li>
              <button type="button" onClick={openWhatsApp}>
                WhatsApp Order Help
              </button>
            </li>
            <li>
              <Link to="/shipping">Shipping Information</Link>
            </li>
            <li>
              <Link to="/returns">Returns & Exchange</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>

          <div className="footer-contact-list">
            <a href="mailto:tridevad54@gmail.com">
              <FaEnvelope />
              <span>tridevad54@gmail.com</span>
            </a>

            <button type="button" onClick={openWhatsApp}>
              <FaPhoneAlt />
              <span>WhatsApp Support</span>
            </button>

            <div>
              <FaMapMarkerAlt />
              <span>India-based jewellery brand</span>
            </div>
          </div>

          <div className="footer-newsletter">
            <h5>Get collection updates</h5>
            <p>New arrivals, styling drops and festive jewellery edits.</p>

            <div className="footer-newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email for newsletter"
              />

              <button type="button">Join</button>
            </div>

            <small>Newsletter signup UI only for now.</small>
          </div>
        </div>
      </div>

      <div className="footer-trust-row">
        <div>
          <FaShieldAlt />
          <span>Anti-tarnish inspired finish</span>
        </div>

        <div>
          <FaTruck />
          <span>Delivery confirmation before payment</span>
        </div>

        <div>
          <FaCreditCard />
          <span>Payment gateway coming soon</span>
        </div>

        <div>
          <FaHeart />
          <span>Gift-ready everyday jewellery</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Tridev A&D Shine. All rights reserved.</p>

        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refund">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default App;