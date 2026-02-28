import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ─── Curated Palettes ───
const PALETTES = [
  { name: "Midnight Luxe", colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"] },
  { name: "Sunset Coral", colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"] },
  { name: "Forest Calm", colors: ["#2D6A4F", "#40916C", "#52B788", "#95D5B2", "#D8F3DC"] },
  { name: "Royal Purple", colors: ["#10002B", "#240046", "#3C096C", "#7B2CBF", "#C77DFF"] },
  { name: "Warm Earth", colors: ["#6B4226", "#A0522D", "#CD853F", "#DEB887", "#FAEBD7"] },
  { name: "Ocean Breeze", colors: ["#023E8A", "#0077B6", "#0096C7", "#48CAE4", "#CAF0F8"] },
  { name: "Monochrome", colors: ["#111111", "#333333", "#666666", "#999999", "#EEEEEE"] },
  { name: "Blush & Gold", colors: ["#B76E79", "#E8B4B8", "#F5E6CC", "#D4A574", "#8B6914"] },
  { name: "Neon Electric", colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"] },
  { name: "Sage & Sand", colors: ["#606C38", "#7C8B5E", "#BCBD8B", "#DDA15E", "#FEFAE0"] },
];

// ─── Utility: Parse Colors from SVG ───
function extractSvgColors(svgString) {
  const colorSet = new Set();
  // Match hex colors
  const hexPattern = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
  let match;
  while ((match = hexPattern.exec(svgString)) !== null) {
    colorSet.add(normalizeHex(match[0]));
  }
  // Match rgb/rgba
  const rgbPattern = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  while ((match = rgbPattern.exec(svgString)) !== null) {
    colorSet.add(rgbToHex(+match[1], +match[2], +match[3]));
  }
  // Match named colors in fill/stroke attributes
  const namedPattern = /(?:fill|stroke)\s*[:=]\s*"?(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|navy|teal|cyan|maroon|olive|silver|aqua|fuchsia|lime)"?/gi;
  const namedMap = {
    white: "#FFFFFF", black: "#000000", red: "#FF0000", blue: "#0000FF",
    green: "#008000", yellow: "#FFFF00", orange: "#FFA500", purple: "#800080",
    pink: "#FFC0CB", gray: "#808080", grey: "#808080", navy: "#000080",
    teal: "#008080", cyan: "#00FFFF", maroon: "#800000", olive: "#808000",
    silver: "#C0C0C0", aqua: "#00FFFF", fuchsia: "#FF00FF", lime: "#00FF00"
  };
  while ((match = namedPattern.exec(svgString)) !== null) {
    const name = match[1].toLowerCase();
    if (namedMap[name]) colorSet.add(namedMap[name]);
  }
  // Remove "none" and transparent-like values
  colorSet.delete("#NaN");
  return Array.from(colorSet).filter(c => c && c !== "none");
}

function normalizeHex(hex) {
  hex = hex.toUpperCase();
  if (hex.length === 4) {
    return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function hexToRgb(hex) {
  hex = normalizeHex(hex);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function recolorSvg(svgString, colorMap) {
  let result = svgString;
  // Sort by length descending so longer hex codes get replaced first
  const entries = Object.entries(colorMap).sort((a, b) => b[0].length - a[0].length);
  for (const [original, replacement] of entries) {
    // Replace hex (case insensitive)
    const escapedOrig = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOrig, "gi");
    result = result.replace(regex, replacement);
    // Also handle 3-char shorthand if applicable
    if (original.length === 7) {
      const r = original[1], g = original[3], b = original[5];
      if (original[1] === original[2] && original[3] === original[4] && original[5] === original[6]) {
        const short = `#${r}${g}${b}`;
        const shortRegex = new RegExp(short.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
        result = result.replace(shortRegex, replacement);
      }
    }
  }
  return result;
}

function generateMonochrome(svgString, extractedColors, targetColor) {
  const sorted = [...extractedColors].sort((a, b) => getLuminance(a) - getLuminance(b));
  const map = {};
  const { r, g, b } = hexToRgb(targetColor);
  sorted.forEach((c, i) => {
    const factor = sorted.length === 1 ? 1 : i / (sorted.length - 1);
    // Blend from target color (darkest) to lighter tint
    const nr = Math.round(r + (255 - r) * factor * 0.7);
    const ng = Math.round(g + (255 - g) * factor * 0.7);
    const nb = Math.round(b + (255 - b) * factor * 0.7);
    map[c] = rgbToHex(nr, ng, nb);
  });
  return recolorSvg(svgString, map);
}

function generateSingleColor(svgString, extractedColors, color) {
  const map = {};
  extractedColors.forEach(c => { map[c] = color; });
  return recolorSvg(svgString, map);
}

function generateInverted(svgString, extractedColors) {
  const map = {};
  extractedColors.forEach(c => {
    const lum = getLuminance(c);
    map[c] = lum > 0.5 ? "#1A1A1A" : "#FFFFFF";
  });
  return recolorSvg(svgString, map);
}

// ─── SVG Renderer ───
function SvgDisplay({ svgString, bg, label, size = 80, sublabel }) {
  const containerBg = bg || "#FFFFFF";
  const isDark = getLuminance(containerBg) < 0.4;
  return (
    <div style={{
      background: containerBg,
      borderRadius: 14,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 140,
      border: containerBg === "#FFFFFF" ? "1px solid #eee" : "none",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: svgString }}
        style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
      />
      {label && (
        <div style={{
          marginTop: 12, fontSize: 11, fontWeight: 600,
          color: isDark ? "rgba(255,255,255,0.6)" : "#999",
          textTransform: "uppercase", letterSpacing: 1.5
        }}>
          {label}
        </div>
      )}
      {sublabel && (
        <div style={{
          marginTop: 2, fontSize: 10,
          color: isDark ? "rgba(255,255,255,0.4)" : "#bbb",
          fontFamily: "monospace"
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ─── Color Mapping UI ───
function ColorMapper({ extractedColors, brandColors, colorMap, setColorMap }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        fontSize: 12, color: "#888", lineHeight: 1.6, padding: "12px 16px",
        background: "#f8f9fa", borderRadius: 10, border: "1px solid #f0f0f0"
      }}>
        Map each color found in your logo to a brand color. Click a brand color swatch to assign it.
      </div>
      {extractedColors.map((origColor) => (
        <div key={origColor} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", background: "#fff", borderRadius: 10,
          border: "1px solid #f0f0f0"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: origColor,
            border: "1px solid #e0e0e0", flexShrink: 0,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)"
          }} />
          <div style={{ fontSize: 11, color: "#999", fontFamily: "monospace", width: 64 }}>
            {origColor}
          </div>
          <svg width="20" height="12" viewBox="0 0 20 12" style={{ flexShrink: 0 }}>
            <path d="M2 6h12m0 0l-4-4m4 4l-4 4" stroke="#ccc" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {brandColors.map((bc) => (
              <div
                key={bc}
                onClick={() => setColorMap(prev => ({ ...prev, [origColor]: bc }))}
                style={{
                  width: 32, height: 32, borderRadius: 6, background: bc,
                  cursor: "pointer", border: colorMap[origColor] === bc ? "3px solid #1a1a1a" : "2px solid transparent",
                  boxShadow: colorMap[origColor] === bc ? "0 0 0 1px #fff, 0 0 0 3px #1a1a1a" : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                  transition: "all 0.15s",
                  transform: colorMap[origColor] === bc ? "scale(1.1)" : "scale(1)"
                }}
                title={bc}
              />
            ))}
            <input
              type="color"
              value={colorMap[origColor] || origColor}
              onChange={(e) => setColorMap(prev => ({ ...prev, [origColor]: e.target.value.toUpperCase() }))}
              style={{
                width: 32, height: 32, border: "2px dashed #ddd", borderRadius: 6,
                cursor: "pointer", padding: 0, background: "transparent"
              }}
              title="Custom color"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Palette Selector ───
function PaletteStrip({ palette, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: 10, borderRadius: 10, cursor: "pointer",
        border: `2px solid ${isSelected ? "#1a1a1a" : "#eee"}`,
        background: isSelected ? "#fafafa" : "#fff",
        transition: "all 0.15s",
        minWidth: 120
      }}
    >
      <div style={{ display: "flex", gap: 2, height: 20, borderRadius: 4, overflow: "hidden" }}>
        {palette.colors.map(c => (
          <div key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#666", textAlign: "center" }}>
        {palette.name}
      </div>
    </div>
  );
}

// ─── Download helpers ───
function downloadSvg(svgString, filename) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadPng(svgString, filename, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const scale = Math.min(size / img.width, size / img.height) * 0.8;
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    canvas.toBlob((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = filename; a.click();
    }, "image/png");
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function downloadJpeg(svgString, filename, bgColor = "#FFFFFF", size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  const img = new Image();
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const scale = Math.min(size / img.width, size / img.height) * 0.8;
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    canvas.toBlob((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = filename; a.click();
    }, "image/jpeg", 0.95);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// ─── Main App ───
export default function SvgLogoEngine() {
  const [svgRaw, setSvgRaw] = useState(null);
  const [svgString, setSvgString] = useState("");
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [customColors, setCustomColors] = useState(["#1A1A1A", "#444444", "#888888", "#CCCCCC", "#F5F5F5"]);
  const [useCustom, setUseCustom] = useState(false);
  const [colorMap, setColorMap] = useState({});
  const [activeTab, setActiveTab] = useState("remap");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const brandColors = useCustom ? customColors : PALETTES[selectedPalette].colors;

  // Process SVG upload
  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      let raw = e.target.result;
      // Make SVG scalable: ensure viewBox exists and remove fixed width/height
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (svgEl) {
        if (!svgEl.getAttribute("viewBox")) {
          const w = svgEl.getAttribute("width") || "100";
          const h = svgEl.getAttribute("height") || "100";
          svgEl.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
        }
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "100%");
        raw = new XMLSerializer().serializeToString(svgEl);
      }
      setSvgRaw(raw);
      setSvgString(raw);
      const colors = extractSvgColors(raw);
      setExtractedColors(colors);
      // Auto-map: assign brand colors to extracted colors in order of luminance
      const sorted = [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));
      const autoMap = {};
      sorted.forEach((c, i) => {
        autoMap[c] = brandColors[i % brandColors.length];
      });
      setColorMap(autoMap);
    };
    reader.readAsText(file);
  }, [brandColors]);

  // Recolor SVG when colorMap changes
  const remappedSvg = useMemo(() => {
    if (!svgRaw) return "";
    return recolorSvg(svgRaw, colorMap);
  }, [svgRaw, colorMap]);

  // Generate all variations
  const variations = useMemo(() => {
    if (!svgRaw || extractedColors.length === 0) return [];
    const v = [];

    // Original
    v.push({ label: "Original", svg: svgRaw, bg: "#FFFFFF" });

    // Remapped (brand colors)
    v.push({ label: "Brand Colors", svg: remappedSvg, bg: "#FFFFFF" });

    // On dark background
    v.push({ label: "On Dark", svg: remappedSvg, bg: "#1A1A1A" });

    // On brand primary
    v.push({ label: `On ${brandColors[0]}`, svg: remappedSvg, bg: brandColors[0], sublabel: brandColors[0] });

    // Monochrome in each brand color
    brandColors.forEach((bc, i) => {
      v.push({
        label: `Mono ${["Primary", "Secondary", "Accent", "Neutral", "Light"][i] || `Color ${i + 1}`}`,
        svg: generateMonochrome(svgRaw, extractedColors, bc),
        bg: "#FFFFFF",
        sublabel: bc
      });
    });

    // Single color (flat) in primary & white
    v.push({ label: "Flat Primary", svg: generateSingleColor(svgRaw, extractedColors, brandColors[0]), bg: "#FFFFFF", sublabel: brandColors[0] });
    v.push({ label: "Flat White", svg: generateSingleColor(svgRaw, extractedColors, "#FFFFFF"), bg: brandColors[0], sublabel: "#FFFFFF" });

    // Inverted
    v.push({ label: "High Contrast", svg: generateInverted(svgRaw, extractedColors), bg: "#FFFFFF" });
    v.push({ label: "High Contrast Dark", svg: generateInverted(svgRaw, extractedColors), bg: "#1A1A1A" });

    return v;
  }, [svgRaw, extractedColors, remappedSvg, brandColors]);

  // ─── Styles ───
  const fontLink = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono&display=swap";

  useEffect(() => {
    const link = document.createElement("link");
    link.href = fontLink; link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const uiFont = "'DM Sans', sans-serif";

  if (!svgRaw) {
    return (
      <div style={{
        fontFamily: uiFont, minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 40, color: "#fff"
      }}>
        {/* Decorative elements */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "10%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.06), transparent)", filter: "blur(80px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32,
            padding: "8px 16px", background: "rgba(255,255,255,0.05)",
            borderRadius: 40, border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{
              width: 28, height: 28, background: "#fff", borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, color: "#0A0A0A"
            }}>B</div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>BrandForge</span>
            <span style={{ fontSize: 11, color: "#666", borderLeft: "1px solid #333", paddingLeft: 10, marginLeft: 4 }}>Logo Engine</span>
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 700, margin: "0 0 16px",
            lineHeight: 1.1, letterSpacing: -2,
            background: "linear-gradient(135deg, #fff 0%, #999 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Drop your SVG.<br/>Get every variation.
          </h1>
          <p style={{ fontSize: 17, color: "#666", marginBottom: 40, lineHeight: 1.6 }}>
            Upload your logo and we'll parse every color, remap it to your brand palette,
            and generate all the variations you need — in seconds.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#fff" : "#333"}`,
              borderRadius: 20, padding: "48px 40px",
              cursor: "pointer",
              background: dragOver ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
              transition: "all 0.3s"
            }}
          >
            <input ref={fileRef} type="file" accept=".svg" hidden onChange={(e) => handleFile(e.target.files[0])} />
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
              Drop your SVG logo here
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              or click to browse · SVG files only
            </div>
          </div>

          <div style={{
            marginTop: 32, display: "flex", gap: 24, justifyContent: "center",
            fontSize: 12, color: "#444"
          }}>
            <span>✦ Color parsing</span>
            <span>✦ Brand remapping</span>
            <span>✦ 15+ variations</span>
            <span>✦ PNG / JPEG / SVG export</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Editor UI ───
  return (
    <div style={{
      fontFamily: uiFont, minHeight: "100vh",
      background: "#F5F5F0",
      color: "#1a1a1a"
    }}>
      {/* Top Bar */}
      <div style={{
        padding: "12px 24px",
        background: "#fff",
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
          <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
          <span style={{ color: "#888", fontSize: 13 }}>Logo Engine</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { setSvgRaw(null); setSvgString(""); setExtractedColors([]); setColorMap({}); }}
            style={{
              padding: "8px 16px", background: "transparent", color: "#666",
              border: "1px solid #ddd", borderRadius: 8, fontSize: 12,
              fontWeight: 600, cursor: "pointer", fontFamily: uiFont
            }}
          >
            ↩ New Logo
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 53px)" }}>
        {/* Left Sidebar */}
        <div style={{
          width: 340, background: "#fff", borderRight: "1px solid #eee",
          padding: 24, overflowY: "auto", flexShrink: 0
        }}>
          {/* Original Logo Preview */}
          <div style={{
            background: "#fafafa", borderRadius: 12, padding: 20,
            marginBottom: 24, textAlign: "center"
          }}>
            <div
              dangerouslySetInnerHTML={{ __html: svgRaw }}
              style={{ width: 80, height: 80, margin: "0 auto 8px" }}
            />
            <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>
              Original · {extractedColors.length} color{extractedColors.length !== 1 ? "s" : ""} detected
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f5f5f5", borderRadius: 10, padding: 3 }}>
            {[["remap", "Color Map"], ["palette", "Palette"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  flex: 1, padding: "8px 0", border: "none", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: activeTab === key ? "#fff" : "transparent",
                  color: activeTab === key ? "#1a1a1a" : "#888",
                  boxShadow: activeTab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  fontFamily: uiFont, transition: "all 0.15s"
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "remap" && (
            <ColorMapper
              extractedColors={extractedColors}
              brandColors={brandColors}
              colorMap={colorMap}
              setColorMap={setColorMap}
            />
          )}

          {activeTab === "palette" && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                Brand Palette
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {PALETTES.map((p, i) => (
                  <PaletteStrip
                    key={p.name}
                    palette={p}
                    isSelected={selectedPalette === i && !useCustom}
                    onClick={() => {
                      setSelectedPalette(i);
                      setUseCustom(false);
                      // Re-auto-map
                      const sorted = [...extractedColors].sort((a, b) => getLuminance(a) - getLuminance(b));
                      const autoMap = {};
                      sorted.forEach((c, j) => { autoMap[c] = p.colors[j % p.colors.length]; });
                      setColorMap(autoMap);
                    }}
                  />
                ))}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 8, marginTop: 16
              }}>
                Custom Colors
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {customColors.map((c, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <input
                      type="color" value={c}
                      onChange={(e) => {
                        const nc = [...customColors];
                        nc[i] = e.target.value.toUpperCase();
                        setCustomColors(nc);
                        setUseCustom(true);
                        const sorted = [...extractedColors].sort((a, b) => getLuminance(a) - getLuminance(b));
                        const autoMap = {};
                        sorted.forEach((col, j) => { autoMap[col] = nc[j % nc.length]; });
                        setColorMap(autoMap);
                      }}
                      style={{ width: 40, height: 40, border: "2px solid #eee", borderRadius: 8, cursor: "pointer", padding: 0 }}
                    />
                    <div style={{ fontSize: 9, color: "#bbb", fontFamily: "'Space Mono', monospace", marginTop: 3 }}>
                      {c}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          {/* Section: Brand Remapped */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
                  Logo Variations
                </h2>
                <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
                  {variations.length} variations generated · Click any card to download
                </p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["SVG", "PNG", "JPEG"].map(fmt => (
                  <span key={fmt} style={{
                    padding: "4px 10px", background: "#fff", borderRadius: 6,
                    fontSize: 10, fontWeight: 700, color: "#666",
                    border: "1px solid #e5e5e5", letterSpacing: 0.5
                  }}>
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14
            }}>
              {variations.map((v, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <SvgDisplay svgString={v.svg} bg={v.bg} label={v.label} sublabel={v.sublabel} size={70} />
                  {/* Download buttons on hover */}
                  <div style={{
                    position: "absolute", bottom: 8, right: 8,
                    display: "flex", gap: 3, opacity: 0,
                    transition: "opacity 0.2s"
                  }}
                  className="dl-btns"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadSvg(v.svg, `logo-${v.label.toLowerCase().replace(/\s+/g, "-")}.svg`); }}
                      style={{
                        padding: "4px 8px", fontSize: 9, fontWeight: 700,
                        background: "#1a1a1a", color: "#fff", border: "none",
                        borderRadius: 5, cursor: "pointer", fontFamily: uiFont
                      }}
                    >SVG</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadPng(v.svg, `logo-${v.label.toLowerCase().replace(/\s+/g, "-")}.png`); }}
                      style={{
                        padding: "4px 8px", fontSize: 9, fontWeight: 700,
                        background: "#1a1a1a", color: "#fff", border: "none",
                        borderRadius: 5, cursor: "pointer", fontFamily: uiFont
                      }}
                    >PNG</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadJpeg(v.svg, `logo-${v.label.toLowerCase().replace(/\s+/g, "-")}.jpg`, v.bg); }}
                      style={{
                        padding: "4px 8px", fontSize: 9, fontWeight: 700,
                        background: "#1a1a1a", color: "#fff", border: "none",
                        borderRadius: 5, cursor: "pointer", fontFamily: uiFont
                      }}
                    >JPG</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size Variations */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
              Size Reference
            </h2>
            <p style={{ margin: "0 0 16px", color: "#888", fontSize: 13 }}>
              How your logo looks at different scales
            </p>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 20,
              background: "#fff", borderRadius: 16, padding: 32,
              border: "1px solid #eee"
            }}>
              {[{ s: 16, l: "Favicon" }, { s: 32, l: "32px" }, { s: 48, l: "48px" }, { s: 64, l: "App Icon" }, { s: 96, l: "96px" }, { s: 128, l: "128px" }].map(({ s, l }) => (
                <div key={s} style={{ textAlign: "center" }}>
                  <div
                    dangerouslySetInnerHTML={{ __html: remappedSvg }}
                    style={{ width: s, height: s, margin: "0 auto 8px" }}
                  />
                  <div style={{ fontSize: 10, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Space Guide */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
              Clear Space & Minimum Size
            </h2>
            <p style={{ margin: "0 0 16px", color: "#888", fontSize: 13 }}>
              Guidelines for proper logo usage
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16
            }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #eee", textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div style={{
                    border: "2px dashed rgba(255,0,0,0.2)", padding: 24,
                    borderRadius: 8, position: "relative"
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)",
                      background: "#fff", padding: "0 6px", fontSize: 9, color: "#e74c3c",
                      fontWeight: 600, fontFamily: "'Space Mono', monospace"
                    }}>X</div>
                    <div style={{
                      position: "absolute", left: 0, top: "50%", transform: "translate(-50%, -50%) rotate(-90deg)",
                      background: "#fff", padding: "0 6px", fontSize: 9, color: "#e74c3c",
                      fontWeight: 600, fontFamily: "'Space Mono', monospace"
                    }}>X</div>
                    <div
                      dangerouslySetInnerHTML={{ __html: remappedSvg }}
                      style={{ width: 80, height: 80 }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 16, fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                  <strong>Clear Space</strong><br/>
                  Maintain a minimum clear space of "X" around all sides, where X equals the height of the logomark.
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 20, alignItems: "flex-end", marginBottom: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <div dangerouslySetInnerHTML={{ __html: remappedSvg }} style={{ width: 24, height: 24, margin: "0 auto", opacity: 0.3 }} />
                    <div style={{ fontSize: 9, color: "#e74c3c", marginTop: 4, fontFamily: "'Space Mono'" }}>✗ Too small</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div dangerouslySetInnerHTML={{ __html: remappedSvg }} style={{ width: 48, height: 48, margin: "0 auto" }} />
                    <div style={{ fontSize: 9, color: "#2ecc71", marginTop: 4, fontFamily: "'Space Mono'" }}>✓ Minimum</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div dangerouslySetInnerHTML={{ __html: remappedSvg }} style={{ width: 80, height: 80, margin: "0 auto" }} />
                    <div style={{ fontSize: 9, color: "#2ecc71", marginTop: 4, fontFamily: "'Space Mono'" }}>✓ Preferred</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, textAlign: "center" }}>
                  <strong>Minimum Size</strong><br/>
                  Never display the logo smaller than 48px wide for digital or 12mm for print.
                </div>
              </div>
            </div>
          </div>

          {/* Incorrect Usage */}
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
              Incorrect Usage
            </h2>
            <p style={{ margin: "0 0 16px", color: "#888", fontSize: 13 }}>
              Never modify the logo in these ways
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Don't stretch", transform: "scaleX(1.5)" },
                { label: "Don't rotate", transform: "rotate(15deg)" },
                { label: "Don't skew", transform: "skewX(15deg)" },
                { label: "Don't add effects", filter: "drop-shadow(4px 4px 0 rgba(255,0,0,0.5))" },
              ].map((rule) => (
                <div key={rule.label} style={{
                  background: "#fff", borderRadius: 12, padding: 20,
                  border: "2px solid #fee2e2", textAlign: "center"
                }}>
                  <div style={{
                    width: 56, height: 56, margin: "0 auto 10px",
                    transform: rule.transform || "none",
                    filter: rule.filter || "none",
                    opacity: 0.6
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: remappedSvg }} style={{ width: "100%", height: "100%" }} />
                  </div>
                  <div style={{
                    position: "relative",
                    display: "inline-flex", alignItems: "center", gap: 4
                  }}>
                    <span style={{ color: "#e74c3c", fontSize: 14, fontWeight: 700 }}>✗</span>
                    <span style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>{rule.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover styles for download buttons */}
      <style>{`
        div:hover > .dl-btns { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
