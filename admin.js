// Add login functionality at the beginning of the file
// Admin credentials (in production, this should be more secure)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "dealersprice2024",
}

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn")
  const loginContainer = document.getElementById("admin-login")
  const dashboardContainer = document.getElementById("admin-dashboard")

  if (!loginContainer || !dashboardContainer) {
    console.error("Login or dashboard containers not found")
    return false
  }

  if (isLoggedIn === "true") {
    loginContainer.style.display = "none"
    dashboardContainer.style.display = "block"
    return true
  } else {
    loginContainer.style.display = "flex"
    dashboardContainer.style.display = "none"
    return false
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault()
  console.log("Login form submitted")

  const formData = new FormData(e.target)
  const username = formData.get("username")
  const password = formData.get("password")
  const errorDiv = document.getElementById("login-error")

  if (!errorDiv) {
    console.error("Error div not found")
    return
  }

  console.log("Checking credentials:", { username, password: "***" })

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    console.log("Login successful")
    sessionStorage.setItem("adminLoggedIn", "true")
    checkAuth()
    initializeAdmin()
    showNotification("Login successful!")
  } else {
    console.log("Login failed")
    errorDiv.style.display = "block"
    setTimeout(() => {
      errorDiv.style.display = "none"
    }, 3000)
  }
}

// Handle logout
function logout() {
  sessionStorage.removeItem("adminLoggedIn")
  checkAuth()
  showNotification("Logged out successfully!")
}

// Add console logging to help debug initialization issues
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin page loaded")

  // Setup login form
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    console.log("Login form found, adding event listener")
    loginForm.addEventListener("submit", handleLogin)
  } else {
    console.error("Login form not found")
  }

  // Check authentication
  console.log("Checking authentication")
  if (checkAuth()) {
    console.log("User is authenticated, initializing admin")
    initializeAdmin()
  } else {
    console.log("User is not authenticated, showing login form")
  }
})

// Fix the initializeAdmin function to handle potential errors
function initializeAdmin() {
  console.log("Initializing admin dashboard")
  try {
    loadDashboardStats()
    loadOrders()
    loadMessages()
    loadProducts()
    setupAdminEventListeners()
    console.log("Admin dashboard initialized successfully")
  } catch (error) {
    console.error("Error initializing admin dashboard:", error)
    showNotification("Error loading admin dashboard. Please refresh the page.")
  }
}

function setupAdminEventListeners() {
  // Modal event listeners
  const orderModal = document.getElementById("order-modal")
  const messageModal = document.getElementById("message-modal")

  if (orderModal) {
    const closeBtn = orderModal.querySelector(".close")
    closeBtn.addEventListener("click", () => {
      orderModal.style.display = "none"
    })
  }

  if (messageModal) {
    const closeBtn = messageModal.querySelector(".close")
    closeBtn.addEventListener("click", () => {
      messageModal.style.display = "none"
    })
  }
}

function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll(".admin-section")
  sections.forEach((section) => section.classList.remove("active"))

  // Show selected section
  const targetSection = document.getElementById(sectionName)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Update navigation
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => link.classList.remove("active"))

  const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`)
  if (activeLink) {
    activeLink.classList.add("active")
  }

  // Update section title
  const sectionTitle = document.getElementById("section-title")
  if (sectionTitle) {
    sectionTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
  }
}

// Update the loadDashboardStats function to include more detailed stats
function loadDashboardStats() {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const messages = JSON.parse(localStorage.getItem("messages")) || []

  // Update stats
  const totalOrders = document.getElementById("total-orders")
  const totalRevenue = document.getElementById("total-revenue")
  const newMessages = document.getElementById("new-messages")
  const pendingOrders = document.getElementById("pending-orders")

  if (totalOrders) {
    totalOrders.textContent = orders.length
  }

  if (totalRevenue) {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0)
    totalRevenue.textContent = "₵" + revenue.toLocaleString()
  }

  if (newMessages) {
    const unreadMessages = messages.filter((msg) => !msg.read).length
    newMessages.textContent = unreadMessages
  }

  if (pendingOrders) {
    const pending = orders.filter((order) => order.status === "pending").length
    pendingOrders.textContent = pending
  }

  // Update delivery stats
  updateDeliveryStats(orders)

  // Load recent activity
  loadRecentActivity()
}

// Add new function to update delivery stats
function updateDeliveryStats(orders) {
  const pendingDeliveries = document.getElementById("pending-deliveries")
  const completedToday = document.getElementById("completed-today")
  const campusOrders = document.getElementById("campus-orders")

  const today = new Date().toDateString()

  if (pendingDeliveries) {
    const pending = orders.filter((order) => order.status === "pending" || order.status === "processing").length
    pendingDeliveries.textContent = pending
  }

  if (completedToday) {
    const completed = orders.filter(
      (order) => order.status === "delivered" && new Date(order.date).toDateString() === today,
    ).length
    completedToday.textContent = completed
  }

  if (campusOrders) {
    const campus = orders.filter((order) => order.delivery && order.delivery.includes("Campus")).length
    campusOrders.textContent = campus
  }
}

// Update the loadOrders function to show more details
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const ordersTable = document.getElementById("orders-table")
  const statusFilter = document.getElementById("order-status-filter")

  if (!ordersTable) return

  let filteredOrders = orders
  if (statusFilter && statusFilter.value) {
    filteredOrders = orders.filter((order) => order.status === statusFilter.value)
  }

  if (filteredOrders.length === 0) {
    ordersTable.innerHTML = '<tr><td colspan="9">No orders found</td></tr>'
    return
  }

  // Sort orders by date (newest first)
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date))

  ordersTable.innerHTML = filteredOrders
    .map(
      (order) => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.phone}</td>
            <td>${order.items.length} items</td>
            <td>₵${order.total.toLocaleString()}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${order.delivery || "Not specified"}</td>
            <td>
                <button class="action-btn view" onclick="viewOrder('${order.id}')">View</button>
                <button class="action-btn edit" onclick="editOrder('${order.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteOrder('${order.id}')">Delete</button>
            </td>
        </tr>
    `,
    )
    .join("")
}

// Add filter function for orders
function filterOrders() {
  loadOrders()
}

function loadRecentActivity() {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const messages = JSON.parse(localStorage.getItem("messages")) || []
  const activityList = document.getElementById("recent-activity")

  if (!activityList) return

  const activities = []

  // Add recent orders
  orders.slice(-5).forEach((order) => {
    activities.push({
      type: "order",
      message: `New order ${order.id} - ₵${order.total.toLocaleString()}`,
      date: new Date(order.date),
    })
  })

  // Add recent messages
  messages.slice(-5).forEach((message) => {
    activities.push({
      type: "message",
      message: `New message from ${message.name}`,
      date: new Date(message.date),
    })
  })

  // Sort by date
  activities.sort((a, b) => b.date - a.date)

  if (activities.length === 0) {
    activityList.innerHTML = "<p>No recent activity</p>"
    return
  }

  activityList.innerHTML = activities
    .slice(0, 10)
    .map(
      (activity) => `
        <div class="activity-item">
            <p>${activity.message}</p>
            <small>${activity.date.toLocaleDateString()}</small>
        </div>
    `,
    )
    .join("")
}

// Update the viewOrder function to show more details
function viewOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const order = orders.find((o) => o.id === orderId)

  if (!order) return

  const orderModal = document.getElementById("order-modal")
  const orderDetails = document.getElementById("order-details")

  if (orderModal && orderDetails) {
    orderDetails.innerHTML = `
            <h3>Order ${order.id}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                </div>
                <div>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                </div>
            </div>
            <p><strong>Delivery Address:</strong></p>
            <p style="background: #f5f5f7; padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem;">${order.address}</p>
            <p><strong>Delivery Type:</strong> ${order.delivery}</p>
            ${order.notes !== "No additional notes" ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
            <p><strong>Total:</strong> ₵${order.total.toLocaleString()}</p>
            <h4>Items:</h4>
            <div style="max-height: 200px; overflow-y: auto;">
                ${order.items
                  .map(
                    (item) => `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #f0f0f0;">
                        <span>${item.name}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>₵${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `

    document.getElementById("order-status").value = order.status
    orderModal.style.display = "block"

    // Store current order ID for status update
    orderModal.dataset.orderId = orderId
  }
}

function updateOrderStatus() {
  const orderModal = document.getElementById("order-modal")
  const orderId = orderModal.dataset.orderId
  const newStatus = document.getElementById("order-status").value

  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const orderIndex = orders.findIndex((o) => o.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus
    localStorage.setItem("orders", JSON.stringify(orders))
    loadOrders()
    orderModal.style.display = "none"
    showNotification("Order status updated successfully!")
  }
}

function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this order?")) {
    let orders = JSON.parse(localStorage.getItem("orders")) || []
    orders = orders.filter((o) => o.id !== orderId)
    localStorage.setItem("orders", JSON.stringify(orders))
    loadOrders()
    loadDashboardStats()
    showNotification("Order deleted successfully!")
  }
}

function loadMessages() {
  const messages = JSON.parse(localStorage.getItem("messages")) || []
  const messagesList = document.getElementById("messages-list")

  if (!messagesList) return

  if (messages.length === 0) {
    messagesList.innerHTML = "<p>No messages found</p>"
    return
  }

  messagesList.innerHTML = messages
    .map(
      (message) => `
        <div class="message-item ${!message.read ? "unread" : ""}" onclick="viewMessage('${message.id}')">
            <div class="message-header">
                <span class="message-sender">${message.name}</span>
                <span class="message-date">${new Date(message.date).toLocaleDateString()}</span>
            </div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-preview">${message.message.substring(0, 100)}...</div>
        </div>
    `,
    )
    .join("")
}

function loadProducts() {
  const products = [
    // iPhones
    { id: "iphone-16-pro-max-256gb", name: "iPhone 16 Pro Max (256GB)", price: 22800, category: "iPhone" },
    { id: "iphone-16-pro-256gb", name: "iPhone 16 Pro (256GB)", price: 20200, category: "iPhone" },
    { id: "iphone-15-pro-max-128gb", name: "iPhone 15 Pro Max (128GB)", price: 19200, category: "iPhone" },

    // Laptops
    { id: "hp-1040-g7-x360", name: "HP EliteBook 1040 G7 X360", price: 6800, category: "Laptop" },
    { id: "hp-1030-g4-x360-i7", name: "HP EliteBook 1030 G4 X360 (i7)", price: 6000, category: "Laptop" },
    { id: "hp-840-g3", name: "HP EliteBook 840 G3", price: 2950, category: "Laptop" },

    // Accessories
    { id: "airpods-4", name: "AirPods 4", price: 260, category: "Accessory" },
    { id: "airpods-pro", name: "AirPods Pro", price: 200, category: "Accessory" },
    { id: "type-c-2pin", name: "Type C Charger (2 Pin)", price: 80, category: "Accessory" },
    { id: "nokia-106-4g", name: "Nokia 106 4G", price: 220, category: "Accessory" },
  ]

  const productsGrid = document.getElementById("products-grid")

  if (!productsGrid) return

  productsGrid.innerHTML = products
    .map(
      (product) => `
        <div class="admin-product-card">
            <img src="/placeholder.svg?height=150&width=150" alt="${product.name}">
            <h4>${product.name}</h4>
            <p class="price">₵${product.price.toLocaleString()}</p>
            <p>${product.category}</p>
            <div class="product-actions">
                <button class="action-btn edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function viewMessage(messageId) {
  const messages = JSON.parse(localStorage.getItem("messages")) || []
  const message = messages.find((m) => m.id === messageId)

  if (!message) return

  const messageModal = document.getElementById("message-modal")
  const messageDetails = document.getElementById("message-details")

  if (messageModal && messageDetails) {
    messageDetails.innerHTML = `
            <h3>Message from ${message.name}</h3>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Phone:</strong> ${message.phone || "Not provided"}</p>
            <p><strong>Subject:</strong> ${message.subject}</p>
            <p><strong>Date:</strong> ${new Date(message.date).toLocaleString()}</p>
            <div style="margin-top: 1rem;">
                <strong>Message:</strong>
                <p style="background: #f5f5f7; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                    ${message.message}
                </p>
            </div>
        `

    messageModal.style.display = "block"
    messageModal.dataset.messageId = messageId

    // Mark as read
    if (!message.read) {
      message.read = true
      localStorage.setItem("messages", JSON.stringify(messages))
      loadMessages()
      loadDashboardStats()
    }
  }
}

function markAllRead() {
  const messages = JSON.parse(localStorage.getItem("messages")) || []
  messages.forEach((message) => (message.read = true))
  localStorage.setItem("messages", JSON.stringify(messages))
  loadMessages()
  loadDashboardStats()
  showNotification("All messages marked as read!")
}

function deleteMessage() {
  const messageModal = document.getElementById("message-modal")
  const messageId = messageModal.dataset.messageId

  if (confirm("Are you sure you want to delete this message?")) {
    let messages = JSON.parse(localStorage.getItem("messages")) || []
    messages = messages.filter((m) => m.id !== messageId)
    localStorage.setItem("messages", JSON.stringify(messages))
    loadMessages()
    loadDashboardStats()
    messageModal.style.display = "none"
    showNotification("Message deleted successfully!")
  }
}

function replyToMessage() {
  showNotification("Reply functionality would be implemented here")
}

function editOrder(orderId) {
  showNotification("Edit order functionality would be implemented here")
}

function addProduct() {
  showNotification("Add product functionality would be implemented here")
}

function editProduct(productId) {
  showNotification("Edit product functionality would be implemented here")
}

function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    showNotification("Product deleted successfully!")
  }
}

// Utility function for notifications (reuse from main script)
function showNotification(message) {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #007aff;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}
// Ensure the admin page is only accessible to logged-in users
if (!checkAuth()) {
  console.log("User not authenticated, redirecting to login")
  document.getElementById("admin-login").style.display = "flex"
  document.getElementById("admin-dashboard").style.display = "none"
}