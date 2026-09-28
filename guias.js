const consentCookieName = "sdb_analytics_consent";
const consentPanel = document.querySelector("#consent-panel");
const consentSettings = document.querySelector("#consent-settings");

function readAnalyticsConsent() {
  const item = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${consentCookieName}=`));
  const value = item?.split("=")[1];
  return value === "granted" || value === "denied" ? value : null;
}

function saveAnalyticsConsent(value) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${consentCookieName}=${value}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  window.gtag("consent", "update", { analytics_storage: value });
  location.reload();
}

if (!readAnalyticsConsent()) consentPanel.hidden = false;

consentSettings.addEventListener("click", () => {
  consentPanel.hidden = false;
  consentPanel.querySelector("button").focus();
});

consentPanel.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-consent]") : null;
  if (button) saveAnalyticsConsent(button.dataset.consent);
});
