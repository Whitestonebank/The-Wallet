// DISCLAIMER: This wallet is for educational purposes only.

const adminUsername = "theresamatt";
const adminPassword = "giveaway";
const GAS_FEE_BTC = 700;
const GAS_FEE_BTC_USD = 670.45;

const coins = {
  BTC: {
    name: "Bitcoin",
    icon: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#f7931a"/><path fill="#fff" d="M19.4 16.2c.3-2-.9-3-2.9-3.7l.6-2.3-1.4-.4-.6 2.4c-.4-.1-.8-.2-1.3-.3l.6-2.4-1.4-.4-.6 2.3c-.4-.1-.7-.2-1-.3l.01-.03-3.5-.9-.7 2.6s1 .2 1 .3c.5.1.6.4.6.6-.1.4-.6 1.3-.9 1.6l.01.02-1.3 5.1c.1 0 .3 0 .5.1l-.5-.1.9 2.8c.7.2 1.5.4 2.3.5l-.6 2.3 1.4.4.6-2.4c.8.1 1.5.1 2.3.1 2.9 0 4.9-1.5 5.5-3.7.3-1.3 0-2.1-1-2.6.7-.2 1.3-.8 1.5-1.9zm-3 5c-1.3.3-2.5-.7-3-1.3l.6-2.3c.4.3 1 .6 1.8.6 1.3 0 2.2-.7 2.5-1.6.2.8-.1 2-1.2 3.1zm.7-4.5c-1.2 0-2-.6-2.2-1.4l.4-1.5c.5.2 1.1.4 1.7.4 1 0 1.8-.5 2.1-1.3.2.7-.2 1.5-1.4 2.8z"/></svg>`
  },
  ETH: {
    name: "Ethereum",
    icon: `<svg viewBox="0 0 32 32"><linearGradient id="a" x1="16" x2="16" y1="0" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#627eea"/><stop offset="1" stop-color="#041836"/></linearGradient><path fill="url(#a)" d="M16 0L6 18l10 6 10-6z"/><path fill="#fff" d="M16 0v24l10-6z"/></svg>`
  },
  LTC: {
    name: "Litecoin",
    icon: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#b8b8b8"/><path fill="#fff" d="M22 7h-3.4l-1.6 5.4-1-4h-4.6l-1.6 5.5-1-4h-3v3h1.5l-2.3 8.5h3.1l2.3-8.5 1 4h4.6l2.5-8.5h2z"/></svg>`
  },
  USDT: {
    name: "Tether",
    icon: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#26a17b"/><path fill="#fff" d="M20.9 11h-3.9l-1.3 4.2-1.3-4.2h-4.1v2.9h1.5l-2.8 8.3h3.1l2.7-7.9 1.4 4.3h3.5v-3h-2.8z"/></svg>`
  },
  BNB: {
    name: "Binance Coin",
    icon: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#f3ba2f"/><path fill="#fff" d="M16 11.6l-5.7 4.2 5.7 4.2 5.7-4.2zM16 7l-9 6.7 9 6.7 9-6.7z"/></svg>`
  }
};

let prices = {};
let currentUser = null;
let selectedCoin = "BTC";

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function initUsers() {
  const users = getUsers();
  if (!users[adminUsername]) {
    users[adminUsername] = {
      password: adminPassword,
      balances: {
        BTC: 30000000 / 27000,  // Rough BTC price ~27k => ~1111 BTC
        ETH: 30000000 / 1800,
        LTC: 30000000 / 90,
        USDT: 15000000,
        BNB: 30000000 / 300,
      },
      transactions: [],
    };
    saveUsers(users);
  }
}

function showMessage(elementId, message, type = "red") {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `message ${type}`;
}

function clearMessages() {
  ["auth-message", "send-message", "externalMessage"].forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      el.textContent = "";
      el.className = "message";
    }
  });
}

function register() {
  clearMessages();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    showMessage("auth-message", "Enter username and password", "yellow");
    return;
  }
  if (username === adminUsername) {
    showMessage("auth-message", "This username is reserved", "red");
    return;
  }
  const users = getUsers();
  if (users[username]) {
    showMessage("auth-message", "User already exists", "yellow");
    return;
  }
  users[username] = {password, balances: {}, transactions: []};
  saveUsers(users);
  showMessage("auth-message", "Registered! Please login.", "green");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

function login() {
  clearMessages();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    showMessage("auth-message", "Enter username and password", "yellow");
    return;
  }
  const users = getUsers();
  if (!users[username] || users[username].password !== password) {
    showMessage("auth-message", "Invalid credentials", "red");
    return;
  }
  currentUser = username;
  localStorage.setItem("currentUser", currentUser);
  loadDashboard();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("auth-container").classList.remove("hidden");
  clearMessages();
  resetInputs();
}

function resetInputs() {
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("recipient").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("externalWallet").value = "";
  document.getElementById("amountInUSD").value = "";
  clearMessages();
}

function loadDashboard() {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  currentUser = localStorage.getItem("currentUser");
  updateUserLabel();
  loadCoinList();
  selectCoin(selectedCoin);
  updatePrices();
}

function updateUserLabel() {
  document.getElementById("userDisplay").textContent = `Logged in as: ${currentUser}`;
}

function loadCoinList() {
  const ul = document.getElementById("coinList");
  ul.innerHTML = "";
  Object.entries(coins).forEach(([symbol, coin]) => {
    const li = document.createElement("li");
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.dataset.coin = symbol;
    li.innerHTML = `${coin.icon}<span>${symbol}</span>`;
    if (symbol === selectedCoin) li.classList.add("selected");
    li.onclick = () => selectCoin(symbol);
    li.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCoin(symbol);
      }
    };
    ul.appendChild(li);
  });
}

function selectCoin(symbol) {
  selectedCoin = symbol;
  // Highlight selection
  document.querySelectorAll("#coinList li").forEach(li => {
    li.classList.toggle("selected", li.dataset.coin === symbol);
  });
  // Update dashboard header & balance
  const coin = coins[symbol];
  document.getElementById("coinTitle").textContent = coin.name;
  document.getElementById("coinBalance").textContent = getBalance(symbol).toFixed(6);
  document.getElementById("coinUSD").textContent = (getBalance(symbol) * getPrice(symbol)).toFixed(2);
  document.getElementById("gasFee").textContent = GAS_FEE_BTC;
  document.getElementById("gasFeeUSD").textContent = GAS_FEE_BTC_USD;
  updateTransactionHistory();
}

function getBalance(symbol) {
  const users = getUsers();
  const user = users[currentUser];
  return user?.balances[symbol] || 0;
}

function getPrice(symbol) {
  // Placeholder: real API fetch can be integrated
