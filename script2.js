const app = {
    elements: {
      authSection: document.getElementById("auth-section"),
      dashboard: document.getElementById("dashboard"),
      errorMessage: document.getElementById("error-message"),
      walletBalance: document.getElementById("wallet-balance"),
      totalSpend: document.getElementById("total-spend"),
      transactionHistory: document.getElementById("transaction-history"),
      productList: document.getElementById("product-list"),
      addFundsBtn: document.getElementById("add-funds-btn"),
      logoutBtn: document.getElementById("logout-btn"),
      loginBtn: document.getElementById("login-btn"),
      registerBtn: document.getElementById("register-btn"),
    },
    currentUser: null,
    sessionTimeout: null,
    products: [
      { name: "Shoes", price: 50 },
      { name: "T-shirt", price: 20 },
      { name: "Jeans", price: 40 },
      { name: "Watch", price: 70 },
      { name: "Bag", price: 30 },
    ],
    init() {
      this.elements.addFundsBtn.addEventListener("click", this.addFunds.bind(this));
      this.elements.logoutBtn.addEventListener("click", this.logout.bind(this));
      this.elements.loginBtn.addEventListener("click", this.handleLogin.bind(this));
      this.elements.registerBtn.addEventListener("click", this.handleRegister.bind(this));
    },
    getUsers() {
      return JSON.parse(localStorage.getItem("users")) || {};
    },
    saveUsers(users) {
      localStorage.setItem("users", JSON.stringify(users));
    },
    showError(msg) {
      this.elements.errorMessage.classList.remove("hidden");
      this.elements.errorMessage.textContent = msg;
    },
    logout() {
      this.currentUser = null;
      this.elements.authSection.classList.remove("hidden");
      this.elements.dashboard.classList.add("hidden");
    },
    renderTransactionHistory() {
      const users = this.getUsers();
      const history = users[this.currentUser].transactions.slice(-5);
      this.elements.transactionHistory.textContent = "";
      history.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        this.elements.transactionHistory.appendChild(li);
      });
    },
    updateWalletDisplay() {
      const users = this.getUsers();
      this.elements.walletBalance.textContent = `$${users[this.currentUser].wallet}`;
      this.elements.totalSpend.textContent = `$${users[this.currentUser].totalSpend}`;
    },
    addFunds() {
      const amount = parseFloat(document.getElementById("add-funds").value);
      if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
      }
      const users = this.getUsers();
      const user = users[this.currentUser];
      user.wallet += amount;
      user.transactions.push(`Added $${amount} to wallet on ${new Date().toLocaleString()}`);
      this.saveUsers(users);
      this.updateWalletDisplay();
      this.renderTransactionHistory();
    },
    purchase(productIndex) {
      const users = this.getUsers();
      const product = this.products[productIndex];
      const user = users[this.currentUser];
      if (user.wallet < product.price) {
        alert("Insufficient funds.");
        return;
      }
      user.wallet -= product.price;
      user.totalSpend += product.price;
      user.transactions.push(`Bought ${product.name} for $${product.price} on ${new Date().toLocaleString()}`);
      this.saveUsers(users);
      this.updateWalletDisplay();
      this.renderTransactionHistory();
    },
    renderProducts() {
      this.elements.productList.innerHTML = "";
      this.products.forEach((product, index) => {
        const li = document.createElement("li");
        li.classList.add("flex", "justify-between", "items-center", "p-2", "border", "rounded-lg");
        li.innerHTML = `
          <span>${product.name} - $${product.price}</span>
          <button class="bg-green-500 text-white px-3 py-1 rounded-lg" onclick="app.purchase(${index})">Buy</button>
        `;
        this.elements.productList.appendChild(li);
      });
    },
    handleLogin() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      this.login(username, password);
    },
    login(username, password) {
      const users = this.getUsers();
      if (!users[username] || users[username].password !== password) {
        this.showError("Invalid username or password.");
        return;
      }
      this.currentUser = username;
      this.elements.authSection.classList.add("hidden");
      this.elements.dashboard.classList.remove("hidden");
      document.getElementById("welcome-msg").textContent = `Welcome, ${username}!`;
      this.updateWalletDisplay();
      this.renderProducts();
      this.renderTransactionHistory();
      this.startSessionTimeout();
    },
    handleRegister() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      if (!username || !password) {
        this.showError("Please fill out all fields.");
        return;
      }
      const users = this.getUsers();
      if (users[username]) {
        this.showError("Username already exists.");
        return;
      }
      this.elements.errorMessage.classList.add("hidden");
      users[username] = { wallet: 0, totalSpend: 0, transactions: [], password };
      this.saveUsers(users);
      alert("Registration successful! Please log in.");
    },
    startSessionTimeout() {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = setTimeout(() => {
        alert("Session expired, please log in again.");
        this.logout();
      }, 180 * 1000);
    },
  };
  
  window.addEventListener("load", () => {
    app.init();
  });