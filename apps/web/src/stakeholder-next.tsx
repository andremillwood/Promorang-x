import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import StakeholderNextV3 from "@/pages/stakeholder-next/StakeholderNextV3";
import "./index.css";
import "./stakeholder-next-v2-fixes.css";

const rootElement = document.getElementById("stakeholder-next-root");
if (!rootElement) throw new Error("Missing #stakeholder-next-root");

const roleKeys = ["creator", "host", "merchant", "brand", "agency", "admin"];
const bareRole = window.location.hash.replace(/^#\/?/, "");
if (roleKeys.includes(bareRole)) {
  window.location.hash = `#/${bareRole}/today`;
}

function currentRoleFromHash() {
  const role = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return roleKeys.includes(role) ? role : "creator";
}

const compareLink = document.createElement("a");
compareLink.textContent = "Compare current product ↗";
compareLink.setAttribute("aria-label", "Open the current production stakeholder interface for comparison");
Object.assign(compareLink.style, {
  position: "fixed",
  right: "16px",
  bottom: "84px",
  zIndex: "9999",
  border: "1px solid rgba(255,106,0,.35)",
  borderRadius: "999px",
  background: "rgba(8,8,9,.92)",
  color: "#ff9a4d",
  padding: "10px 14px",
  fontFamily: "system-ui, sans-serif",
  fontSize: "12px",
  fontWeight: "800",
  textDecoration: "none",
  boxShadow: "0 10px 30px rgba(0,0,0,.24)",
  backdropFilter: "blur(14px)",
});
function syncCompareLink() {
  compareLink.href = `/stakeholder-current.html#/${currentRoleFromHash()}`;
}
syncCompareLink();
window.addEventListener("hashchange", syncCompareLink);
document.body.appendChild(compareLink);

const root = ReactDOM.createRoot(rootElement);

function renderBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  root.render(
    <div style={{ minHeight: "100vh", background: "#080809", color: "white", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <p style={{ color: "#ff6a00", fontSize: 12, fontWeight: 800, letterSpacing: ".18em" }}>PROMORANG · STAKEHOLDER NEXT BOOT ERROR</p>
        <h1 style={{ marginTop: 16, fontSize: 36, lineHeight: 1.05 }}>The stakeholder review could not render.</h1>
        <p style={{ marginTop: 18, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>{message}</p>
      </div>
    </div>,
  );
}

try {
  root.render(
    <React.StrictMode>
      <HashRouter>
        <StakeholderNextV3 />
      </HashRouter>
    </React.StrictMode>,
  );
} catch (error) {
  console.error("[PROMORANG Stakeholder Next] boot failed", error);
  renderBootError(error);
}
