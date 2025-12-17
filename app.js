let deferredInstallPrompt = null;
const installBtn = document.getElementById("installBtn");
const openBtn = document.getElementById("openBtn");
const iosTip = document.getElementById("iosTip");
function isiOS() {
  const ua = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const iosPlatforms = ["iPhone", "iPad", "iPod"];
  return iosPlatforms.includes(platform) || /Macintosh/.test(platform) && /Mobile/.test(ua);
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
});
installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installBtn.hidden = true;
});
openBtn.addEventListener("click", () => {
  window.location.href = "./";
});
document.addEventListener("DOMContentLoaded", () => {
  showIOSTip();
});

