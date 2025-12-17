let deferredInstallPrompt = null;
const installBtn = document.getElementById("installBtn");
const openBtn = document.getElementById("openBtn");
const iosTip = document.getElementById("iosTip");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMsg = document.getElementById("loginMsg");
const loginCard = document.getElementById("loginCard");
const appSection = document.getElementById("appSection");
const signOutBtn = document.getElementById("signOutBtn");
const installBar = document.getElementById("installBar");
const installNowBtn = document.getElementById("installNowBtn");
function isiOS() {
  const ua = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const iosPlatforms = ["iPhone", "iPad", "iPod"];
  return iosPlatforms.includes(platform) || /Macintosh/.test(platform) && /Mobile/.test(ua);
}
function isAndroidChrome() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("android") && ua.includes("chrome");
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function showIOSTip() {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isiOS() && !isStandalone() && isSafari) {
    iosTip.classList.add("show");
    iosTip.textContent = "在 Safari 點擊分享圖示，選擇「加入主畫面」以建立桌面捷徑。";
  }
}
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installBtn.hidden = false;
  if (isAndroidChrome() && !isStandalone()) {
    installBar.hidden = false;
  }
});
installBtn.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
    installBar.hidden = true;
  } else if (isAndroidChrome()) {
    iosTip.classList.add("show");
    iosTip.textContent = "在 Chrome 點擊右上角「⋮」，選擇「安裝應用程式」以建立捷徑。";
  }
});
if (installNowBtn) {
  installNowBtn.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.hidden = true;
      installBar.hidden = true;
    }
  });
}
let autoPromptBound = false;
function bindAutoPrompt() {
  if (autoPromptBound) return;
  autoPromptBound = true;
  const handler = () => {
    if (deferredInstallPrompt) {
      // 需使用者手勢觸發，此為首次互動時嘗試
      deferredInstallPrompt.prompt();
    }
    document.removeEventListener("click", handler, { once: true });
    document.removeEventListener("touchstart", handler, { once: true });
  };
  document.addEventListener("click", handler, { once: true });
  document.addEventListener("touchstart", handler, { once: true });
}
openBtn.addEventListener("click", () => {
  window.location.href = "/nw-app-2026/";
});
if (loginForm && window.firebase) {
  const auth = firebase.auth();
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    loginMsg.textContent = "登入中…";
    try {
      await auth.signInWithEmailAndPassword(email, password);
      loginMsg.textContent = "登入成功";
    } catch (err) {
      loginMsg.textContent = "登入失敗：" + (err && err.message ? err.message : "未知錯誤");
    }
  });
  signOutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
    } catch {}
  });
  auth.onAuthStateChanged((user) => {
    const loggedIn = !!user;
    loginCard.hidden = loggedIn;
    appSection.hidden = !loggedIn;
    if (loggedIn) {
      showIOSTip();
      if (isAndroidChrome() && !isStandalone()) {
        installBtn.hidden = false;
        installBar.hidden = false;
        bindAutoPrompt();
      }
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  showIOSTip();
  if (isAndroidChrome() && !isStandalone()) {
    installBtn.hidden = false;
    installBar.hidden = false;
    bindAutoPrompt();
  }
});
