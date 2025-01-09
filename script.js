
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const errorMessage = document.getElementById("error-message");
const walletBalance= document.getElementById("wallet-balance");
const totalSpend= document.getElementById("total-spend");
const transactionHistory = document.getElementById("transaction-history");
const productList = document.getElementById("product-list");

let currentUser = null;
let sessionTimeout = null;

const products = [
    { name: "Shoes", price: 50 },
    { name: "T-shirt", price: 20 },
    { name: "Jeans", price: 40 },
    { name: "Watch", price: 70 },
    { name: "Bag", price: 30 }
];

const renderTransactionHistory = () => {
    const users = getUsers();
    const history = users[currentUser].transactions.slice(-5);
    transactionHistory.textContent="";
    history.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        transactionHistory.appendChild(li);
    });
};
const updateWalletDisplay = () => {
    const users = getUsers();
    walletBalance.textContent = `$${users[currentUser].wallet}`;
    totalSpend.textContent = `$${users[currentUser].totalSpend}`;
};
document.getElementById("add-funds-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("add-funds").value);

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
    }

    const users = getUsers();
    const user = users[currentUser];
    user.wallet += amount;
    user.transactions.push(`Added $${amount} to wallet on ${new Date().toLocaleString()}`);
    saveUsers(users);
    updateWalletDisplay();
    renderTransactionHistory();
});
const purchase = (productIndex) => {
    // console.log(productIndex);
    const users = getUsers();
    const product = products[productIndex];
    const user = users[currentUser];

    if (user.wallet < product.price) {
        alert("tiye ney eddur :'( ");
        return;
    }
    alert("kine felsi bhai... :D");
    user.wallet -= product.price;
    user.totalSpend+=product.price;
    user.transactions.push(`Bought ${product.name} for $${product.price} on ${new Date().toLocaleString()}`);
    saveUsers(users);
    updateWalletDisplay();
    renderTransactionHistory();
};
const renderProducts = () => {
    productList.innerHTML = "";
    products.forEach((product, index) => {
        const li = document.createElement("li");
        li.classList.add("flex", "justify-between", "items-center", "p-2", "border", "rounded-lg");
        li.innerHTML = `
            <span>${product.name} - $${product.price}</span>
            <button class="bg-green-500 text-white px-3 py-1 rounded-lg" onclick="purchase(${index})">Buy</button>
        `;
        productList.appendChild(li);
    });
};

const getUsers = () => JSON.parse(localStorage.getItem("users")) || {};
const saveUsers = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
};
function showError(msg) {
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = msg;
}
function logout() {
    currentUser = null;
    localStorage.setItem("currentSessionUser","");
    authSection.classList.remove("hidden");
    dashboard.classList.add("hidden");
};
document.getElementById("logout-btn").addEventListener("click", logout);
const startSessionTimeout = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        alert("bout kinakati hoiyee, ber oo odo...");
        logout();
    }, 180*1000);
};
const login = (username, password) => {
    const users = getUsers();
    
    if (!users[username] || users[username].password !== password) {
        showError("Invalid username or password.");
        return;
    }

    currentUser = username;
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    localStorage.setItem("currentSessionUser", JSON.stringify(username));

    document.getElementById("welcome-msg").textContent = `Welcome, ${username}!`;
    updateWalletDisplay();
    renderProducts();
    renderTransactionHistory();
    startSessionTimeout();
};
document.getElementById("login-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    login(username, password);
});

document.getElementById("register-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    if (!username || !password) {
        showError("Please fill out all fields.");
        return;
    }
    
    const users = getUsers();
    if (users[username]) {
        showError("Username already exists.");
        return;
    }
    localStorage.setItem("currentSessionUser", JSON.stringify(username));
    errorMessage.classList.add("hidden");
    users[username] = { wallet: 0,totalSpend: 0, transactions: [], password };
    saveUsers(users);
    alert("Registration successful! Please log in.");
});

let currentSessionUser = JSON.parse(localStorage.getItem("currentSessionUser"));

window.addEventListener("load",()=>{
    if(currentSessionUser!==""){
        const users = getUsers();
        for(const userName in users){
            if(userName===currentSessionUser){
                login(userName,users[userName].password);
            }
        }
    }
});