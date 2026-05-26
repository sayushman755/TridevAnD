import React, { useEffect, useMemo, useState } from "react";
import {
    FaBoxOpen,
    FaPlus,
    FaTrash,
    FaSyncAlt,
    FaShoppingBag,
    FaLock,
    FaSignOutAlt,
    FaEdit,
    FaTimes,
    FaUpload,
    FaEye,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaWhatsapp,
    FaSearch,
    FaFilter,
} from "react-icons/fa";
import { API_BASE_URL, BRAND_NAME, createWhatsAppLink } from "./config";
import "./Admin.css";


const initialProductForm = {
    name: "",
    category: "Earrings",
    price: "",
    image: "",
    description: "",
    shortDescription: "",
    stock: "",
    isFeatured: false,
    status: "active",
};

const orderStatusOptions = [
    {
        value: "pending_confirmation",
        label: "New Order - Need to Confirm",
    },
    {
        value: "confirmed",
        label: "Order Confirmed",
    },
    {
        value: "packed",
        label: "Packed",
    },
    {
        value: "shipped",
        label: "Shipped / Out for Delivery",
    },
    {
        value: "delivered",
        label: "Delivered",
    },
    {
        value: "cancelled",
        label: "Cancelled",
    },
];

const paymentStatusOptions = [
    {
        value: "pending",
        label: "Payment Pending",
    },
    {
        value: "paid",
        label: "Paid",
    },
    {
        value: "failed",
        label: "Payment Failed",
    },
    {
        value: "refunded",
        label: "Refunded",
    },
];

const getAdminImageUrl = (imagePath) => {
    if (!imagePath) {
        return "https://via.placeholder.com/600x750?text=Product+Image";
    }

    if (imagePath.startsWith("/uploads")) {
        return `${API_BASE_URL}${imagePath}`;
    }

    return imagePath;
};

const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
};

const getOrderStatusLabel = (status) => {
    return (
        orderStatusOptions.find((option) => option.value === status)?.label ||
        "New Order - Need to Confirm"
    );
};

const getPaymentStatusLabel = (status) => {
    return (
        paymentStatusOptions.find((option) => option.value === status)?.label ||
        "Payment Pending"
    );
};

function AdminPanel() {
    const [adminToken, setAdminToken] = useState(
        localStorage.getItem("tridevad_admin_token") || ""
    );
    const [tokenInput, setTokenInput] = useState("");

    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [productForm, setProductForm] = useState(initialProductForm);
    const [editingProductId, setEditingProductId] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [orderSearch, setOrderSearch] = useState("");
    const [orderStatusFilter, setOrderStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState("");

    const isLoggedIn = Boolean(adminToken);

    const adminHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
    };

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleLogin = (event) => {
        event.preventDefault();

        if (!tokenInput.trim()) {
            showMessage("Please enter admin token.");
            return;
        }

        localStorage.setItem("tridevad_admin_token", tokenInput.trim());
        setAdminToken(tokenInput.trim());
        setTokenInput("");
        showMessage("Admin login successful.");
    };

    const handleLogout = () => {
        localStorage.removeItem("tridevad_admin_token");
        setAdminToken("");
        setProducts([]);
        setOrders([]);
        setEditingProductId(null);
        setProductForm(initialProductForm);
        setSelectedOrder(null);
    };

    const fetchProducts = async () => {
        if (!adminToken) return;

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
                headers: adminHeaders,
            });

            if (!response.ok) {
                throw new Error("Unable to fetch products.");
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            showMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!adminToken) return;

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
                headers: adminHeaders,
            });

            if (!response.ok) {
                throw new Error("Unable to fetch orders.");
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            showMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchProducts();
            fetchOrders();
        }
    }, [adminToken]);

    const filteredOrders = useMemo(() => {
        let result = [...orders];

        if (orderSearch.trim()) {
            const query = orderSearch.toLowerCase();

            result = result.filter((order) => {
                const searchableText = `
          ${order.orderNumber || ""}
          ${order.customer?.name || ""}
          ${order.customer?.phone || ""}
          ${order.customer?.city || ""}
          ${order.customer?.address || ""}
          ${order.paymentMethod || ""}
          ${order.orderStatus || ""}
          ${order.paymentStatus || ""}
        `.toLowerCase();

                return searchableText.includes(query);
            });
        }

        if (orderStatusFilter !== "all") {
            result = result.filter(
                (order) => (order.orderStatus || "pending_confirmation") === orderStatusFilter
            );
        }

        if (paymentStatusFilter !== "all") {
            result = result.filter(
                (order) => (order.paymentStatus || "pending") === paymentStatusFilter
            );
        }

        return result;
    }, [orders, orderSearch, orderStatusFilter, paymentStatusFilter]);

    const handleProductInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setProductForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetProductForm = () => {
        setProductForm(initialProductForm);
        setEditingProductId(null);
    };

    const handleStartEditProduct = (product) => {
        setEditingProductId(product.id);

        setProductForm({
            name: product.name || "",
            category: product.category || "Earrings",
            price: product.price || "",
            image: product.image || "",
            description: product.description || "",
            shortDescription: product.shortDescription || "",
            stock: product.stock || "",
            isFeatured: Boolean(product.isFeatured),
            status: product.status || "active",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        try {
            setUploadingImage(true);

            const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                body: uploadFormData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to upload image.");
            }

            setProductForm((prev) => ({
                ...prev,
                image: data.imageUrl,
            }));

            showMessage("Image uploaded successfully.");
        } catch (error) {
            showMessage(error.message);
        } finally {
            setUploadingImage(false);
            event.target.value = "";
        }
    };

    const handleSubmitProduct = async (event) => {
        event.preventDefault();

        if (
            !productForm.name ||
            !productForm.category ||
            !productForm.price ||
            !productForm.image ||
            !productForm.description
        ) {
            showMessage("Name, category, price, image and description are required.");
            return;
        }

        try {
            setLoading(true);

            const url = editingProductId
                ? `${API_BASE_URL}/api/admin/products/${editingProductId}`
                : `${API_BASE_URL}/api/admin/products`;

            const method = editingProductId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: adminHeaders,
                body: JSON.stringify(productForm),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save product.");
            }

            showMessage(
                editingProductId
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

            resetProductForm();
            fetchProducts();
        } catch (error) {
            showMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/admin/products/${productId}`,
                {
                    method: "DELETE",
                    headers: adminHeaders,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete product.");
            }

            showMessage("Product deleted successfully.");

            if (editingProductId === productId) {
                resetProductForm();
            }

            fetchProducts();
        } catch (error) {
            showMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
                {
                    method: "PUT",
                    headers: adminHeaders,
                    body: JSON.stringify({
                        orderStatus,
                        paymentStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update order.");
            }

            showMessage("Order updated successfully.");
            fetchOrders();

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(data.order);
            }
        } catch (error) {
            showMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this order? Use this only for test/wrong orders."
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
                method: "DELETE",
                headers: adminHeaders,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete order.");
            }

            showMessage("Order deleted successfully.");
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            showMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const openCustomerWhatsApp = (order) => {
        const phone = String(order.customer?.phone || "").replace(/\D/g, "");

        if (!phone) {
            showMessage("Customer phone number is missing.");
            return;
        }

        const finalPhone = phone.startsWith("91") ? phone : `91${phone}`;

        const message =
            `Hello ${order.customer?.name || ""},\n\n` +
            `This is regarding your ${BRAND_NAME} order.\n\n` +
            `Order ID: ${order.orderNumber}\n` +
            `Current Status: ${getOrderStatusLabel(
                order.orderStatus || "pending_confirmation"
            )}\n\n` +
            `You can track your order using your Order ID and phone number on our website.\n\n` +
            `Thank you.`;

        window.open(createWhatsAppLink(message, finalPhone), "_blank");
    };

    const resetOrderFilters = () => {
        setOrderSearch("");
        setOrderStatusFilter("all");
        setPaymentStatusFilter("all");
    };

    if (!isLoggedIn) {
        return (
            <main className="admin-login-page">
                <form className="admin-login-card" onSubmit={handleLogin}>
                    <div className="admin-login-icon">
                        <FaLock />
                    </div>

                    <span>Admin Access</span>
                    <h1>Tridev A&D Shine</h1>
                    <p>
                        Enter your admin token to manage products, inventory and customer
                        orders.
                    </p>

                    <input
                        type="password"
                        placeholder="Enter admin token"
                        value={tokenInput}
                        onChange={(event) => setTokenInput(event.target.value)}
                    />

                    <button type="submit">
                        Login to Admin
                        <FaLock />
                    </button>

                    {message && <p className="admin-message">{message}</p>}
                </form>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <header className="admin-header">
                <div>
                    <span>Admin Dashboard</span>
                    <h1>Store Management</h1>
                    <p>Manage products, orders and customer checkout requests.</p>
                </div>

                <div className="admin-header-actions">
                    <button
                        onClick={() => {
                            fetchProducts();
                            fetchOrders();
                        }}
                    >
                        <FaSyncAlt />
                        Refresh
                    </button>

                    <button onClick={handleLogout}>
                        <FaSignOutAlt />
                        Logout
                    </button>
                </div>
            </header>

            {message && <div className="admin-alert">{message}</div>}

            <section className="admin-tabs">
                <button
                    className={activeTab === "products" ? "active" : ""}
                    onClick={() => setActiveTab("products")}
                >
                    <FaBoxOpen />
                    Products
                </button>

                <button
                    className={activeTab === "orders" ? "active" : ""}
                    onClick={() => setActiveTab("orders")}
                >
                    <FaShoppingBag />
                    Orders
                </button>
            </section>

            {activeTab === "products" && (
                <section className="admin-grid-layout">
                    <form className="admin-form-card" onSubmit={handleSubmitProduct}>
                        <div className="admin-section-title">
                            {editingProductId ? <FaEdit /> : <FaPlus />}
                            <div>
                                <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>
                                <p>
                                    {editingProductId
                                        ? "Update existing product information."
                                        : "Add a product that will appear on the website."}
                                </p>
                            </div>
                        </div>

                        <label>
                            Product Name *
                            <input
                                name="name"
                                value={productForm.name}
                                onChange={handleProductInputChange}
                                placeholder="Classic Ribbed Hoop Earrings"
                            />
                        </label>

                        <label>
                            Category *
                            <select
                                name="category"
                                value={productForm.category}
                                onChange={handleProductInputChange}
                            >
                                <option value="Earrings">Earrings</option>
                                <option value="Ring">Ring</option>
                                <option value="Necklace">Necklace</option>
                                <option value="Pendant">Pendant</option>
                            </select>
                        </label>

                        <label>
                            Price *
                            <input
                                name="price"
                                type="number"
                                value={productForm.price}
                                onChange={handleProductInputChange}
                                placeholder="599"
                            />
                        </label>

                        <label>
                            Stock
                            <input
                                name="stock"
                                type="number"
                                value={productForm.stock}
                                onChange={handleProductInputChange}
                                placeholder="10"
                            />
                        </label>

                        <label>
                            Status
                            <select
                                name="status"
                                value={productForm.status}
                                onChange={handleProductInputChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>

                        <label className="admin-checkbox">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={productForm.isFeatured}
                                onChange={handleProductInputChange}
                            />
                            Mark as featured
                        </label>

                        <label className="full-admin-field">
                            Product Image *
                            <div className="admin-upload-box">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handleImageUpload}
                                />

                                <div>
                                    <FaUpload />
                                    <strong>
                                        {uploadingImage ? "Uploading..." : "Upload Product Image"}
                                    </strong>
                                    <span>JPG, PNG or WEBP up to 5MB</span>
                                </div>
                            </div>
                        </label>

                        <label className="full-admin-field">
                            Product Image Path *
                            <input
                                name="image"
                                value={productForm.image}
                                onChange={handleProductInputChange}
                                placeholder="/uploads/product-image.jpeg or /Products/Product Image.jpeg"
                            />
                        </label>

                        {productForm.image && (
                            <div className="admin-image-preview full-admin-field">
                                <img
                                    src={getAdminImageUrl(productForm.image)}
                                    alt="Product preview"
                                />

                                <div>
                                    <strong>Image Preview</strong>
                                    <span>{productForm.image}</span>
                                </div>
                            </div>
                        )}

                        <label className="full-admin-field">
                            Short Description
                            <input
                                name="shortDescription"
                                value={productForm.shortDescription}
                                onChange={handleProductInputChange}
                                placeholder="Minimal gold chain for daily styling."
                            />
                        </label>

                        <label className="full-admin-field">
                            Description *
                            <textarea
                                name="description"
                                value={productForm.description}
                                onChange={handleProductInputChange}
                                placeholder="Write full product description..."
                            />
                        </label>

                        <button className="admin-submit-btn" type="submit" disabled={loading}>
                            {editingProductId ? <FaEdit /> : <FaPlus />}
                            {loading
                                ? "Saving..."
                                : editingProductId
                                    ? "Update Product"
                                    : "Add Product"}
                        </button>

                        {editingProductId && (
                            <button
                                className="admin-cancel-edit-btn"
                                type="button"
                                onClick={resetProductForm}
                            >
                                <FaTimes />
                                Cancel Edit
                            </button>
                        )}
                    </form>

                    <section className="admin-list-card">
                        <div className="admin-section-title">
                            <FaBoxOpen />
                            <div>
                                <h2>All Products</h2>
                                <p>{products.length} products found.</p>
                            </div>
                        </div>

                        <div className="admin-product-list">
                            {products.map((product) => (
                                <article
                                    className={
                                        editingProductId === product.id
                                            ? "admin-product-row selected-product-row"
                                            : "admin-product-row"
                                    }
                                    key={product.id}
                                >
                                    <img src={getAdminImageUrl(product.image)} alt={product.name} />

                                    <div>
                                        <span>{product.category}</span>
                                        <h3>{product.name}</h3>
                                        <p>{formatPrice(product.price)}</p>
                                        <small>
                                            Stock: {product.stock ?? 0} | Status:{" "}
                                            {product.status || "active"} | Featured:{" "}
                                            {product.isFeatured ? "Yes" : "No"}
                                        </small>
                                    </div>

                                    <div className="admin-product-actions">
                                        <button
                                            type="button"
                                            title="Edit product"
                                            onClick={() => handleStartEditProduct(product)}
                                        >
                                            <FaEdit />
                                        </button>

                                        <button
                                            type="button"
                                            title="Delete product"
                                            onClick={() => handleDeleteProduct(product.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </section>
            )}

            {activeTab === "orders" && (
                <section className="admin-orders-section">
                    <div className="admin-section-title">
                        <FaShoppingBag />
                        <div>
                            <h2>Customer Orders</h2>
                            <p>
                                {filteredOrders.length} of {orders.length} orders showing.
                            </p>
                        </div>
                    </div>

                    <div className="admin-order-tools">
                        <div className="admin-order-search">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search Order ID, name, phone, city..."
                                value={orderSearch}
                                onChange={(event) => setOrderSearch(event.target.value)}
                            />
                        </div>

                        <div className="admin-order-filter">
                            <FaFilter />
                            <select
                                value={orderStatusFilter}
                                onChange={(event) => setOrderStatusFilter(event.target.value)}
                            >
                                <option value="all">All Order Status</option>
                                {orderStatusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-order-filter">
                            <FaFilter />
                            <select
                                value={paymentStatusFilter}
                                onChange={(event) => setPaymentStatusFilter(event.target.value)}
                            >
                                <option value="all">All Payment Status</option>
                                {paymentStatusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="admin-reset-filter-btn" onClick={resetOrderFilters}>
                            Reset
                        </button>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="admin-empty-state">
                            <FaShoppingBag />
                            <h3>No orders found.</h3>
                            <p>Try changing search or filter options.</p>
                        </div>
                    ) : (
                        <div className="admin-orders-list">
                            {filteredOrders.map((order) => (
                                <article className="admin-order-card" key={order.id}>
                                    <div className="admin-order-top">
                                        <div>
                                            <span>{order.orderNumber}</span>
                                            <h3>{order.customer?.name}</h3>
                                            <p>
                                                {order.customer?.phone} | {order.customer?.city}
                                            </p>
                                        </div>

                                        <div className="admin-order-top-actions">
                                            <strong>{formatPrice(order.subtotal)}</strong>

                                            <button type="button" onClick={() => setSelectedOrder(order)}>
                                                <FaEye />
                                                View Details
                                            </button>
                                        </div>
                                    </div>

                                    <div className="admin-order-status-pills">
                                        <span>{getOrderStatusLabel(order.orderStatus)}</span>
                                        <span>{getPaymentStatusLabel(order.paymentStatus)}</span>
                                        <span>{order.paymentMethod || "whatsapp"}</span>
                                    </div>

                                    <div className="admin-order-address">
                                        <strong>Address:</strong> {order.customer?.address}
                                    </div>

                                    <div className="admin-order-items">
                                        {order.items?.map((item) => (
                                            <div key={`${order.id}-${item.id}`}>
                                                <span>{item.name}</span>
                                                <strong>
                                                    Qty {item.quantity} × {formatPrice(item.price)}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="admin-status-grid">
                                        <label>
                                            Order Status
                                            <select
                                                value={order.orderStatus || "pending_confirmation"}
                                                onChange={(event) =>
                                                    handleUpdateOrderStatus(
                                                        order.id,
                                                        event.target.value,
                                                        order.paymentStatus
                                                    )
                                                }
                                            >
                                                {orderStatusOptions.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label>
                                            Payment Status
                                            <select
                                                value={order.paymentStatus || "pending"}
                                                onChange={(event) =>
                                                    handleUpdateOrderStatus(
                                                        order.id,
                                                        order.orderStatus,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                {paymentStatusOptions.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="admin-order-card-actions">
                                        <button
                                            type="button"
                                            className="admin-whatsapp-order-btn"
                                            onClick={() => openCustomerWhatsApp(order)}
                                        >
                                            <FaWhatsapp />
                                            Message Customer
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-delete-order-btn"
                                            onClick={() => handleDeleteOrder(order.id)}
                                        >
                                            <FaTrash />
                                            Delete Test Order
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {selectedOrder && (
                <div
                    className="admin-order-modal-overlay"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="admin-order-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="admin-order-modal-close"
                            onClick={() => setSelectedOrder(null)}
                        >
                            <FaTimes />
                        </button>

                        <div className="admin-order-modal-header">
                            <span>Order Details</span>
                            <h2>{selectedOrder.orderNumber}</h2>
                            <p>
                                Created on{" "}
                                {selectedOrder.createdAt
                                    ? new Date(selectedOrder.createdAt).toLocaleString("en-IN")
                                    : "Not available"}
                            </p>
                        </div>

                        <div className="admin-order-detail-grid">
                            <div className="admin-order-detail-card">
                                <FaShoppingBag />
                                <span>Order Status</span>
                                <strong>{getOrderStatusLabel(selectedOrder.orderStatus)}</strong>
                            </div>

                            <div className="admin-order-detail-card">
                                <FaLock />
                                <span>Payment Status</span>
                                <strong>{getPaymentStatusLabel(selectedOrder.paymentStatus)}</strong>
                            </div>

                            <div className="admin-order-detail-card">
                                <FaShoppingBag />
                                <span>Payment Method</span>
                                <strong>{selectedOrder.paymentMethod || "whatsapp"}</strong>
                            </div>

                            <div className="admin-order-detail-card">
                                <FaBoxOpen />
                                <span>Order Value</span>
                                <strong>{formatPrice(selectedOrder.subtotal)}</strong>
                            </div>
                        </div>

                        <div className="admin-customer-detail-box">
                            <h3>Customer Information</h3>

                            <div className="admin-customer-info-list">
                                <p>
                                    <strong>Name:</strong> {selectedOrder.customer?.name || "N/A"}
                                </p>

                                <p>
                                    <FaPhoneAlt />
                                    <strong>Phone:</strong>{" "}
                                    {selectedOrder.customer?.phone || "N/A"}
                                </p>

                                <p>
                                    <strong>City:</strong> {selectedOrder.customer?.city || "N/A"}
                                </p>

                                <p>
                                    <FaMapMarkerAlt />
                                    <strong>Address:</strong>{" "}
                                    {selectedOrder.customer?.address || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="admin-customer-detail-box">
                            <h3>Ordered Products</h3>

                            <div className="admin-modal-items-list">
                                {selectedOrder.items?.map((item) => (
                                    <div
                                        className="admin-modal-item"
                                        key={`${selectedOrder.id}-${item.id}`}
                                    >
                                        <img src={getAdminImageUrl(item.image)} alt={item.name} />

                                        <div>
                                            <h4>{item.name}</h4>
                                            <p>{item.category}</p>
                                            <span>
                                                Qty {item.quantity} × {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedOrder.note && (
                            <div className="admin-customer-detail-box">
                                <h3>Customer Note</h3>
                                <p className="admin-order-note">{selectedOrder.note}</p>
                            </div>
                        )}

                        <div className="admin-modal-footer">
                            <button onClick={() => openCustomerWhatsApp(selectedOrder)}>
                                <FaWhatsapp />
                                Message Customer
                            </button>

                            <button onClick={() => setSelectedOrder(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminPanel;