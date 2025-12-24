import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile, updatePassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbEhCa6tWPIuwo_Z9n48dWUa-pj6TQx30",
  authDomain: "nw-app-2026.firebaseapp.com",
  projectId: "nw-app-2026",
  storageBucket: "nw-app-2026.firebasestorage.app",
  messagingSenderId: "327412929502",
  appId: "1:327412929502:web:bb55add417a3939193834f",
  measurementId: "G-9L1LK58BR2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const el = {
  authCard: document.getElementById("auth-card"),
  profileCard: document.getElementById("profile-card"),
  hint: document.getElementById("auth-hint"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  btnLogin: document.getElementById("btn-login"),
  btnRegister: document.getElementById("btn-register"),
  btnReset: document.getElementById("btn-reset"),
  btnSignout: document.getElementById("btn-signout"),
  profileEmail: document.getElementById("profile-email"),
  profileRole: document.getElementById("profile-role"),
};

const brand = document.querySelector(".brand-logo");
let lastTap = 0;
if (brand) {
  brand.addEventListener("dblclick", () => {
    location.href = "admin.html";
  });
  brand.addEventListener("touchend", () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      location.href = "admin.html";
    }
    lastTap = now;
  }, { passive: true });
}

const frontStack = document.getElementById("front-stack");
const adminStack = document.getElementById("admin-stack");
const sysStack = document.getElementById("sys-stack");
const mainContainer = document.querySelector("main.container");
const btnSignoutFront = document.getElementById("btn-signout-front");
const btnSignoutAdmin = document.getElementById("btn-signout-admin");
const btnSignoutSys = document.getElementById("btn-signout-sys");
const btnAdminSecret = document.getElementById("btn-admin-secret");
const rememberMe = document.getElementById("remember-me");
const btnTogglePassword = document.getElementById("btn-toggle-password");

window.addEventListener('offline', () => {
  showHint("網路已斷線，請檢查您的網際網路連線", "error");
});
window.addEventListener('online', () => {
  showHint("網路已恢復連線", "success");
});

function showHint(text, type = "info") {
  el.hint.textContent = text;
  el.hint.style.color = type === "error" ? "#b71c1c" : type === "success" ? "#0ea5e9" : "#6b7280";
}

function toggleAuth(showAuth) {
  if (showAuth) {
    if (el.authCard) el.authCard.classList.remove("hidden");
    el.profileCard && el.profileCard.classList.add("hidden");
    frontStack && frontStack.classList.add("hidden");
    adminStack && adminStack.classList.add("hidden");
    sysStack && sysStack.classList.add("hidden");
    mainContainer && mainContainer.classList.remove("hidden");
  } else {
    if (el.authCard) el.authCard.classList.add("hidden");
    if (el.profileCard) el.profileCard.classList.add("hidden");
  }
}

async function getOrCreateUserRole(uid, email) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    return data.role || "住戶";
  }
  await setDoc(ref, { email, role: "住戶", createdAt: Date.now() });
  return "住戶";
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el.email.value.trim();
    const password = el.password.value;
    if (!email || !password) return showHint("請輸入帳號密碼", "error");

    el.btnLogin.disabled = true;
    el.btnLogin.textContent = "登入中...";
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      showHint("登入成功", "success");
      const role = await getOrCreateUserRole(cred.user.uid, cred.user.email);
      handleRoleRedirect(role);
    } catch (err) {
      console.error(err);
      let msg = "登入失敗";
      if (err.code === 'auth/invalid-credential') msg = "帳號或密碼錯誤";
      else if (err.code === 'auth/too-many-requests') msg = "嘗試次數過多，請稍後再試";
      showHint(msg, "error");
      el.btnLogin.disabled = false;
      el.btnLogin.textContent = "登入";
    }
  });
}

function handleRoleRedirect(role) {
  // Simple role based redirect logic
  if (window.location.pathname.includes("sys.html")) {
      if (role === "系統管理員") {
        toggleAuth(false);
        if (sysStack) sysStack.classList.remove("hidden");
        if (mainContainer) mainContainer.classList.add("hidden");
      } else {
         showHint("權限不足", "error");
         auth.signOut();
      }
      return;
  }
  
  if (role === "系統管理員") {
    location.href = "sys.html";
  } else if (role === "管理員" || role === "總幹事") {
    location.href = "admin.html"; // Assume admin.html exists and handles its logic
  } else {
    location.href = "front.html";
  }
}

// Auto login check
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (el.authCard) el.authCard.classList.add("hidden");
    // If we are on specific pages, handle display
    if (window.location.pathname.includes("sys.html")) {
        const role = await getOrCreateUserRole(user.uid, user.email);
        if (role === "系統管理員") {
           if (sysStack) sysStack.classList.remove("hidden");
           if (mainContainer) mainContainer.classList.add("hidden");
        } else {
            // Not authorized for this page
            if (el.authCard) el.authCard.classList.remove("hidden");
            if (sysStack) sysStack.classList.add("hidden");
             showHint("權限不足", "error");
        }
    } else if (window.location.pathname.includes("front.html")) {
        if (frontStack) frontStack.classList.remove("hidden");
        if (mainContainer) mainContainer.classList.add("hidden");
    } else if (window.location.pathname.includes("admin.html")) {
         // admin logic
    }
    
    if (el.profileEmail) el.profileEmail.textContent = user.email;
    // We can fetch role here if needed for profile card
  } else {
    toggleAuth(true);
  }
});

// Sign out handlers
[btnSignoutFront, btnSignoutAdmin, btnSignoutSys, el.btnSignout].forEach(btn => {
  if (btn) {
    btn.addEventListener("click", async () => {
      await signOut(auth);
      location.href = "index.html";
    });
  }
});

// Password toggle
if (btnTogglePassword) {
  btnTogglePassword.addEventListener("click", () => {
    const type = el.password.getAttribute("type") === "password" ? "text" : "password";
    el.password.setAttribute("type", type);
    btnTogglePassword.classList.toggle("visible");
  });
}

// System Admin Page Navigation Logic
const sysNav = {
  home: document.getElementById("sys-nav-home"),
  notify: document.getElementById("sys-nav-notify"),
  settings: document.getElementById("sys-nav-settings"),
  subContainer: document.getElementById("sys-sub-nav"),
  content: document.getElementById("sys-content")
};

const sysSubMenus = {
  home: ["總覽", "社區"],
  notify: ["系統", "社區", "住戶"],
  settings: ["一般", "社區", "住戶", "系統"]
};

if (sysNav.subContainer) {
  const adminAccounts = [
    // Use current authenticated admin account
  ];
  
  async function renderSettingsGeneral() {
    if (!sysNav.content) return;
    const user = auth.currentUser;
    const email = (user && user.email) || "nwapp.eason@gmail.com";
    const uid = user && user.uid;
    let role = "系統管理員";
    let status = "啟用";
    let name = (user && user.displayName) || "系統管理員";
    let phone = "";
    let photoURL = (user && user.photoURL) || "";
    if (uid) {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const d = snap.data();
          phone = d.phone || phone;
          name = name || d.displayName || name;
          photoURL = photoURL || d.photoURL || photoURL;
        }
      } catch (e) {
        console.warn("Fetch user doc failed", e);
      }
    }
    const avatarHtml = photoURL 
      ? `<img class="avatar" src="${photoURL}" alt="avatar">`
      : `<span class="avatar">${(name || email)[0]}</span>`;
    const rows = `
      <tr>
        <td class="avatar-cell">${avatarHtml}<span>${name}</span></td>
        <td>${phone || ""}</td>
        <td>••••••</td>
        <td>${email}</td>
        <td>${role}</td>
        <td class="status">${status}</td>
        <td class="actions">
          <button id="btn-edit-admin" class="btn small action-btn">編輯</button>
          <button id="btn-delete-admin" class="btn small action-btn danger">刪除</button>
        </td>
      </tr>
    `;
    sysNav.content.innerHTML = `
      <div class="card data-card">
        <h1 class="card-title">系統管理員帳號列表</h1>
        <table class="table">
          <thead>
            <tr>
              <th>大頭照</th>
              <th>手機號碼</th>
              <th>密碼</th>
              <th>電子郵件</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    
    const btnEdit = document.getElementById("btn-edit-admin");
    const btnDelete = document.getElementById("btn-delete-admin");
    if (btnEdit) {
      btnEdit.addEventListener("click", async () => {
        try {
          const newName = window.prompt("更新姓名", name);
          const newPhone = window.prompt("更新手機號碼", phone || "");
          const newPhoto = window.prompt("更新大頭照 URL", photoURL || "");
          const newPassword = window.prompt("更新密碼（留空則不變）", "");
          
          if (user) {
            if (newName !== null || newPhoto !== null) {
              await updateProfile(user, {
                displayName: newName !== null ? newName : user.displayName,
                photoURL: newPhoto !== null ? newPhoto : user.photoURL
              });
            }
            if (uid) {
              await setDoc(doc(db, "users", uid), {
                phone: newPhone !== null ? newPhone : phone,
                displayName: newName !== null ? newName : name,
                photoURL: newPhoto !== null ? newPhoto : photoURL
              }, { merge: true });
            }
            if (newPassword && newPassword.length >= 6) {
              try {
                await updatePassword(user, newPassword);
                showHint("密碼已更新", "success");
              } catch (err) {
                showHint("密碼更新失敗，可能需要重新登入驗證", "error");
                console.warn(err);
              }
            }
            await renderSettingsGeneral();
            showHint("已更新帳號資料", "success");
          }
        } catch (e) {
          console.error(e);
          showHint("更新失敗", "error");
        }
      });
    }
    if (btnDelete) {
      btnDelete.addEventListener("click", async () => {
        const ok1 = window.confirm("確定要刪除此帳號嗎？此操作不可恢復。");
        if (!ok1) return;
        const ok2 = window.confirm("再次確認：刪除後將立即登出。是否繼續？");
        if (!ok2) return;
        try {
          if (user) {
            await user.delete();
            showHint("帳號已刪除", "success");
            location.href = "index.html";
          }
        } catch (err) {
          console.error(err);
          showHint("刪除失敗，可能需要重新登入驗證", "error");
        }
      });
    }
  }
  
  function renderContentFor(mainKey, subLabel) {
    if (!sysNav.content) return;
    if (mainKey === 'settings' && subLabel === '一般') {
      renderSettingsGeneral();
      return;
    }
    sysNav.content.innerHTML = '';
  }
  
  function renderSubNav(key) {
    if (!sysNav.subContainer) return;
    const items = sysSubMenus[key] || [];
    sysNav.subContainer.innerHTML = items.map((item, index) => 
      `<button class="sub-nav-item ${index === 0 ? 'active' : ''}">${item}</button>`
    ).join('');
    
    const buttons = sysNav.subContainer.querySelectorAll('.sub-nav-item');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderContentFor(key, btn.textContent);
      });
    });
    if (items.length) renderContentFor(key, items[0]);
  }

  function setActiveNav(activeKey) {
    ['home', 'notify', 'settings'].forEach(key => {
      if (sysNav[key]) {
        if (key === activeKey) {
          sysNav[key].classList.add('active');
        } else {
          sysNav[key].classList.remove('active');
        }
      }
    });
    renderSubNav(activeKey);
  }

  // Event Listeners
  if (sysNav.home) sysNav.home.addEventListener('click', () => setActiveNav('home'));
  if (sysNav.notify) sysNav.notify.addEventListener('click', () => setActiveNav('notify'));
  if (sysNav.settings) sysNav.settings.addEventListener('click', () => setActiveNav('settings'));

  // Initialize with Home
  renderSubNav('home');
}
