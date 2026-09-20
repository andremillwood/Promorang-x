import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const rootElement = document.getElementById("design-lab-root");

if (!rootElement) {
  throw new Error("Missing #design-lab-root");
}

const root = ReactDOM.createRoot(rootElement);

function renderBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  root.render(
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0c",
        color: "white",
        padding: "40px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <p style={{ color: "#ff5500", fontSize: 12, fontWeight: 800, letterSpacing: "0.18em" }}>
          PROMORANG · DESIGN LAB BOOT ERROR
        </p>
        <h1 style={{ marginTop: 16, fontSize: 36, lineHeight: 1.05 }}>The Design Lab could not render.</h1>
        <p style={{ marginTop: 18, color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>{message}</p>
        {stack ? (
          <pre
            style={{
              marginTop: 24,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 16,
              padding: 18,
              background: "rgba(255,255,255,.04)",
              color: "rgba(255,255,255,.62)",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            {stack}
          </pre>
        ) : null}
        <p style={{ marginTop: 20, color: "rgba(255,255,255,.45)", fontSize: 13 }}>
          Copy this error into ChatGPT and the failing component can be fixed directly.
        </p>
      </div>
    </div>,
  );
}

async function bootDesignLab() {
  try {
    const { default: DesignLabSuite } = await import("./pages/DesignLabSuite");

    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <DesignLabSuite />
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("[PROMORANG Design Lab] boot failed", error);
    renderBootError(error);
  }
}

void bootDesignLab();
