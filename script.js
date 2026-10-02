// Edite as URLs sociais aqui. Os botões e ícones usam a mesma configuração.
const socialLinks = {
  instagram: { label: "Instagram", url: "https://instagram.com/skillsdebolso" },
  tiktok: { label: "TikTok", url: "https://www.tiktok.com/@skillsdebolso" },
  youtube: { label: "YouTube", url: "https://www.youtube.com/@skillsdebolso" },
  github: { label: "GitHub", url: "https://github.com/skillsdebolso" },
  x: { label: "X", url: "https://x.com/skillsdebolso" },
  threads: { label: "Threads", url: "https://www.threads.net/@skillsdebolso" },
  facebook: { label: "Facebook", url: "https://www.facebook.com/skillsdebolso" },
};

const primaryOrder = ["instagram", "tiktok", "youtube", "github"];
const consentCookie = "sdb_analytics_consent";

function track(event, parameters) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
}

function readConsent() {
  const entry = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${consentCookie}=`));
  const value = entry?.split("=")[1];
  return value === "granted" || value === "denied" ? value : null;
}

function setConsent(value) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${consentCookie}=${value}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  window.gtag("consent", "update", { analytics_storage: value });
  // Reload so the stored choice is applied before GTM initializes any GA4 tag.
  location.reload();
}

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#icon-${name}`);
  svg.append(use);
  return svg;
}

function externalLink(url, label, className) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = className;
  link.setAttribute("aria-label", `${label} (abre em nova aba)`);
  return link;
}

const mainLinks = document.querySelector("#main-links");
primaryOrder.forEach((key, index) => {
  const social = socialLinks[key];
  const link = externalLink(social.url, social.label, "link-card");
  link.dataset.evento = "clique_rede_social";
  link.dataset.rede_social = key;
  link.dataset.posicao = "lista_principal";
  const number = document.createElement("span");
  number.className = "link-card-number";
  number.textContent = String(index + 2).padStart(2, "0");
  const title = document.createElement("span");
  title.className = "link-card-title";
  title.textContent = social.label;
  link.append(number, title, icon("external"));
  mainLinks.append(link);
});

const socialNav = document.querySelector("#social-links");
Object.entries(socialLinks).forEach(([key, social]) => {
  const link = externalLink(social.url, social.label, "social-link");
  link.dataset.evento = "clique_rede_social";
  link.dataset.rede_social = key;
  link.dataset.posicao = "icones_sociais";
  link.append(icon(key));
  socialNav.append(link);
});

document.querySelector("#year").textContent = new Date().getFullYear();

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a[data-evento]") : null;
  if (!link) return;

  if (link.dataset.evento === "clique_ver_packs") {
    track("clique_ver_packs", {});
  }

  if (link.dataset.evento === "clique_rede_social") {
    track("clique_rede_social", {
      rede_social: link.dataset.rede_social,
      posicao: link.dataset.posicao,
    });
  }
});

const packsSection = document.querySelector("#packs");
if ("IntersectionObserver" in window) {
  const packsObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
    track("visualizacao_secao", { secao: "produtos" });
    packsObserver.disconnect();
  }, { threshold: 0.5 });
  packsObserver.observe(packsSection);
}

const consentPanel = document.querySelector("#consent-panel");
const consentSettings = document.querySelector("#consent-settings");
if (!readConsent()) consentPanel.hidden = false;

consentSettings.addEventListener("click", () => {
  consentPanel.hidden = false;
  consentPanel.querySelector("button").focus();
});

consentPanel.querySelector('a[href="#privacidade"]').addEventListener("click", () => {
  consentPanel.hidden = true;
});

consentPanel.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-consent]") : null;
  if (!button) return;
  setConsent(button.dataset.consent);
});
