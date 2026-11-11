// ===== Helpers (localStorage as a fake database) =====
const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const getBlogs = () => JSON.parse(localStorage.getItem("blogs") || "null");
const saveBlogs = (b) => localStorage.setItem("blogs", JSON.stringify(b));
const getCurrentUser = () => JSON.parse(localStorage.getItem("currentUser") || "null");

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=60";

// Sample blogs so the Home page is not empty at first
function seedBlogs() {
  if (getBlogs() === null) {
    saveBlogs([
      {
        id: 1,
        title: "Getting Started with HTML",
        category: "Technology",
        content: "HTML is the skeleton of every web page. Learn tags, forms and links to build your first page.",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=60",
        author: "Admin",
        email: "admin@blog.com",
        date: "2026-11-10",
      },
      {
        id: 2,
        title: "CSS Flexbox Made Easy",
        category: "Design",
        content: "Flexbox helps you align and distribute space between items in a row or column with very little code.",
        image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=60",
        author: "Admin",
        email: "admin@blog.com",
        date: "2026-11-11",
      },
      {
        id: 3,
        title: "Why JavaScript Matters",
        category: "Programming",
        content: "JavaScript brings your pages to life. Handle clicks, validate forms and update the DOM dynamically.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
        author: "Admin",
        email: "admin@blog.com",
        date: "2026-11-12",
      },
    ]);
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = "message " + type;
}

// ===== Navbar (mobile toggle + login/logout links) =====
function setupNavbar() {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  const authArea = document.getElementById("authLinks");
  if (!authArea) return;
  const user = getCurrentUser();
  if (user) {
    authArea.innerHTML = `
      <li><a href="dashboard.html">Dashboard</a></li>
      <li><a href="#" id="logoutLink">Logout (${escapeHTML(user.name)})</a></li>`;
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  } else {
    authArea.innerHTML = `
      <li><a href="login.html">Login</a></li>
      <li><a href="register.html" class="nav-cta">Register</a></li>`;
  }
}

// ===== Home page: show all blogs =====
const catClass = (c) => "cat-" + String(c).toLowerCase().replace(/[^a-z]/g, "");

function loadHome() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;
  const blogs = (getBlogs() || []).slice().reverse();
  const filterBox = document.getElementById("filters");
  let active = "All";

  function render() {
    const list = active === "All" ? blogs : blogs.filter((b) => b.category === active);
    if (list.length === 0) {
      grid.innerHTML =
        '<p class="empty">No blogs in this category yet. <a href="create-blog.html">Write the first one.</a></p>';
      return;
    }
    grid.innerHTML = list
      .map(
        (b) => `
      <article class="card ${catClass(b.category)}">
        <div class="card-img">
          <img src="${escapeHTML(b.image || DEFAULT_IMG)}" alt="${escapeHTML(b.title)}" onerror="this.src='${DEFAULT_IMG}'" />
        </div>
        <div class="card-body">
          <span class="tag">${escapeHTML(b.category)}</span>
          <h3>${escapeHTML(b.title)}</h3>
          <p>${escapeHTML(b.content.length > 110 ? b.content.slice(0, 110) + "..." : b.content)}</p>
          <div class="meta">
            <span class="avatar">${escapeHTML(b.author.charAt(0).toUpperCase())}</span>
            ${escapeHTML(b.author)} on ${escapeHTML(b.date)}
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  if (filterBox) {
    const cats = ["All", ...new Set(blogs.map((b) => b.category))];
    filterBox.innerHTML = cats
      .map((c) => `<button class="filter${c === "All" ? " active" : ""}" data-cat="${escapeHTML(c)}">${escapeHTML(c)}</button>`)
      .join("");
    filterBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      active = btn.dataset.cat;
      filterBox.querySelectorAll(".filter").forEach((f) => f.classList.toggle("active", f === btn));
      render();
    });
  }
  render();
}

// ===== Register =====
function setupRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;
  const msg = document.getElementById("message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (!name || !email || !password || !confirm) {
      return showMessage(msg, "Please fill in all fields.", "error");
    }
    if (password.length < 6) {
      return showMessage(msg, "Password must be at least 6 characters.", "error");
    }
    if (password !== confirm) {
      return showMessage(msg, "Passwords do not match.", "error");
    }
    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      return showMessage(msg, "This email is already registered.", "error");
    }

    users.push({ name, email, password });
    saveUsers(users);
    showMessage(msg, "Registration successful! Redirecting to login...", "success");
    setTimeout(() => (window.location.href = "login.html"), 1200);
  });
}

// ===== Login =====
function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  const msg = document.getElementById("message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    if (!email || !password) {
      return showMessage(msg, "Please enter email and password.", "error");
    }
    const user = getUsers().find((u) => u.email === email && u.password === password);
    if (!user) {
      return showMessage(msg, "Invalid email or password.", "error");
    }

    localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = "dashboard.html";
  });
}

// ===== Dashboard =====
function loadDashboard() {
  const body = document.getElementById("blogTableBody");
  if (!body) return;
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("welcome").textContent = "Welcome, " + user.name + "!";
  const all = getBlogs() || [];
  const mine = all.filter((b) => b.email === user.email);

  document.getElementById("statMine").textContent = mine.length;
  document.getElementById("statAll").textContent = all.length;
  document.getElementById("statCats").textContent = new Set(mine.map((b) => b.category)).size;

  if (mine.length === 0) {
    body.innerHTML =
      '<tr><td colspan="4" class="empty">You have not published any blogs yet. <a href="create-blog.html">Write your first blog.</a></td></tr>';
    return;
  }
  body.innerHTML = mine
    .map(
      (b) => `
      <tr>
        <td>${escapeHTML(b.title)}</td>
        <td><span class="tag ${catClass(b.category)}">${escapeHTML(b.category)}</span></td>
        <td>${escapeHTML(b.date)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteBlog(${b.id})">Delete</button></td>
      </tr>`
    )
    .join("");
}

function deleteBlog(id) {
  if (!confirm("Delete this blog?")) return;
  saveBlogs((getBlogs() || []).filter((b) => b.id !== id));
  loadDashboard();
}

// ===== Create Blog =====
function setupCreateBlog() {
  const form = document.getElementById("blogForm");
  if (!form) return;
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const msg = document.getElementById("message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const category = form.category.value;
    const image = form.image.value.trim();
    const content = form.content.value.trim();

    if (!title || !category || !content) {
      return showMessage(msg, "Title, category and content are required.", "error");
    }
    if (content.length < 20) {
      return showMessage(msg, "Content must be at least 20 characters.", "error");
    }

    const blogs = getBlogs() || [];
    blogs.push({
      id: Date.now(),
      title,
      category,
      content,
      image,
      author: user.name,
      email: user.email,
      date: new Date().toISOString().slice(0, 10),
    });
    saveBlogs(blogs);
    showMessage(msg, "Blog published! Redirecting to dashboard...", "success");
    setTimeout(() => (window.location.href = "dashboard.html"), 1000);
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  seedBlogs();
  setupNavbar();
  loadHome();
  setupRegister();
  setupLogin();
  loadDashboard();
  setupCreateBlog();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
