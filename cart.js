// Cart functionality
let cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialize cart page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Cart page loaded")
  updateCartCount()
  loadCartPage()
  setupEventListeners()
})

// Setup event listeners
function setupEventListeners() {
  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Search icon
  const searchIcon = document.getElementById("search-icon")
  if (searchIcon) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault()
      showNotification("Search functionality coming soon!")
    })
  }

  // Checkout modal
  const checkoutModal = document.getElementById("checkout-modal")
  if (checkoutModal) {
    const closeBtn = checkoutModal.querySelector(".close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        checkoutModal.style.display = "none"
      })
    }
  }

  // Checkout form
  const checkoutForm = document.getElementById("checkout-form")
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout)
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })
}

// Add item to cart
function addToCart(id, name, price) {
  console.log("Adding to cart:", { id, name, price })

  if (!id || !name || !price) {
    console.error("Invalid product data:", { id, name, price })
    showNotification("Error: Invalid product data")
    return
  }

  try {
    const existingItem = cart.find((item) => item.id === id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      const newItem = {
        id: id,
        name: name,
        price: Number(price),
        quantity: 1,
      }
      cart.push(newItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    showNotification(`${name} added to cart!`)

    // If we're on the cart page, reload it
    if (window.location.pathname.includes("cart.html")) {
      loadCartPage()
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    showNotification("Error adding item to cart")
  }
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id)
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartCount()
  loadCartPage()
  showNotification("Item removed from cart!")
}

// Update item quantity
function updateQuantity(id, change) {
  const item = cart.find((item) => item.id === id)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(id)
      return
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    loadCartPage()
  }
}

// Update cart count in header
function updateCartCount() {
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
  }
}

// Load cart page content
function loadCartPage() {
  const cartItemsList = document.getElementById("cart-items-list")
  const cartSubtotal = document.getElementById("cart-subtotal")
  const cartTotal = document.getElementById("cart-total")
  const emptyCart = document.getElementById("empty-cart")
  const cartContent = document.querySelector(".cart-content")

  if (!cartItemsList) return

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none"
    if (emptyCart) emptyCart.style.display = "block"
    return
  }

  if (cartContent) cartContent.style.display = "flex"
  if (emptyCart) emptyCart.style.display = "none"

  let total = 0
  cartItemsList.innerHTML = ""

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity
    total += itemTotal

    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"
    cartItem.innerHTML = `
            <div class="item-image">
                <img src="/placeholder.svg?height=80&width=80" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">₵${item.price.toLocaleString()}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="item-total">
                <p>₵${itemTotal.toLocaleString()}</p>
            </div>
            <div class="item-actions">
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
    cartItemsList.appendChild(cartItem)
  })

  if (cartSubtotal) cartSubtotal.textContent = `₵${total.toLocaleString()}`
  if (cartTotal) cartTotal.textContent = `₵${total.toLocaleString()}`
}

// Clear entire cart
function clearCart() {
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = []
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    loadCartPage()
    showNotification("Cart cleared!")
  }
}

// Proceed to checkout (updated)
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!")
    return
  }

  const checkoutModal = document.getElementById("checkout-modal")
  if (checkoutModal) {
    updateCheckoutTotals()
    checkoutModal.style.display = "block"
  }
}

// Fill campus address suggestions
function fillCampusAddress(hall) {
  const addressField = document.getElementById("delivery-address")
  if (addressField) {
    addressField.value = `${hall}, University of Ghana, Legon, Accra`
    addressField.focus()
  }
}

// Update checkout totals when modal opens
function updateCheckoutTotals() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const checkoutSubtotal = document.getElementById("checkout-subtotal")
  const checkoutDelivery = document.getElementById("checkout-delivery")
  const checkoutTotalAmount = document.getElementById("checkout-total-amount")

  if (checkoutSubtotal) checkoutSubtotal.textContent = `₵${total.toLocaleString()}`
  if (checkoutDelivery) checkoutDelivery.textContent = "FREE"
  if (checkoutTotalAmount) checkoutTotalAmount.textContent = `₵${total.toLocaleString()}`
}

// Enhanced form validation
function validateCheckoutForm(formData) {
  const errors = {}

  // Validate name
  const name = formData.get("customerName")
  if (!name || name.trim().length < 2) {
    errors.customerName = "Please enter a valid full name"
  }

  // Validate phone
  const phone = formData.get("customerPhone")
  const phoneRegex = /^(\+233|0)[0-9]{9}$/
  if (!phone || !phoneRegex.test(phone.replace(/\s/g, ""))) {
    errors.customerPhone = "Please enter a valid Ghana phone number"
  }

  // Validate email if provided
  const email = formData.get("customerEmail")
  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.customerEmail = "Please enter a valid email address"
    }
  }

  // Validate address
  const address = formData.get("deliveryAddress")
  if (!address || address.trim().length < 10) {
    errors.deliveryAddress = "Please provide a detailed delivery address"
  }

  // Validate payment method
  const paymentMethod = formData.get("paymentMethod")
  if (!paymentMethod) {
    errors.paymentMethod = "Please select a payment method"
  }

  return errors
}

// Show form errors
function showFormErrors(errors) {
  // Clear previous errors
  document.querySelectorAll(".form-error").forEach((error) => {
    error.textContent = ""
  })

  // Show new errors
  Object.keys(errors).forEach((field) => {
    const errorElement = document.querySelector(`#${field} + .form-error`)
    if (errorElement) {
      errorElement.textContent = errors[field]
    }
  })
}

// Handle checkout form submission (enhanced)
function handleCheckout(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const submitBtn = e.target.querySelector(".checkout-submit-btn")

  // Add loading state
  submitBtn.classList.add("loading")
  submitBtn.textContent = "Processing..."

  // Validate form
  const errors = validateCheckoutForm(formData)
  if (Object.keys(errors).length > 0) {
    showFormErrors(errors)
    submitBtn.classList.remove("loading")
    submitBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order Securely'
    return
  }

  // Simulate processing delay
  setTimeout(() => {
    const order = {
      id: "ORD-" + Date.now(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      date: new Date().toISOString(),
      status: "pending",
      customer: formData.get("customerName"),
      phone: formData.get("customerPhone"),
      email: formData.get("customerEmail") || "Not provided",
      address: formData.get("deliveryAddress"),
      paymentMethod: formData.get("paymentMethod"),
      notes: formData.get("orderNotes") || "No additional notes",
      delivery:
        formData.get("deliveryAddress").toLowerCase().includes("university of ghana") ||
        formData.get("deliveryAddress").toLowerCase().includes("legon") ||
        formData.get("deliveryAddress").toLowerCase().includes("campus")
          ? "Campus (Free)"
          : "Off-campus",
    }

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || []
    orders.push(order)
    localStorage.setItem("orders", JSON.stringify(orders))

    // Clear cart
    cart.length = 0
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()

    // Close modal and show success
    document.getElementById("checkout-modal").style.display = "none"
    showOrderSuccessMessage(order)

    // Reset form and button
    e.target.reset()
    submitBtn.classList.remove("loading")
    submitBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order Securely'

    // Reload cart page
    setTimeout(() => {
      loadCartPage()
    }, 1000)
  }, 2000) // 2 second processing simulation
}

// Add new function to show order success message
function showOrderSuccessMessage(order) {
  const successModal = document.createElement("div")
  successModal.className = "modal"
  successModal.style.display = "block"
  successModal.innerHTML = `
    <div class="modal-content" style="max-width: 500px; text-align: center;">
      <h2 style="color: #27ae60; margin-bottom: 1rem;">
        <i class="fas fa-check-circle"></i> Order Placed Successfully!
      </h2>
      <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total:</strong> ₵${order.total.toLocaleString()}</p>
        <p><strong>Delivery:</strong> ${order.delivery}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      </div>
      <p style="color: #86868b; margin: 1rem 0;">
        We'll contact you shortly to confirm your order and arrange delivery.
      </p>
      <button class="btn-primary" onclick="this.closest('.modal').remove(); window.location.href='index.html'">
        Continue Shopping
      </button>
    </div>
  `

  document.body.appendChild(successModal)

  // Auto remove after 10 seconds
  setTimeout(() => {
    if (document.body.contains(successModal)) {
      successModal.remove()
      window.location.href = "index.html"
    }
  }, 10000)
}

// Show notification
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
        max-width: 300px;
        word-wrap: break-word;
    `
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Storage modal for iPhones (for compatibility with other pages)
function showStorageModal(productId, productName, storageOptions) {
  // This function is for compatibility when called from other pages
  // Since we're on cart page, we'll just show a notification
  showNotification("Please select storage option on the product page")
}

// Earphone options modal (for compatibility)
function showEarphoneOptions() {
  showNotification("Please select earphone option on the accessories page")
}

// View product (for compatibility)
function viewProduct(productId) {
  showNotification("Product details page would open here")
}

// Make functions globally available
window.addToCart = addToCart
window.removeFromCart = removeFromCart
window.updateQuantity = updateQuantity
window.clearCart = clearCart
window.proceedToCheckout = proceedToCheckout
window.showStorageModal = showStorageModal
window.showEarphoneOptions = showEarphoneOptions
window.viewProduct = viewProduct
window.fillCampusAddress = fillCampusAddress
window.updateCheckoutTotals = updateCheckoutTotals

console.log("Cart.js loaded and functions made globally available")
