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
const installModal = document.getElementById("installModal");
const modalInstallBtn = document.getElementById("modalInstallBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const installModalMsg = document.getElementById("installModalMsg");
function getBasePath() {
  return location.hostname.endsWith("github.io") ? "/nw-app-2026/" : "./";
}
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
function openInstallModal() {
  if (!installModal) return;
  if (isiOS()) {
    installModalMsg.textContent = "在 Safari 點擊分享圖示，選擇「加入主畫面」以建立捷徑。";
  } else if (isAndroidChrome()) {
    installModalMsg.textContent = deferredInstallPrompt ? "點選下方「立即安裝」呼叫安裝提示。" : "在 Chrome 點擊右上角「⋮」，選擇「安裝應用程式」。";
  } else {
    installModalMsg.textContent = "使用支援 PWA 的瀏覽器以安裝至主畫面。";
  }
  installModal.hidden = false;
}
installBtn.addEventListener("click", () => openInstallModal());
if (installNowBtn) {
  installNowBtn.addEventListener("click", () => openInstallModal());
}
if (modalCloseBtn && installModal) {
  modalCloseBtn.addEventListener("click", () => { installModal.hidden = true; });
}
if (modalInstallBtn) {
  modalInstallBtn.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.hidden = true;
      installBar.hidden = true;
      installModal.hidden = true;
    } else {
      openInstallModal();
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
async function diagnostics() {
  const link = document.querySelector('link[rel="manifest"]');
  const manifestURL = link ? link.href : null;
  const sw = await navigator.serviceWorker?.getRegistration();
  const info = {
    isAndroidChrome: isAndroidChrome(),
    isiOS: isiOS(),
    isStandalone: isStandalone(),
    hasSW: !!sw,
    manifestURL
  };
  console.log("[PWA Diagnostics]", info);
}
function setInstallUIState() {
  const ready = !!deferredInstallPrompt;
  if (installNowBtn) installNowBtn.disabled = !ready;
  if (modalInstallBtn) modalInstallBtn.disabled = !ready;
  if (installBar) installBar.hidden = !(isAndroidChrome() && !isStandalone());
  if (!ready && iosTip) {
    iosTip.classList.add("show");
    iosTip.textContent = "在 Chrome 點擊右上角「⋮」，選擇「安裝應用程式」。";
  }
}
openBtn.addEventListener("click", () => {
  window.location.href = getBasePath();
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
        setInstallUIState();
        bindAutoPrompt();
      }
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  showIOSTip();
  if (isAndroidChrome() && !isStandalone()) {
    installBtn.hidden = false;
    setInstallUIState();
    bindAutoPrompt();
    openInstallModal();
  }
  diagnostics();
});
window.addEventListener("appinstalled", () => {
  if (installBar) installBar.hidden = true;
  if (installBtn) installBtn.hidden = true;
  if (installModal) installModal.hidden = true;
});
