// -------------------------
// ROUTER (TWÓJ KOD — ZOSTAWIAM)
// -------------------------
var params = new URLSearchParams(window.location.search);
var ROUTES = {
    home: 'home.html',
    services: 'services.html',
    qr: 'qr.html',
    more: 'more.html',
    moreid: 'moreid.html',
    id: 'id.html',
    shortcuts: 'shortcuts.html',
    pesel: 'pesel.html',
    scanqr: 'scanqr.html',
    showqr: 'showqr.html',
    gen: 'gen.html',
    card: 'card.html',
};

function sendTo(key){
    var qs = params.toString();
    var file = ROUTES[String(key)] || (String(key).endsWith('.html') ? String(key) : String(key) + '.html');
    var href = file + (qs ? `?${qs}` : '');
    location.href = href;
}

document.querySelectorAll(".bottom_element_grid").forEach((element) => {
    element.addEventListener('click', () => {
        sendTo(element.getAttribute("send"))
    })
});


// -------------------------
//  SYSTEM OPERACYJNY (TWÓJ KOD — ZOSTAWIAM)
// -------------------------
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
    if (/windows phone/i.test(userAgent)) return 1;
    if (/android/i.test(userAgent)) return 2;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 3;
    return 4;
}

if (getMobileOperatingSystem() == 2){
    document.querySelector(".bottom_bar").style.height = "70px";
}


// -------------------------
//  🔥 TOP BAR BLUR JAK W MOBYWATEL
// -------------------------

function initTopBarEffects() {
    const bar = document.querySelector(".top_grid, .top_slide_bar");
    const body = document.body;

    if (!bar || body.classList.contains("login-screen")) return;

    body.classList.add("has-blur-topbar");

    const SHOW_OFFSET = 10;
    const BODY_PADDING_CLASS = "body-with-top-bar";
    const ALWAYS_SOLID_CLASS = "topbar-always--solid";
    const alwaysVisible = bar.classList.contains("topbar-always");

    const hero = document.querySelector("[data-hero]");
    const rootStyles = getComputedStyle(document.documentElement);
    const topBarHeight = parseFloat(rootStyles.getPropertyValue("--top-bar-height")) || 52;
    let showThreshold = SHOW_OFFSET;

    function recalcThreshold() {
        if (hero) {
            const rect = hero.getBoundingClientRect();
            const heroTop = rect.top + window.scrollY;
            showThreshold = Math.max(SHOW_OFFSET, heroTop + rect.height - topBarHeight);
        } else {
            showThreshold = SHOW_OFFSET;
        }
    }

    recalcThreshold();
    window.addEventListener("resize", recalcThreshold, { passive: true });

    function updateTopBar() {
        const shouldShow = alwaysVisible || window.scrollY > showThreshold;

        if (shouldShow) {
            bar.classList.add("top-bar--active");
            body.classList.add(BODY_PADDING_CLASS);
        } else {
            bar.classList.remove("top-bar--active");
            body.classList.remove(BODY_PADDING_CLASS);
        }

        if (alwaysVisible) {
            bar.classList.toggle(ALWAYS_SOLID_CLASS, window.scrollY > SHOW_OFFSET);
        }
    }

    window.addEventListener("scroll", updateTopBar, { passive: true });
    updateTopBar();
}

document.addEventListener("DOMContentLoaded", initTopBarEffects);


