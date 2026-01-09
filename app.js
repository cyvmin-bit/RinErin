

let allProducts = [];
let isAdminUser = false;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp        // ✅ ADD THIS
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

 

const firebaseConfig = {
  apiKey: "AIzaSyAncQ2x8c4YdCkLLJHSalcmO_Hzxx54UmA",
  authDomain: "rinerin-cookies.firebaseapp.com",
  projectId: "rinerin-cookies",
  appId: "1:302172157228:web:f3287fab84957a4ff7a889"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// RECEIPT ELEMENTS (GLOBAL) 
const rItems = document.getElementById("rItems");
const rOrderId = document.getElementById("rOrderId");
const rName = document.getElementById("rName");
const rEmail = document.getElementById("rEmail");
const rPhone = document.getElementById("rPhone");
const rAddress = document.getElementById("rAddress");
const rPayment = document.getElementById("rPayment");
const rTotal = document.getElementById("rTotal");


const ADMIN_EMAIL = "admin@cookieshop.com"; 


window.show = (id) => {
  // hide ONLY main pages
  const pages = [
    "homepage",
    "productsSection",
    "cart",
    "checkout",
    "receipt",
    "login",
    "register",
    "adminProducts",
    "adminOrders",
    "admin"
  ];

   
  pages.forEach(pid => {
    const el = document.getElementById(pid);
    if (el) el.classList.add("hide");
  });

  // 🔥 CLOSE MOBILE HAMBURGER AFTER CLICK
  document.getElementById("mainMenu")?.classList.remove("active");

  const target = document.getElementById(id);
  if (!target) {
    console.error("Section not found:", id);
    return;
  }

  target.classList.remove("hide");

  // page-specific loaders
  if (id === "productsSection") loadProducts();
  if (id === "adminProducts") loadAdminProducts();
  if (id === "adminOrders") loadAdminOrders(); //NEW ADDED
  if (id === "homepage") loadBestSellers();
  if (id === "cart") loadCart();
};


window.doLogin = async () => {
  loginMsg.textContent = "";

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  // 🔒 BASIC VALIDATION 
  if (!email || !password) {
    loginMsg.textContent = "Please fill in email and password.";
    return;
  }

  if (!isValidEmail(email)) {
    loginMsg.textContent = "Please enter a valid email address.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.classList.add("loading");
  loginBtnText.innerHTML = `<span class="spinner"></span> Logging in...`;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtnText.textContent = "Login";

    show("homepage");

  } catch (e) {
    // 🔥 FRIENDLY ERROR MESSAGES
    window.doLogin = async () => {
  loginMsg.textContent = "";

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  // 🔒 BASIC VALIDATION (NO STRUCTURE CHANGE)
  if (!email || !password) {
    loginMsg.textContent = "Please fill in email and password.";
    return;
  }

  if (!isValidEmail(email)) {
    loginMsg.textContent = "Please enter a valid email address.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.classList.add("loading");
  loginBtnText.innerHTML = `<span class="spinner"></span> Logging in...`;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtnText.textContent = "Login";

    show("homepage");

  } catch (e) {
    // 🔥 FRIENDLY ERROR MESSAGES
    let msg = "Login failed.";

    if (e.code === "auth/user-not-found") {
      msg = "Email is not registered.";
    } else if (e.code === "auth/wrong-password") {
      msg = "Incorrect password.";
    } else if (e.code === "auth/invalid-email") {
      msg = "Invalid email format.";
    } else if (e.code === "auth/too-many-requests") {
      msg = "Too many attempts. Try again later.";
    }

    loginMsg.textContent = msg;

    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtnText.textContent = "Login";
  }
};


    if (e.code === "auth/user-not-found") {
      msg = "Email is not registered.";
    } else if (e.code === "auth/wrong-password") {
      msg = "Incorrect password.";
    } else if (e.code === "auth/invalid-email") {
      msg = "Invalid email format.";
    } else if (e.code === "auth/too-many-requests") {
      msg = "Too many attempts. Try again later.";
    }

    loginMsg.textContent = msg;

    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtnText.textContent = "Login";
  }
};


window.doRegister = async () => {
  regMsg.textContent = "";

  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();

  // 🔒 BASIC VALIDATION
  if (!username || !email || !password) {
    regMsg.textContent = "All fields are required.";
    return;
  }

  if (!isValidEmail(email)) {
    regMsg.textContent = "Please enter a valid email address.";
    return;
  }

  if (password.length < 6) {
    regMsg.textContent = "Password must be at least 6 characters.";
    return;
  }

  registerBtn.disabled = true;
  registerBtn.classList.add("loading");
  registerBtnText.innerHTML = `<span class="spinner"></span> Registering...`;

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      role: "user"
    });

    registerBtn.disabled = false;
    registerBtn.classList.remove("loading");
    registerBtnText.textContent = "Register";

    show("homepage");

  } catch (e) {
    // 🔥 FRIENDLY REGISTER ERRORS
    let msg = "Registration failed.";

    if (e.code === "auth/email-already-in-use") {
      msg = "Email already registered.";
    } else if (e.code === "auth/invalid-email") {
      msg = "Invalid email format.";
    } else if (e.code === "auth/weak-password") {
      msg = "Password is too weak.";
    }

    regMsg.textContent = msg;

    registerBtn.disabled = false;
    registerBtn.classList.remove("loading");
    registerBtnText.textContent = "Register";
  }
};


window.logout = async () => {
  try {
    await signOut(auth);

    // ✅ RESET LOGIN FORM
    loginEmail.value = "";
    loginPassword.value = "";
    loginMsg.textContent = "";

    // ✅ RESET LOGIN BUTTON STATE
    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtnText.textContent = "Login";

    show("homepage");
  } catch (e) {
    console.error("Logout failed:", e);
  }
};


onAuthStateChanged(auth, async (user) => {
  const isAdmin = user && user.email === ADMIN_EMAIL;
  isAdminUser = isAdmin; // 🔥 SAVE ADMIN STATE

  document.querySelectorAll(".admin-only")
    .forEach(el => el.classList.toggle("hide", !isAdmin));

  document.querySelectorAll(".user-only")
    .forEach(el => el.classList.toggle("hide", isAdmin));

  loginLink.classList.toggle("hide", !!user);
  logoutLink.classList.toggle("hide", !user);

  if (user) {
    welcomeUser.classList.remove("hide");

    if (isAdmin) {
      // ✅ ADMIN NAME
      welcomeName.textContent = "Admin";
    } else {
      // ✅ NORMAL USER NAME FROM FI
      // RESTORE
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        welcomeName.textContent = snap.data().username;
      } else {
        welcomeName.textContent = "User";
      }
    }

    loadCart();
  } else {
    isAdminUser = false; // 🔥 reset
    welcomeUser.classList.add("hide");
    cartItems.innerHTML = "";
    cartCount.textContent = "0";
  }
});
//NEW ADDED
async function loadAdminOrders() {
  const adminOrdersList = document.getElementById("adminOrdersList");
  adminOrdersList.innerHTML = "";

  const snap = await getDocs(collection(db, "orders"));

  if (snap.empty) {
    adminOrdersList.innerHTML = "<p>No orders yet.</p>";
    return;
  }

  snap.forEach(docSnap => {
    const o = docSnap.data();

    let itemsHTML = "";
    o.items.forEach(i => {
      itemsHTML += `
        <li>${i.name} × ${i.quantity} (RM ${i.price})</li>
      `;
    });

    adminOrdersList.innerHTML += `
      <div class="order-card">
        <h4>Order ID: ${o.orderId}</h4>

        <p><strong>Name:</strong> ${o.name}</p>
        <p><strong>Email:</strong> ${o.email}</p>
        <p><strong>Phone:</strong> ${o.phone}</p>
        <p><strong>Address:</strong> ${o.address}</p>
        <p><strong>Payment:</strong> ${o.paymentMethod}</p>

        <ul>${itemsHTML}</ul>

        <p class="order-total">
          <strong>Total:</strong> RM ${o.total.toFixed(2)}
        </p>

        ${o.status.toUpperCase()}
      </div>
    `;
  });
}


const loadProducts = async()=> {
  products.innerHTML = "";
  allProducts = []; // reset

  const snap = await getDocs(collection(db,"products"));

  snap.forEach(d=>{
    const p = d.data();
    allProducts.push(p);   // ✅ save product

products.innerHTML += `
  <div class="card">
    <div class="card-img" onclick="openProduct(${allProducts.length - 1})">
      <img src="${p.imageUrl || 'https://picsum.photos/300'}">
    </div>

    <div class="p">
      <h4 onclick="openProduct(${allProducts.length - 1})">${p.name}</h4>

      <div class="price-row">
        <span class="price">RM ${p.price}</span>

        <div class="cart-btn"
          data-tooltip="RM ${p.price}"
          onclick="addToCartAndGo(${allProducts.length - 1})">

  <div class="cart-btn-wrapper">
    <div class="cart-text">Add To Cart</div>

    <div class="cart-icon">
      <svg xmlns="http://www.w3.org/2000/svg"
        width="22" height="22" fill="currentColor"
        viewBox="0 0 16 16">
        <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5z"/>
        <path d="M5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
      </svg>
    </div>
  </div>
</div>

      </div>
    </div>
  </div>
`;

  });
};

const loadAdminProducts = async () => {
  adminProductGrid.innerHTML = "";

  const snap = await getDocs(collection(db,"products"));

  snap.forEach(d => {
    const p = d.data();

    adminProductGrid.innerHTML += `
      <div class="card">
        <div class="card-img">
          <img src="${p.imageUrl || 'https://picsum.photos/300'}">
        </div>

        <div class="p">
          <h4>${p.name}</h4>
          <span class="price">RM ${p.price}</span>

          <div class="row space-between">
<div class="row">
  <button class="admin-icon-btn" onclick="openEditProduct('${d.id}')">
    <img src="edit.png" alt="Edit">
  </button>

  <button class="admin-icon-btn" onclick="delP('${d.id}')">
    <img src="delete.png" alt="Delete">
  </button>
</div>


  <button class="star-btn ${p.isBestSeller ? 'active' : ''}"
    onclick="toggleBestSeller('${d.id}', ${!!p.isBestSeller})">
    ★
  </button>
</div>

        </div>
      </div>
    `;
  });
};

window.toggleBestSeller = async (id, current) => {
  await updateDoc(doc(db, "products", id), {
    isBestSeller: !current
  });


  loadAdminProducts();   // refresh admin
  loadBestSellers();     // 🔥 refresh homepage
};

const loadBestSellers = async () => {
  bestSellerList.innerHTML = "";

  // 🔥 Make sure products are loaded for guests
  if (allProducts.length === 0) {
    await loadProducts();
  }

  const snap = await getDocs(collection(db, "products"));

  snap.forEach(d => {
    const p = d.data();
    if (!p.isBestSeller) return; // ⭐ ONLY starred

  const index = allProducts.findIndex(
    item => item.name === p.name
);

    bestSellerList.innerHTML += `
      <div class="show-card ${isAdminUser ? 'disabled' : ''}"
           ${isAdminUser ? '' : `onclick="openProduct(${index})"`}>
        <img src="${p.imageUrl || 'https://picsum.photos/300'}">
      </div>
    `;
  });
};

window.addToCartAndGo = async (index) => {
  const p = allProducts[index];

  if (!p) {
    console.error("Product not found");
    return;
  }

  if (!auth.currentUser) {
    alert("Please login to add items to your cart.");
    closeModal();          // ✅ close modal
    show("login");
    return;
  }

  await addToCart(p);

  closeModal();            // ✅ CLOSE PRODUCT DETAIL MODAL
  show("cart");            // ✅ then go to cart
};

window.addToCart = async (p) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to add items to your cart.");
    show("login");
    return;
  }

  const cartRef = doc(db, "users", user.uid, "cart", p.name);

  const snap = await getDoc(cartRef);

  if (snap.exists()) {
    // increase quantity
    await updateDoc(cartRef, {
      quantity: snap.data().quantity + 1
    });
  } else {
    // add new item
    await setDoc(cartRef, {
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl || "",
      quantity: 1
    });
  }

};

 
async function loadCart() {
  const user = auth.currentUser;
  if (!user) return;

  cartItems.innerHTML = "";
  let total = 0;
  let count = 0;

  const snap = await getDocs(
    collection(db, "users", user.uid, "cart")
  );

  snap.forEach(docSnap => {
    const item = docSnap.data();
    const itemTotal = item.price * item.quantity;

    total += itemTotal;
    count += item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">
        <input type="checkbox" class="cart-check" data-id="${docSnap.id}">


        <img src="${item.imageUrl || 'https://picsum.photos/80'}">

        <div class="cart-info">
          <h4>${item.name}</h4>
          <span>RM ${item.price}</span>
          <div class="cart-qty">
            Qty:
            <input type="number" min="1"
              value="${item.quantity}"
              onchange="updateQty('${docSnap.id}', this.value)">
          </div>
        </div>

        <div class="cart-price">
          RM ${itemTotal.toFixed(2)}
        </div>

        <button class="cart-remove"
          onclick="removeItem('${docSnap.id}')">🗑</button>
      </div>
    `;
  });

  // 🔥 TOGGLE UI BASED ON CART STATE
  if (count === 0) {
    emptyCartMsg.classList.remove("hide");
    removeAllBtn.classList.add("hide");
    checkoutBtn.classList.add("hide");
  } else {
    emptyCartMsg.classList.add("hide");
    removeAllBtn.classList.remove("hide");
    checkoutBtn.classList.remove("hide");
  }

  cartCount.textContent = count;
}
window.updateQty = async (id, qty) => {
  const user = auth.currentUser;
  if (!user || qty < 1) return;

  await updateDoc(
    doc(db, "users", user.uid, "cart", id),
    { quantity: Number(qty) }
  );

  loadCart();
};

window.clearCart = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await getDocs(
    collection(db, "users", user.uid, "cart")
  );

  snap.forEach(d => deleteDoc(d.ref));

  loadCart();
};

window.removeItem = async (id) => {
  const user = auth.currentUser;
  if (!user) return;

  await deleteDoc(
    doc(db, "users", user.uid, "cart", id)
  );

  loadCart();
};


window.pay=async(ok)=>{
  if(!ok){ payMsg.textContent="Payment Failed"; return; }
const user = auth.currentUser;
const snap = await getDocs(
  collection(db, "users", user.uid, "cart")
);

snap.forEach(d => deleteDoc(d.ref));

loadCart();
show("confirm");

};

window.addProduct=async()=>{
  await addDoc(collection(db,"products"),{
    name:pName.value,
    price:Number(pPrice.value),
    imageUrl:pImg.value,
    description:pDesc.value
  });
  loadProducts(); loadAdmin();
};

window.goToProducts = () => {
  show("productsSection");
};

window.openProduct = (index) => {
  const p = allProducts[index];

  mImg.src = p.imageUrl || "https://picsum.photos/400";
  mName.textContent = p.name;
  mDesc.textContent = p.description || "";
  mPrice.textContent = "RM " + p.price;

  modalCartBtn.setAttribute("data-tooltip", "RM " + p.price);

  // 🔥 EXACT SAME BEHAVIOR AS PRODUCT PAGE
  modalCartBtn.onclick = () => addToCartAndGo(index);

  productModal.classList.remove("hide");
};

window.closeModal = () => {
  productModal.classList.add("hide");
};

productModal.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) {
    closeModal();
  }
});




window.openFromBestSeller = async (productName) => {
  if (isAdminUser) return; // 🚫 ADMIN: DO NOTHING

  if (allProducts.length === 0) {
    await loadProducts();
  }

  const index = allProducts.findIndex(
    p => p.name.toLowerCase() === productName.toLowerCase()
  );

  if (index === -1) {
    alert("Product not found");
    return;
  }

  openProduct(index); // ✅ PASS INDEX
};



const loadAdmin=async()=>{
  adminProducts.innerHTML="";
  (await getDocs(collection(db,"products"))).forEach(d=>{
    const p=d.data();
    adminProducts.innerHTML+=`
    <tr><td>${p.name}</td><td>RM${p.price}</td>
    <td><button onclick="delP('${d.id}')">Delete</button></td></tr>`;
  });

  adminOrders.innerHTML="";
  (await getDocs(collection(db,"orders"))).forEach(d=>{
    adminOrders.innerHTML+=`<tr><td>${d.id}</td><td>${d.data().status}</td></tr>`;
  });
};

window.delP = async (id) => {
  const ok = confirm("Are you sure you want to delete this product?");
  if (!ok) return;

  await deleteDoc(doc(db, "products", id));
  loadAdminProducts();
  loadProducts();
  loadBestSellers();
};


let editingProductId = null;

window.openEditProduct = async (id) => {
  editingProductId = id;

  const snap = await getDocs(collection(db, "products"));
  snap.forEach(d => {
    if (d.id === id) {
      const p = d.data();
      editName.value = p.name;
      editPrice.value = p.price;
      editImg.value = p.imageUrl || "";
      editDesc.value = p.description || "";
    }
  });
  updatePreview();
  editModal.classList.remove("hide");
};


window.updatePreview = () => {
  if (!editImg.value) {
    editPreview.style.display = "none";
    return;
  }

  editPreview.src = editImg.value;
  editPreview.style.display = "block";
};

window.closeEditModal = () => {
  editModal.classList.add("hide");
};

window.saveEdit = async () => {
  await updateDoc(doc(db, "products", editingProductId), {
    name: editName.value,
    price: Number(editPrice.value),
    imageUrl: editImg.value,
    description: editDesc.value
  });

  closeEditModal();
  loadAdminProducts();
  loadProducts();
  loadBestSellers();
};

window.openAddModal = () => {
  addName.value = "";
  addPrice.value = "";
  addImg.value = "";
  addDesc.value = "";
  addPreview.style.display = "none";

  addModal.classList.remove("hide");
};

window.closeAddModal = () => {
  addModal.classList.add("hide");
};

window.updateAddPreview = () => {
  if (!addImg.value) {
    addPreview.style.display = "none";
    return;
  }

  addPreview.src = addImg.value;
  addPreview.style.display = "block";
};

window.saveAddProduct = async () => {
  await addDoc(collection(db, "products"), {
    name: addName.value,
    price: Number(addPrice.value),
    imageUrl: addImg.value,
    description: addDesc.value,
    isBestSeller: false
  });

  closeAddModal();
  loadAdminProducts();
  loadProducts();
  loadBestSellers();
};


// ===============================
// CHECKOUT FORM VALIDATION
// ===============================
function isValidEmail(email) {
  // simple & safe email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Malaysia format: 01XXXXXXXX (10–11 digits)
  return /^01\d{8,9}$/.test(phone);
}


//submit checkout
window.submitCheckout = async () => {
  payMsg.textContent = "";

  const name = custName.value.trim();
  const email = custEmail.value.trim();
  const phone = custPhone.value.trim();
  const address = custAddress.value.trim();
  const paymentEl = document.querySelector('input[name="payment"]:checked');

  if (!name || !email || !phone || !address || !paymentEl) {
  payMsg.textContent =
    "Please fill in all details and select a payment method.";
  return;
}

let errors = [];

if (!isValidEmail(email)) {
  errors.push("• Invalid email address");
}

if (!isValidPhone(phone)) {
  errors.push("• Invalid phone number (01XXXXXXXX)");
}

if (errors.length > 0) {
  payMsg.innerHTML = errors.join("<br>");
  return;
}


  const checkedBoxes = document.querySelectorAll(".cart-check:checked");

  if (checkedBoxes.length === 0) {
    payMsg.textContent = "Please select at least one item to checkout.";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    show("login");
    return;
  }

  let total = 0;
  let items = [];

  rItems.innerHTML = "";

  // 🔥 LOOP ONLY SELECTED ITEMS
  for (const box of checkedBoxes) {
    const docId = box.dataset.id;
    const itemSnap = await getDoc(
      doc(db, "users", user.uid, "cart", docId)
    );

    if (!itemSnap.exists()) continue;

    const item = itemSnap.data();
    const itemTotal = item.price * item.quantity;

    total += itemTotal;

    items.push({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    });

    rItems.innerHTML += `
      <div class="receipt-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>RM ${itemTotal.toFixed(2)}</span>
      </div>
    `;
  }

  const orderId = "ORD" + Date.now();

  await setDoc(doc(db, "orders", orderId), {
    orderId,
    userId: user.uid,
    name,
    email,
    phone,
    address,
    paymentMethod: paymentEl.value,
    items,
    total,
    status: "paid",
    createdAt: serverTimestamp()
  });

  // Receipt info
  rOrderId.textContent = orderId;
  rName.textContent = name;
  rEmail.textContent = email;
  rPhone.textContent = phone;
  rAddress.textContent = address;
  rPayment.textContent = paymentEl.value;
  rTotal.textContent = total.toFixed(2);

  // 🔥 REMOVE ONLY SELECTED ITEMS FROM CART
  for (const box of checkedBoxes) {
    await deleteDoc(
      doc(db, "users", user.uid, "cart", box.dataset.id)
    );
  }

  loadCart();
  show("receipt");
};

window.toggleMenu = () => {
  document.getElementById("mainMenu")
    .classList.toggle("active");
};

// ========== PRINT & DOWNLOAD FUNCTIONS ==========

window.printReceipt = () => {
  window.print();
};

window.downloadReceiptPDF = () => {
  const orderId = document.getElementById("rOrderId").textContent;
  const name = document.getElementById("rName").textContent;
  const email = document.getElementById("rEmail").textContent;
  const phone = document.getElementById("rPhone").textContent;
  const address = document.getElementById("rAddress").textContent;
  const payment = document.getElementById("rPayment").textContent;
  const items = document.getElementById("rItems").textContent;
  const total = document.getElementById("rTotal").textContent;

  // Create a temporary div to hold the receipt content
  const receiptContent = document.createElement("div");
  receiptContent.style.padding = "20px";
  receiptContent.style.fontFamily = "Arial, sans-serif";
  receiptContent.innerHTML = `
    <h2 style="text-align: center; color: #8b5a2b; margin-bottom: 20px;">Order Confirmed 🎉</h2>
    <p style="text-align: center; color: #666; margin-bottom: 20px;">Thank you for your purchase</p>
    
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>Order ID</strong></td>
          <td style="padding: 8px 0; text-align: right;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Name</strong></td>
          <td style="padding: 8px 0; text-align: right;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Email</strong></td>
          <td style="padding: 8px 0; text-align: right;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Phone</strong></td>
          <td style="padding: 8px 0; text-align: right;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Address</strong></td>
          <td style="padding: 8px 0; text-align: right;">${address}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Payment</strong></td>
          <td style="padding: 8px 0; text-align: right;">${payment}</td>
        </tr>
      </table>
    </div>

    <hr style="border: none; border-top: 1px dashed #ddd; margin: 20px 0;">

    <div style="margin: 20px 0;">
      ${items}
    </div>

    <hr style="border: none; border-top: 1px dashed #ddd; margin: 20px 0;">

    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #8b5a2b; margin-top: 20px;">
      <span>Total</span>
      <span>RM ${total}</span>
    </div>

    <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
      This is your receipt. Please keep it for your records.
    </p>
  `;

  // Use html2canvas and jsPDF if available, otherwise use a simple print approach
  if (typeof html2pdf !== 'undefined') {
    html2pdf().setPaper('a4').setMargin(10).fromElement(receiptContent).save(`Receipt_${orderId}.pdf`);
  } else {
    // Fallback: Create a simple text-based download
    const txtContent = `
RIN ERIN COOKIES - ORDER RECEIPT
================================

Order Confirmed 🎉
Thank you for your purchase

ORDER ID:  ${orderId}
NAME:      ${name}
EMAIL:     ${email}
PHONE:     ${phone}
ADDRESS:   ${address}
PAYMENT:   ${payment}

================================
ITEMS:
${items}

================================
TOTAL: RM ${total}

This is your receipt. Please keep it for your records.
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent));
    element.setAttribute('download', `Receipt_${orderId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};


show("homepage");


