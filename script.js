// Global variables
const cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing...") // Debug log
  updateCartCount()
  setupEventListeners()
  console.log("Initial cart:", cart) // Debug log
})

// Setup event listeners
function setupEventListeners() {
  console.log("Setting up event listeners...") // Debug log

  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Search icon functionality
  const searchIcon = document.getElementById("search-icon")
  if (searchIcon) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault()
      showNotification("Search functionality coming soon!")
    })
  }

  // Contact form
  const contactForm = document.getElementById("contact-form")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm)
  }

  // Setup modal close for storage and earphone modals
  setupModalClose()
}

function setupModalClose() {
  // Storage modal close
  const storageModal = document.getElementById("storage-modal")
  if (storageModal) {
    const closeBtn = storageModal.querySelector(".close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        storageModal.style.display = "none"
      })
    }
  }

  // Earphone modal close
  const earphoneModal = document.getElementById("earphone-modal")
  if (earphoneModal) {
    const closeBtn = earphoneModal.querySelector(".close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        earphoneModal.style.display = "none"
      })
    }
  }

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })
}

// Cart functions
function addToCart(id, name, price) {
  console.log("Adding to cart:", { id, name, price }) // Debug log

  // Validate inputs
  if (!id || !name || !price) {
    console.error("Invalid product data:", { id, name, price })
    showNotification("Error: Invalid product data")
    return
  }

  try {
    const existingItem = cart.find((item) => item.id === id)

    if (existingItem) {
      existingItem.quantity += 1
      console.log("Updated existing item:", existingItem) // Debug log
    } else {
      const newItem = {
        id: id,
        name: name,
        price: Number(price),
        quantity: 1,
      }
      cart.push(newItem)
      console.log("Added new item:", newItem) // Debug log
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
    console.log("Cart saved to localStorage:", cart) // Debug log

    updateCartCount()
    showNotification(`${name} added to cart!`)
  } catch (error) {
    console.error("Error adding to cart:", error)
    showNotification("Error adding item to cart")
  }
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count")
  console.log("Updating cart count, element found:", !!cartCount) // Debug log

  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
    console.log("Cart count updated to:", totalItems) // Debug log
  } else {
    console.error("Cart count element not found!")
  }
}

// Storage modal for iPhones
function showStorageModal(productId, productName, storageOptions) {
  const modal = document.getElementById("storage-modal")
  const title = document.getElementById("storage-modal-title")
  const container = document.getElementById("storage-options-container")

  if (!modal || !title || !container) return

  title.textContent = `Select Storage for ${productName}`
  container.innerHTML = ""

  storageOptions.forEach((option) => {
    const storage = Object.keys(option)[0]
    const price = Object.values(option)[0]

    const optionBtn = document.createElement("button")
    optionBtn.className = "storage-option-btn"
    optionBtn.innerHTML = `
      <span class="storage-size">${storage}</span>
      <span class="storage-price">₵${price.toLocaleString()}</span>
    `

    optionBtn.addEventListener("click", () => {
      const itemId = `${productId}-${storage.toLowerCase()}`
      const itemName = `${productName} (${storage})`
      addToCart(itemId, itemName, price)
      modal.style.display = "none"
    })

    container.appendChild(optionBtn)
  })

  modal.style.display = "block"
}

// Earphone options modal
function showEarphoneOptions() {
  const modal = document.getElementById("earphone-modal")
  if (modal) {
    modal.style.display = "block"
  }
}

// Contact form handler
function handleContactForm(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const message = {
    id: "MSG-" + Date.now(),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    date: new Date().toISOString(),
    read: false,
  }

  const messages = JSON.parse(localStorage.getItem("messages")) || []
  messages.push(message)
  localStorage.setItem("messages", JSON.stringify(messages))

  e.target.reset()
  showNotification("Message sent successfully! We'll get back to you soon.")
}

function viewProduct(productId) {
  showNotification("Product details page would open here")
}

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

// Make functions globally available
window.addToCart = addToCart
window.showStorageModal = showStorageModal
window.showEarphoneOptions = showEarphoneOptions
window.viewProduct = viewProduct

console.log("Script.js loaded and functions made globally available")
