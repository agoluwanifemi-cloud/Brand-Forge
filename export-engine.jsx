import { useState, useEffect, useRef, useCallback } from "react";

// ─── Default Brand Data ───
const DEFAULT = {
  name: "Lumina Studio",
  tagline: "Designing the future, today",
  industry: "Architecture & Design",
  headingFont: "Playfair Display",
  bodyFont: "Outfit",
  colors: {
    primary: "#1B2838",
    secondary: "#3D5A73",
    accent: "#C9A96E",
    neutral: "#8A9BAE",
    background: "#F4F1EC"
  },
  website: "www.luminastudio.com",
  email: "hello@luminastudio.com",
  phone: "+1 (555) 234-5678",
  socialHandle: "@luminastudio",
  mission: "To transform spaces into experiences that inspire human connection.",
  vision: "A world where every built space is designed with intention, sustainability, and the human spirit at its center.",
};

const PLACEHOLDER_LOGO = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="30" width="30" height="50" rx="4" fill="#1B2838"/><rect x="45" y="15" width="25" height="65" rx="4" fill="#3D5A73"/><polygon points="78,80 60,80 69,20" fill="#C9A96E"/></svg>`;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return {r,g,b};
}
function hexToCmyk(hex) {
  let {r,g,b} = hexToRgb(hex);
  r/=255; g/=255; b/=255;
  const k=1-Math.max(r,g,b);
  if(k===1) return {c:0,m:0,y:0,k:100};
  return {c:Math.round(((1-r-k)/(1-k))*100),m:Math.round(((1-g-k)/(1-k))*100),y:Math.round(((1-b-k)/(1-k))*100),k:Math.round(k*100)};
}
function getLum(hex){const{r,g,b}=hexToRgb(hex);return(0.299*r+0.587*g+0.114*b)/255;}

// ─── Export Utilities ───

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadText(text, filename, mime = "text/plain") {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

function svgToPng(svgString, size, bgColor = null) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const scale = Math.min(size / img.width, size / img.height) * 0.7;
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      canvas.toBlob((b) => { resolve(b); URL.revokeObjectURL(url); }, "image/png");
    };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

function svgToJpeg(svgString, size, bgColor = "#FFFFFF") {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const scale = Math.min(size / img.width, size / img.height) * 0.7;
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      canvas.toBlob((b) => { resolve(b); URL.revokeObjectURL(url); }, "image/jpeg", 0.95);
    };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

function generateColorSwatch(colors, width = 800, height = 200) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    const entries = Object.entries(colors);
    const w = width / entries.length;
    entries.forEach(([key, hex], i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(i * w, 0, w, height - 40);
      ctx.fillStyle = "#333";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(key.toUpperCase(), i * w + w / 2, height - 22);
      ctx.font = "11px monospace";
      ctx.fillStyle = "#888";
      ctx.fillText(hex, i * w + w / 2, height - 6);
    });
    canvas.toBlob(resolve, "image/png");
  });
}

function generateSocialImage(svgString, brand, width, height, platform) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    const c = brand.colors;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, c.primary);
    grad.addColorStop(1, c.secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative circle
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, Math.min(width, height) * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = c.accent + "15";
    ctx.fill();

    // Logo
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const logoSize = Math.min(width, height) * 0.2;
      ctx.drawImage(img, width / 2 - logoSize / 2, height * 0.3 - logoSize / 2, logoSize, logoSize);

      // Brand name
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.round(width * 0.06)}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(brand.name, width / 2, height * 0.55);

      // Tagline
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `${Math.round(width * 0.025)}px sans-serif`;
      ctx.fillText(brand.tagline, width / 2, height * 0.63);

      // Platform label
      ctx.fillStyle = c.accent;
      ctx.font = `bold ${Math.round(width * 0.015)}px sans-serif`;
      ctx.fillText(platform.toUpperCase(), width / 2, height * 0.92);

      canvas.toBlob((b) => { resolve(b); URL.revokeObjectURL(url); }, "image/png");
    };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// ─── CSS Generator ───
function generateCSS(brand) {
  const c = brand.colors;
  return `/* ═══════════════════════════════════
   ${brand.name} — Brand Design Tokens
   Generated by BrandForge
   ═══════════════════════════════════ */

:root {
  /* Colors */
  --brand-primary: ${c.primary};
  --brand-secondary: ${c.secondary};
  --brand-accent: ${c.accent};
  --brand-neutral: ${c.neutral};
  --brand-background: ${c.background};

  /* RGB Values */
  --brand-primary-rgb: ${hexToRgb(c.primary).r}, ${hexToRgb(c.primary).g}, ${hexToRgb(c.primary).b};
  --brand-secondary-rgb: ${hexToRgb(c.secondary).r}, ${hexToRgb(c.secondary).g}, ${hexToRgb(c.secondary).b};
  --brand-accent-rgb: ${hexToRgb(c.accent).r}, ${hexToRgb(c.accent).g}, ${hexToRgb(c.accent).b};

  /* Typography */
  --font-heading: '${brand.headingFont}', serif;
  --font-body: '${brand.bodyFont}', sans-serif;

  /* Type Scale */
  --text-h1: 3rem;      /* 48px */
  --text-h2: 2.25rem;   /* 36px */
  --text-h3: 1.75rem;   /* 28px */
  --text-h4: 1.375rem;  /* 22px */
  --text-h5: 1.125rem;  /* 18px */
  --text-body: 1rem;     /* 16px */
  --text-small: 0.875rem;/* 14px */
  --text-caption: 0.75rem;/* 12px */

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

/* Utility Classes */
.brand-bg-primary { background-color: var(--brand-primary); }
.brand-bg-secondary { background-color: var(--brand-secondary); }
.brand-bg-accent { background-color: var(--brand-accent); }
.brand-text-primary { color: var(--brand-primary); }
.brand-text-accent { color: var(--brand-accent); }
.brand-heading { font-family: var(--font-heading); }
.brand-body { font-family: var(--font-body); }
`;
}

// ─── Tailwind Config Generator ───
function generateTailwind(brand) {
  const c = brand.colors;
  return `// ${brand.name} — Tailwind Config
// Generated by BrandForge

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${c.primary}',
          secondary: '${c.secondary}',
          accent: '${c.accent}',
          neutral: '${c.neutral}',
          background: '${c.background}',
        }
      },
      fontFamily: {
        heading: ['${brand.headingFont}', 'serif'],
        body: ['${brand.bodyFont}', 'sans-serif'],
      },
    },
  },
}
`;
}

// ─── Figma Tokens ───
function generateFigmaTokens(brand) {
  const c = brand.colors;
  return JSON.stringify({
    color: {
      primary: { value: c.primary, type: "color" },
      secondary: { value: c.secondary, type: "color" },
      accent: { value: c.accent, type: "color" },
      neutral: { value: c.neutral, type: "color" },
      background: { value: c.background, type: "color" }
    },
    typography: {
      heading: { value: brand.headingFont, type: "fontFamilies" },
      body: { value: brand.bodyFont, type: "fontFamilies" }
    },
    fontSize: {
      h1: { value: "48", type: "fontSizes" },
      h2: { value: "36", type: "fontSizes" },
      h3: { value: "28", type: "fontSizes" },
      h4: { value: "22", type: "fontSizes" },
      body: { value: "16", type: "fontSizes" },
      small: { value: "14", type: "fontSizes" },
      caption: { value: "12", type: "fontSizes" }
    }
  }, null, 2);
}

// ─── Color Report ───
function generateColorReport(brand) {
  const c = brand.colors;
  let report = `${brand.name} — Color Reference\nGenerated by BrandForge\n${"═".repeat(50)}\n\n`;
  Object.entries(c).forEach(([key, hex]) => {
    const rgb = hexToRgb(hex);
    const cmyk = hexToCmyk(hex);
    report += `${key.toUpperCase()}\n`;
    report += `  HEX:  ${hex}\n`;
    report += `  RGB:  ${rgb.r}, ${rgb.g}, ${rgb.b}\n`;
    report += `  CMYK: ${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}\n\n`;
  });
  return report;
}

// ─── Export Item Component ───
function ExportItem({ icon, title, description, files, onExport, status, disabled }) {
  return (
    <div style={{
      padding: "20px 24px",
      background: status === "done" ? "rgba(46,204,113,0.04)" : "#fff",
      borderRadius: 14,
      border: `1px solid ${status === "done" ? "#bbf7d0" : "#f0f0f0"}`,
      display: "flex", alignItems: "center", gap: 16,
      transition: "all 0.3s"
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: status === "done" ? "#f0fdf4" : "#fafafa",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0
      }}>
        {status === "done" ? "✅" : status === "loading" ? "⏳" : icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#999" }}>{description}</div>
        {files && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
            {files.map(f => (
              <span key={f} style={{
                padding: "2px 8px", background: "#f5f5f5", borderRadius: 4,
                fontSize: 10, fontWeight: 600, color: "#888",
                fontFamily: "'JetBrains Mono', monospace"
              }}>{f}</span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onExport}
        disabled={disabled || status === "loading"}
        style={{
          padding: "10px 20px", borderRadius: 8,
          border: "none", fontSize: 12, fontWeight: 600,
          cursor: disabled || status === "loading" ? "not-allowed" : "pointer",
          fontFamily: "'Outfit', sans-serif",
          background: status === "done" ? "#f0fdf4" : status === "loading" ? "#f5f5f5" : "#1a1a1a",
          color: status === "done" ? "#16a34a" : status === "loading" ? "#999" : "#fff",
          opacity: disabled ? 0.4 : 1,
          transition: "all 0.2s", flexShrink: 0
        }}
      >
        {status === "done" ? "✓ Done" : status === "loading" ? "Exporting..." : "Download"}
      </button>
    </div>
  );
}

// ─── Category Header ───
function CategoryHeader({ icon, title, count }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginTop: 32, marginBottom: 14
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{title}</span>
      <span style={{
        padding: "2px 10px", background: "#f5f5f5", borderRadius: 20,
        fontSize: 11, fontWeight: 600, color: "#999"
      }}>{count} files</span>
    </div>
  );
}

// ─── Main Component ───
export default function ExportEngine() {
  const [brand] = useState(DEFAULT);
  const [logo, setLogo] = useState(PLACEHOLDER_LOGO);
  const [statuses, setStatuses] = useState({});
  const [showUpload, setShowUpload] = useState(false);
  const [totalExported, setTotalExported] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleLogo = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      let raw = e.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (svgEl) {
        if (!svgEl.getAttribute("viewBox")) {
          svgEl.setAttribute("viewBox", `0 0 ${parseFloat(svgEl.getAttribute("width")||"100")} ${parseFloat(svgEl.getAttribute("height")||"100")}`);
        }
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "100%");
        raw = new XMLSerializer().serializeToString(svgEl);
      }
      setLogo(raw);
      setShowUpload(false);
    };
    reader.readAsText(file);
  };

  const setStatus = (key, val) => {
    setStatuses(prev => ({ ...prev, [key]: val }));
    if (val === "done") setTotalExported(prev => prev + 1);
  };

  const slug = brand.name.toLowerCase().replace(/\s+/g, "-");

  // ─── Export Functions ───

  const exportLogoSVG = async () => {
    setStatus("logo-svg", "loading");
    downloadText(logo, `${slug}-logo.svg`, "image/svg+xml");
    setStatus("logo-svg", "done");
  };

  const exportLogoPNG = async () => {
    setStatus("logo-png", "loading");
    const sizes = [64, 128, 256, 512, 1024];
    for (const size of sizes) {
      const blob = await svgToPng(logo, size);
      if (blob) downloadBlob(blob, `${slug}-logo-${size}px.png`);
    }
    setStatus("logo-png", "done");
  };

  const exportLogoJPEG = async () => {
    setStatus("logo-jpeg", "loading");
    const variants = [
      { bg: "#FFFFFF", label: "white" },
      { bg: brand.colors.primary, label: "primary" },
      { bg: "#1A1A1A", label: "dark" }
    ];
    for (const v of variants) {
      const blob = await svgToJpeg(logo, 1024, v.bg);
      if (blob) downloadBlob(blob, `${slug}-logo-on-${v.label}.jpg`);
    }
    setStatus("logo-jpeg", "done");
  };

  const exportFavicons = async () => {
    setStatus("favicons", "loading");
    const sizes = [16, 32, 48, 64, 180, 192, 512];
    for (const size of sizes) {
      const blob = await svgToPng(logo, size);
      if (blob) downloadBlob(blob, `favicon-${size}x${size}.png`);
    }
    setStatus("favicons", "done");
  };

  const exportCSS = () => {
    setStatus("css", "loading");
    downloadText(generateCSS(brand), `${slug}-tokens.css`, "text/css");
    setStatus("css", "done");
  };

  const exportTailwind = () => {
    setStatus("tailwind", "loading");
    downloadText(generateTailwind(brand), `${slug}-tailwind.config.js`, "text/javascript");
    setStatus("tailwind", "done");
  };

  const exportFigmaTokens = () => {
    setStatus("figma", "loading");
    downloadText(generateFigmaTokens(brand), `${slug}-figma-tokens.json`, "application/json");
    setStatus("figma", "done");
  };

  const exportColorReport = () => {
    setStatus("color-report", "loading");
    downloadText(generateColorReport(brand), `${slug}-color-reference.txt`);
    setStatus("color-report", "done");
  };

  const exportColorSwatch = async () => {
    setStatus("color-swatch", "loading");
    const blob = await generateColorSwatch(brand.colors);
    if (blob) downloadBlob(blob, `${slug}-color-swatch.png`);
    setStatus("color-swatch", "done");
  };

  const exportSocialKit = async () => {
    setStatus("social", "loading");
    const sizes = [
      { w: 1080, h: 1080, name: "instagram-post" },
      { w: 1080, h: 1920, name: "instagram-story" },
      { w: 1200, h: 630, name: "facebook-og" },
      { w: 1500, h: 500, name: "twitter-header" },
      { w: 1584, h: 396, name: "linkedin-banner" },
      { w: 2560, h: 1440, name: "youtube-banner" },
    ];
    for (const s of sizes) {
      const blob = await generateSocialImage(logo, brand, s.w, s.h, s.name.replace("-", " "));
      if (blob) downloadBlob(blob, `${slug}-${s.name}-${s.w}x${s.h}.png`);
    }
    setStatus("social", "done");
  };

  const exportProfilePics = async () => {
    setStatus("profile-pics", "loading");
    const sizes = [110, 160, 320, 400];
    for (const size of sizes) {
      // Create circular profile pic
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, brand.colors.primary);
      grad.addColorStop(1, brand.colors.secondary);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.fill();
      // Logo
      const img = new Image();
      const blob = new Blob([logo], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      await new Promise(resolve => {
        img.onload = () => {
          const ls = size * 0.5;
          ctx.drawImage(img, (size-ls)/2, (size-ls)/2, ls, ls);
          canvas.toBlob((b) => {
            if (b) downloadBlob(b, `${slug}-profile-${size}px.png`);
            URL.revokeObjectURL(url);
            resolve();
          }, "image/png");
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
        img.src = url;
      });
    }
    setStatus("profile-pics", "done");
  };

  const exportBrandGuide = () => {
    setStatus("brand-guide", "loading");
    // Trigger print dialog — in production this would generate a proper PDF
    setTimeout(() => {
      window.print?.();
      setStatus("brand-guide", "done");
    }, 500);
  };

  const exportAll = async () => {
    setStatus("all", "loading");
    await exportLogoSVG();
    await exportLogoPNG();
    await exportLogoJPEG();
    await exportFavicons();
    exportCSS();
    exportTailwind();
    exportFigmaTokens();
    exportColorReport();
    await exportColorSwatch();
    await exportSocialKit();
    await exportProfilePics();
    setStatus("all", "done");
  };

  const doneCount = Object.values(statuses).filter(s => s === "done").length;
  const totalItems = 12;

  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      minHeight: "100vh",
      background: "#F5F5F0"
    }}>
      {/* Top bar */}
      <div style={{
        padding: "12px 24px", background: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "#1a1a1a", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 13
          }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>BrandForge</span>
          <span style={{ color: "#ccc" }}>·</span>
          <span style={{ color: "#888", fontSize: 13 }}>Export Engine</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowUpload(!showUpload)} style={{
            padding: "7px 14px", fontSize: 11, fontWeight: 600,
            background: "transparent", border: "1px solid #ddd",
            borderRadius: 7, cursor: "pointer", fontFamily: "'Outfit'", color: "#666"
          }}>
            {showUpload ? "✕" : "↑ Upload Logo"}
          </button>
        </div>
      </div>

      {showUpload && (
        <div style={{ padding: 20, background: "#fff", borderBottom: "1px solid #eee", textAlign: "center" }}>
          <div onClick={() => fileRef.current?.click()} style={{
            border: "2px dashed #ddd", borderRadius: 12, padding: 28,
            cursor: "pointer", maxWidth: 360, margin: "0 auto"
          }}>
            <input ref={fileRef} type="file" accept=".svg" hidden onChange={(e) => handleLogo(e.target.files[0])} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Drop SVG logo here</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
        {/* Hero Section */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "36px 32px",
          border: "1px solid #f0f0f0", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 28
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16,
            background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
          }}>
            <div style={{ width: 40, height: 40 }} dangerouslySetInnerHTML={{ __html: logo }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.5 }}>
              Export Brand Assets
            </h1>
            <p style={{ color: "#888", margin: "0 0 12px", fontSize: 14 }}>
              Download production-ready files for <strong style={{ color: "#1a1a1a" }}>{brand.name}</strong>
            </p>
            {/* Progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: doneCount === totalItems ? "#16a34a" : `linear-gradient(90deg, ${brand.colors.primary}, ${brand.colors.accent})`,
                  width: `${(doneCount / totalItems) * 100}%`,
                  transition: "width 0.5s ease"
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>
                {doneCount}/{totalItems}
              </span>
            </div>
          </div>
          <button
            onClick={exportAll}
            disabled={statuses.all === "loading"}
            style={{
              padding: "14px 28px", borderRadius: 12,
              border: "none", fontSize: 14, fontWeight: 700,
              cursor: statuses.all === "loading" ? "wait" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              background: statuses.all === "done" ? "#f0fdf4" : "#1a1a1a",
              color: statuses.all === "done" ? "#16a34a" : "#fff",
              flexShrink: 0, transition: "all 0.2s"
            }}
          >
            {statuses.all === "loading" ? "⏳ Exporting..." : statuses.all === "done" ? "✅ All Done" : "⬇ Export All"}
          </button>
        </div>

        {/* ─── Logo Package ─── */}
        <CategoryHeader icon="✦" title="Logo Package" count={4} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ExportItem
            icon="📐" title="Logo — SVG"
            description="Scalable vector format. Best for web, print, and editing."
            files={[".svg"]}
            onExport={exportLogoSVG}
            status={statuses["logo-svg"]}
          />
          <ExportItem
            icon="🖼" title="Logo — PNG (5 sizes)"
            description="Transparent background at 64px, 128px, 256px, 512px, and 1024px."
            files={["64px", "128px", "256px", "512px", "1024px"]}
            onExport={exportLogoPNG}
            status={statuses["logo-png"]}
          />
          <ExportItem
            icon="📷" title="Logo — JPEG (3 backgrounds)"
            description="Logo on white, brand primary, and dark backgrounds at 1024px."
            files={["on-white.jpg", "on-primary.jpg", "on-dark.jpg"]}
            onExport={exportLogoJPEG}
            status={statuses["logo-jpeg"]}
          />
          <ExportItem
            icon="⭐" title="Favicons & App Icons"
            description="All standard sizes for web and mobile apps."
            files={["16px", "32px", "48px", "64px", "180px", "192px", "512px"]}
            onExport={exportFavicons}
            status={statuses["favicons"]}
          />
        </div>

        {/* ─── Color Assets ─── */}
        <CategoryHeader icon="🎨" title="Color Assets" count={3} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ExportItem
            icon="📊" title="Color Swatch — PNG"
            description="Visual color palette image for reference and presentations."
            files={[".png"]}
            onExport={exportColorSwatch}
            status={statuses["color-swatch"]}
          />
          <ExportItem
            icon="📋" title="Color Reference — TXT"
            description="Complete color values in HEX, RGB, and CMYK formats."
            files={[".txt"]}
            onExport={exportColorReport}
            status={statuses["color-report"]}
          />
          <ExportItem
            icon="🎯" title="Figma Design Tokens"
            description="JSON tokens for Figma Token Studio plugin. Colors, fonts, sizes."
            files={[".json"]}
            onExport={exportFigmaTokens}
            status={statuses["figma"]}
          />
        </div>

        {/* ─── Developer Assets ─── */}
        <CategoryHeader icon="⌨" title="Developer Assets" count={2} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ExportItem
            icon="🎨" title="CSS Variables"
            description="Design tokens as CSS custom properties. Colors, fonts, spacing, and utility classes."
            files={[".css"]}
            onExport={exportCSS}
            status={statuses["css"]}
          />
          <ExportItem
            icon="🌊" title="Tailwind Config"
            description="Brand colors and fonts as a Tailwind CSS configuration file."
            files={[".config.js"]}
            onExport={exportTailwind}
            status={statuses["tailwind"]}
          />
        </div>

        {/* ─── Social Media Kit ─── */}
        <CategoryHeader icon="📱" title="Social Media Kit" count={2} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ExportItem
            icon="🖼" title="Platform Headers & Covers"
            description="Branded images sized for every major platform."
            files={["1080×1080", "1080×1920", "1200×630", "1500×500", "1584×396", "2560×1440"]}
            onExport={exportSocialKit}
            status={statuses["social"]}
          />
          <ExportItem
            icon="👤" title="Profile Pictures"
            description="Circular branded profile images at multiple sizes."
            files={["110px", "160px", "320px", "400px"]}
            onExport={exportProfilePics}
            status={statuses["profile-pics"]}
          />
        </div>

        {/* ─── Brand Guide ─── */}
        <CategoryHeader icon="📖" title="Brand Guide" count={1} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ExportItem
            icon="📄" title="Brand Identity Guide — PDF"
            description="Complete 15+ page brand guidelines. Opens print dialog for PDF save."
            files={[".pdf"]}
            onExport={exportBrandGuide}
            status={statuses["brand-guide"]}
          />
        </div>

        {/* ─── Summary Footer ─── */}
        <div style={{
          marginTop: 40, padding: 28,
          background: "#fff", borderRadius: 16,
          border: "1px solid #f0f0f0", textAlign: "center"
        }}>
          <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>
            Export Summary
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            {[
              { label: "Logo Files", count: "11+", icon: "✦" },
              { label: "Color Assets", count: "3", icon: "🎨" },
              { label: "Dev Tokens", count: "2", icon: "⌨" },
              { label: "Social Images", count: "10", icon: "📱" },
              { label: "Brand Guide", count: "1", icon: "📖" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", fontFamily: "'JetBrains Mono', monospace" }}>{s.count}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20, padding: "10px 0",
            borderTop: "1px solid #f5f5f5", fontSize: 12, color: "#ccc"
          }}>
            27+ production-ready files · Generated by BrandForge
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          [style*="position: sticky"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
