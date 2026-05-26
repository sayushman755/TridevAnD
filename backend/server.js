const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "tridev-admin-123";

const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

const ensureDataFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts(), null, 2));
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
};

const readJsonFile = (filePath, fallback = []) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error(`Failed to read ${filePath}`, error);
    return fallback;
  }
};

const writeJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const createSlug = (name) =>
  String(name || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const createId = () => Date.now() + Math.floor(Math.random() * 10000);

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized admin request.",
    });
  }

  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    cb(null, UPLOADS_DIR);
  },

  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");

    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function seedProducts() {
  return [
    {
      id: 1,
      slug: "classic-ribbed-hoop-earrings",
      name: "Classic Ribbed Hoop Earrings",
      category: "Earrings",
      price: 588,
      image: "/Products/Classic Ribbed Hoop Earrings.jpeg",
      description:
        "A bold pair of ribbed gold-finish hoops designed to instantly elevate your everyday look with premium shine and lightweight comfort.",
      shortDescription:
        "Statement ribbed hoops for daily styling, office looks, parties and festive outfits.",
      stock: 15,
      isFeatured: true,
      status: "active",
    },
    {
      id: 2,
      slug: "golden-based-minimal-chain",
      name: "Golden Based Minimal Chain",
      category: "Necklace",
      price: 677,
      image: "/Products/Golden Based Minimal Chain.jpeg",
      description:
        "A delicate gold-finish chain with minimal detailing, created for customers who love subtle shine and effortless everyday elegance.",
      shortDescription:
        "Minimal gold chain for layering, pendant styling or wearing solo.",
      stock: 12,
      isFeatured: true,
      status: "active",
    },
    {
      id: 3,
      slug: "golden-heart-mini-pendant",
      name: "Golden Heart Mini Pendant",
      category: "Pendant",
      price: 350,
      image: "/Products/Golden Heart Mini Pedant.jpeg",
      description:
        "A glossy mini heart pendant designed as a meaningful everyday piece for self-love, gifting and soft romantic styling.",
      shortDescription:
        "Mini heart pendant with a simple emotional design and polished gold finish.",
      stock: 20,
      isFeatured: true,
      status: "active",
    },
    {
      id: 4,
      slug: "golden-spiral-stud-earring",
      name: "Golden Spiral Stud Earring",
      category: "Earrings",
      price: 455,
      image: "/Products/Golden Spiral Stud Earring.jpeg",
      description:
        "Modern spiral-shaped gold studs made for customers who want an elegant, lightweight and easy-to-wear earring for daily shine.",
      shortDescription:
        "Chic spiral studs for minimal everyday elegance and modern styling.",
      stock: 18,
      isFeatured: true,
      status: "active",
    },
    {
      id: 5,
      slug: "royale-twist-gold-ring",
      name: "Royale Twist Gold Ring",
      category: "Ring",
      price: 455,
      image: "/Products/Royale Twist Gold Ring.jpeg",
      description:
        "A textured twist-style gold ring designed to bring a royal, timeless and statement finish to your hands.",
      shortDescription:
        "Textured twist gold ring with classic rope-inspired detailing.",
      stock: 16,
      isFeatured: false,
      status: "active",
    },
    {
      id: 6,
      slug: "amora-heart-gold-ring",
      name: "Amora Heart Gold Ring",
      category: "Ring",
      price: 455,
      image: "/Products/Amora Heart Gold Ring.jpeg",
      description:
        "A romantic heart-inspired gold ring made for customers who love soft, meaningful and gift-worthy jewellery.",
      shortDescription:
        "Heart gold ring with a romantic design and glossy everyday finish.",
      stock: 14,
      isFeatured: false,
      status: "active",
    },
    {
      id: 7,
      slug: "elan-screw-gold-ring",
      name: "Elan Screw Gold Ring",
      category: "Ring",
      price: 455,
      image: "/Products/Elan Screw Gold Ring.jpeg",
      description:
        "A bold screw-design gold ring crafted for customers who prefer modern, confident and slightly edgy statement jewellery.",
      shortDescription:
        "Modern screw-motif gold ring for bold and polished styling.",
      stock: 10,
      isFeatured: false,
      status: "active",
    },
    {
      id: 8,
      slug: "aurora-slim-gold-chain",
      name: "Aurora Slim Gold Chain",
      category: "Necklace",
      price: 455,
      image: "/Products/Aurora Slim Gold Chain.jpeg",
      description:
        "A slim gold-finish chain designed for soft everyday glow, easy layering and timeless minimal styling.",
      shortDescription:
        "Slim gold chain for customers who love clean, lightweight and versatile jewellery.",
      stock: 19,
      isFeatured: false,
      status: "active",
    },
    {
      id: 9,
      slug: "sunburst-statement-earring",
      name: "Sunburst Statement Earring",
      category: "Earrings",
      price: 599,
      image: "/Products/Sunburst Statement Earring.jpeg",
      description:
        "A radiant statement earring inspired by sunburst detailing, made to bring attention, glow and occasion-ready elegance.",
      shortDescription:
        "Bold sunburst earrings for festive, party and statement styling.",
      stock: 9,
      isFeatured: false,
      status: "active",
    },
  ];
}

ensureDataFiles();

app.get("/", (req, res) => {
  res.json({
    message: "Tridev A&D Shine backend is running.",
    status: "healthy",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    api_status: "healthy",
    storage: "json-file",
    upload_support: true,
    timestamp: new Date().toISOString(),
  });
});

/* ================= IMAGE UPLOAD - ADMIN ================= */

app.post(
  "/api/admin/upload",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      imageUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename,
    });
  }
);

/* ================= PRODUCTS - PUBLIC ================= */

app.get("/api/products", (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);

  const activeProducts = products.filter(
    (product) => product.status !== "inactive"
  );

  res.json(activeProducts);
});

app.get("/api/products/:slug", (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);

  const product = products.find(
    (item) => item.slug === req.params.slug && item.status !== "inactive"
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  res.json(product);
});

/* ================= PRODUCTS - ADMIN ================= */

app.get("/api/admin/products", requireAdmin, (req, res) => {
  res.json(readJsonFile(PRODUCTS_FILE));
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);

  const {
    name,
    category,
    price,
    image,
    description,
    shortDescription,
    stock,
    isFeatured,
    status,
  } = req.body;

  if (!name || !category || !price || !image || !description) {
    return res.status(400).json({
      success: false,
      message: "Name, category, price, image and description are required.",
    });
  }

  const newProduct = {
    id: createId(),
    slug: createSlug(name),
    name,
    category,
    price: Number(price),
    image,
    description,
    shortDescription: shortDescription || "",
    stock: Number(stock || 0),
    isFeatured: Boolean(isFeatured),
    status: status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  writeJsonFile(PRODUCTS_FILE, products);

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product: newProduct,
  });
});

app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const productId = Number(req.params.id);

  const productIndex = products.findIndex(
    (product) => product.id === productId
  );

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const existingProduct = products[productIndex];

  const updatedProduct = {
    ...existingProduct,
    ...req.body,
    id: existingProduct.id,
    slug: req.body.name ? createSlug(req.body.name) : existingProduct.slug,
    price:
      req.body.price !== undefined
        ? Number(req.body.price)
        : existingProduct.price,
    stock:
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : existingProduct.stock,
    isFeatured:
      req.body.isFeatured !== undefined
        ? Boolean(req.body.isFeatured)
        : existingProduct.isFeatured,
    updatedAt: new Date().toISOString(),
  };

  products[productIndex] = updatedProduct;
  writeJsonFile(PRODUCTS_FILE, products);

  res.json({
    success: true,
    message: "Product updated successfully.",
    product: updatedProduct,
  });
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const productId = Number(req.params.id);

  const productExists = products.some((product) => product.id === productId);

  if (!productExists) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const filteredProducts = products.filter(
    (product) => product.id !== productId
  );

  writeJsonFile(PRODUCTS_FILE, filteredProducts);

  res.json({
    success: true,
    message: "Product deleted successfully.",
  });
});

/* ================= ORDERS ================= */

app.post("/api/orders", (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const products = readJsonFile(PRODUCTS_FILE);

  const { customer, items, subtotal, paymentMethod, note } = req.body;

  if (!customer?.name || !customer?.phone || !customer?.city || !customer?.address) {
    return res.status(400).json({
      success: false,
      message: "Customer name, phone, city and address are required.",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item.",
    });
  }

  for (const item of items) {
    const product = products.find((productItem) => productItem.id === item.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `${item.name} is no longer available.`,
      });
    }

    const availableStock = Number(product.stock || 0);
    const requestedQuantity = Number(item.quantity || 0);

    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: `${product.name} is currently out of stock.`,
      });
    }

    if (requestedQuantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} item(s) available for ${product.name}.`,
      });
    }
  }

  const updatedProducts = products.map((product) => {
    const orderedItem = items.find((item) => item.id === product.id);

    if (!orderedItem) return product;

    return {
      ...product,
      stock: Math.max(
        0,
        Number(product.stock || 0) - Number(orderedItem.quantity || 0)
      ),
      updatedAt: new Date().toISOString(),
    };
  });

  writeJsonFile(PRODUCTS_FILE, updatedProducts);

  const order = {
    id: createId(),
    orderNumber: `TADS-${Date.now()}`,
    customer,
    items,
    subtotal: Number(subtotal || 0),
    paymentMethod: paymentMethod || "whatsapp",
    paymentStatus: "pending",
    orderStatus: "pending_confirmation",
    note: note || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(order);
  writeJsonFile(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: "Order saved successfully.",
    order,
  });
});
/* ================= ORDER TRACKING - PUBLIC ================= */

app.get("/api/orders/track", (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);

  const { orderNumber, phone } = req.query;

  if (!orderNumber || !phone) {
    return res.status(400).json({
      success: false,
      message: "Order number and phone number are required.",
    });
  }

  const order = orders.find(
    (item) =>
      String(item.orderNumber).toLowerCase() ===
      String(orderNumber).toLowerCase() &&
      String(item.customer?.phone).replace(/\s+/g, "") ===
      String(phone).replace(/\s+/g, "")
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message:
        "No order found with this order number and phone number. Please check your details.",
    });
  }

  res.json({
    success: true,
    order: {
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer?.name,
        phone: order.customer?.phone,
        city: order.customer?.city,
      },
      items: order.items,
      subtotal: order.subtotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      note: order.note,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
});

app.get("/api/admin/orders", requireAdmin, (req, res) => {
  res.json(readJsonFile(ORDERS_FILE));
});

app.get("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const orderId = Number(req.params.id);

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json(order);
});

app.put("/api/admin/orders/:id/status", requireAdmin, (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const products = readJsonFile(PRODUCTS_FILE);
  const orderId = Number(req.params.id);

  const orderIndex = orders.findIndex((item) => item.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  const { orderStatus, paymentStatus } = req.body;

  const existingOrder = orders[orderIndex];
  const previousStatus = existingOrder.orderStatus;
  const nextStatus = orderStatus || existingOrder.orderStatus;

  let updatedProducts = products;

  const shouldRestoreStock =
    previousStatus !== "cancelled" && nextStatus === "cancelled";

  const shouldReduceAgain =
    previousStatus === "cancelled" && nextStatus !== "cancelled";

  if (shouldRestoreStock) {
    updatedProducts = products.map((product) => {
      const orderedItem = existingOrder.items?.find(
        (item) => item.id === product.id
      );

      if (!orderedItem) return product;

      return {
        ...product,
        stock: Number(product.stock || 0) + Number(orderedItem.quantity || 0),
        updatedAt: new Date().toISOString(),
      };
    });

    writeJsonFile(PRODUCTS_FILE, updatedProducts);
  }

  if (shouldReduceAgain) {
    for (const item of existingOrder.items || []) {
      const product = products.find((productItem) => productItem.id === item.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `${item.name} is no longer available.`,
        });
      }

      const availableStock = Number(product.stock || 0);
      const requestedQuantity = Number(item.quantity || 0);

      if (requestedQuantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot reactivate order. Only ${availableStock} item(s) available for ${product.name}.`,
        });
      }
    }

    updatedProducts = products.map((product) => {
      const orderedItem = existingOrder.items?.find(
        (item) => item.id === product.id
      );

      if (!orderedItem) return product;

      return {
        ...product,
        stock: Math.max(
          0,
          Number(product.stock || 0) - Number(orderedItem.quantity || 0)
        ),
        updatedAt: new Date().toISOString(),
      };
    });

    writeJsonFile(PRODUCTS_FILE, updatedProducts);
  }

  orders[orderIndex] = {
    ...existingOrder,
    orderStatus: nextStatus,
    paymentStatus: paymentStatus || existingOrder.paymentStatus,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(ORDERS_FILE, orders);

  res.json({
    success: true,
    message: "Order status updated successfully.",
    order: orders[orderIndex],
  });
});

app.delete("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const orderId = Number(req.params.id);

  const orderExists = orders.some((order) => order.id === orderId);

  if (!orderExists) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  const filteredOrders = orders.filter((order) => order.id !== orderId);

  writeJsonFile(ORDERS_FILE, filteredOrders);

  res.json({
    success: true,
    message: "Order deleted successfully.",
  });
});

/* ================= ERROR HANDLING ================= */

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image size should be less than 5MB."
          : error.message,
    });
  }

  if (error.message === "Only JPG, PNG and WEBP images are allowed.") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.listen(PORT, () => {
  console.log(`Tridev A&D Shine backend running on http://localhost:${PORT}`);
});