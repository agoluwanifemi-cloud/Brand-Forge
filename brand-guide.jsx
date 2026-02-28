import { useState, useEffect, useMemo, useRef } from "react";

// ─── Sample Brand Data (in production, this comes from Build 1 + Build 2) ───
const DEFAULT_BRAND = {
  name: "Lumina Studio",
  tagline: "Designing the future, today",
  industry: "Architecture & Design",
  logo: null, // SVG string — user uploads
  audiences: ["Professionals / B2B", "Executives / C-Suite"],
  traits: ["Sophisticated", "Innovative", "Minimal", "Trustworthy", "Bold"],
  voiceFormal: 65,
  voiceSerious: 55,
  voiceTechnical: 40,
  voiceEnthusiasm: 60,
  mission: "To transform spaces into experiences that inspire human connection, blending cutting-edge design thinking with timeless architectural principles to create environments where people thrive.",
  vision: "A world where every built space — from homes to cities — is designed with intention, sustainability, and the human spirit at its center.",
  about: "Lumina Studio is an award-winning architecture and design firm founded in 2019. We specialize in residential, commercial, and public spaces that balance beauty with function. Our multidisciplinary team brings together architects, interior designers, and brand strategists to deliver holistic design experiences. Based in New York with projects spanning three continents, we believe design is not just what it looks like — it's how it makes you feel.",
  values: [
    { name: "Intentional Design", desc: "Every line, material, and space serves a purpose." },
    { name: "Human-Centered", desc: "We design for people first, aesthetics second." },
    { name: "Sustainable Innovation", desc: "Pushing boundaries while respecting the planet." },
    { name: "Radical Collaboration", desc: "The best work happens when disciplines collide." },
    { name: "Timeless Quality", desc: "We build things meant to endure." }
  ],
  voiceGuide: {
    description: "Lumina Studio speaks with quiet confidence — authoritative but never arrogant, sophisticated but accessible. Our voice reflects the precision of our design work: every word is intentional.",
    weAre: ["Confident and clear", "Warm but professional", "Forward-thinking"],
    weAreNot: ["Jargon-heavy or exclusionary", "Casual or flippant", "Aggressive or salesy"]
  },
  elevatorPitch: "We're Lumina Studio — an architecture and design firm that creates spaces where people actually want to be. We blend innovative design thinking with deep respect for how spaces affect human behavior, delivering projects that are as functional as they are beautiful.",
  socialBios: {
    instagram: "Architecture & design for the human spirit. ✦ NYC → Worldwide. Creating spaces that inspire.",
    linkedin: "Lumina Studio is a multidisciplinary architecture and design firm creating intentional, human-centered spaces. Residential · Commercial · Public. New York | London | Tokyo.",
    twitter: "Architecture & design studio. Spaces that inspire human connection. NYC-based, globally minded. ✦"
  },
  headingFont: "Playfair Display",
  bodyFont: "Outfit",
  colors: {
    primary: "#1B2838",
    secondary: "#3D5A73",
    accent: "#C9A96E",
    neutral: "#8A9BAE",
    background: "#F4F1EC"
  }
};

// ─── Color Utilities ───
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function hexToCmyk(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

function generateTints(hex, steps = 9) {
  const { r, g, b } = hexToRgb(hex);
  return Array.from({ length: steps }, (_, i) => {
    const factor = (i + 1) / (steps + 1);
    return rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    );
  });
}

function generateShades(hex, steps = 9) {
  const { r, g, b } = hexToRgb(hex);
  return Array.from({ length: steps }, (_, i) => {
    const factor = (i + 1) / (steps + 1);
    return rgbToHex(r * (1 - factor), g * (1 - factor), b * (1 - factor));
  });
}

function getLum(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function contrastRatio(hex1, hex2) {
  const l1 = getLum(hex1), l2 = getLum(hex2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(1);
}

// ─── Placeholder Logo SVG ───
const PLACEHOLDER_LOGO = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="30" width="30" height="50" rx="4" fill="#1B2838"/><rect x="45" y="15" width="25" height="65" rx="4" fill="#3D5A73"/><polygon points="78,80 60,80 69,20" fill="#C9A96E"/></svg>`;

// ─── Page Component ───
function Page({ number, children, bg, noPad, id }) {
  return (
    <div id={id} style={{
      background: bg || "#FFFFFF",
      minHeight: "100vh",
      padding: noPad ? 0 : "60px 72px",
      position: "relative",
      breakAfter: "page",
      boxSizing: "border-box"
    }}>
      {children}
      {number && (
        <div style={{
          position: "absolute", bottom: 28, right: 40,
          fontSize: 11, color: "rgba(0,0,0,0.2)",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1
        }}>
          {String(number).padStart(2, "0")}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ number, title, subtitle, color }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: color || "#C9A96E",
        letterSpacing: 3, textTransform: "uppercase", marginBottom: 6,
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        {number}
      </div>
      <h2 style={{
        fontSize: 36, fontWeight: 700, margin: "0 0 8px",
        letterSpacing: -1, lineHeight: 1.1, color: "#1a1a1a",
        fontFamily: "var(--heading-font)"
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 15, color: "#888", margin: 0, lineHeight: 1.6 }}>{subtitle}</p>
      )}
    </div>
  );
}

function ColorSwatch({ hex, label, showValues, large }) {
  const { r, g, b } = hexToRgb(hex);
  const cmyk = hexToCmyk(hex);
  const isDark = getLum(hex) < 0.45;
  return (
    <div style={{ flex: large ? 2 : 1 }}>
      <div style={{
        background: hex, borderRadius: 12,
        height: large ? 140 : 100,
        padding: 16, display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}>
        {label && (
          <div style={{
            fontSize: 12, fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a",
            textTransform: "uppercase", letterSpacing: 1
          }}>{label}</div>
        )}
      </div>
      {showValues && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#888", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
          <div>HEX {hex}</div>
          <div>RGB {r}, {g}, {b}</div>
          <div>CMYK {cmyk.c}, {cmyk.m}, {cmyk.y}, {cmyk.k}</div>
        </div>
      )}
    </div>
  );
}

// ─── Table of Contents ───
function TOCItem({ num, title, page }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 12,
      padding: "14px 0", borderBottom: "1px solid #f0ede8"
    }}>
      <span style={{ fontSize: 12, color: "#C9A96E", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, minWidth: 28 }}>
        {num}
      </span>
      <span style={{ fontSize: 17, fontWeight: 500, color: "#1a1a1a", flex: 1 }}>{title}</span>
      <span style={{
        fontSize: 12, color: "#bbb", fontFamily: "'JetBrains Mono', monospace"
      }}>{String(page).padStart(2, "0")}</span>
    </div>
  );
}

// ─── Main Guide Component ───
export default function BrandGuide() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [logoSvg, setLogoSvg] = useState(PLACEHOLDER_LOGO);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const l1 = document.createElement("link");
    l1.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
    l1.rel = "stylesheet";
    document.head.appendChild(l1);
  }, []);

  const c = brand.colors;
  const hf = `'${brand.headingFont}', serif`;
  const bf = `'${brand.bodyFont}', sans-serif`;

  const handleLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      let raw = e.target.result;
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
      setLogoSvg(raw);
      setShowUpload(false);
    };
    reader.readAsText(file);
  };

  const tints = {
    primary: generateTints(c.primary, 5),
    secondary: generateTints(c.secondary, 5),
    accent: generateTints(c.accent, 5)
  };
  const shades = {
    primary: generateShades(c.primary, 5),
    secondary: generateShades(c.secondary, 5),
    accent: generateShades(c.accent, 5)
  };

  return (
    <div style={{
      fontFamily: bf,
      "--heading-font": hf,
      "--body-font": bf,
      "--primary": c.primary,
      "--secondary": c.secondary,
      "--accent": c.accent,
      background: "#E8E4DE"
    }}>
      {/* ─── Sticky Top Bar ─── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "10px 24px",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #eee",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
          <span style={{ fontFamily: hf, fontWeight: 700, fontSize: 14, color: c.primary }}>
            {brand.name}
          </span>
          <span style={{ color: "#ccc" }}>·</span>
          <span style={{ fontSize: 12, color: "#999" }}>Brand Identity Guidelines</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{
              padding: "6px 14px", fontSize: 11, fontWeight: 600,
              background: "transparent", border: "1px solid #ddd",
              borderRadius: 6, cursor: "pointer", fontFamily: bf, color: "#666"
            }}
          >
            {showUpload ? "✕ Close" : "↑ Upload Logo"}
          </button>
          <button
            onClick={() => window.print?.()}
            style={{
              padding: "6px 14px", fontSize: 11, fontWeight: 600,
              background: c.primary, border: "none",
              borderRadius: 6, cursor: "pointer", fontFamily: bf, color: "#fff"
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {showUpload && (
        <div style={{
          padding: 20, background: "#fff", borderBottom: "1px solid #eee",
          textAlign: "center"
        }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed #ddd", borderRadius: 12, padding: 32,
              cursor: "pointer", maxWidth: 400, margin: "0 auto"
            }}
          >
            <input ref={fileRef} type="file" accept=".svg" hidden onChange={(e) => handleLogoUpload(e.target.files[0])} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>Click to upload SVG logo</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Replaces the placeholder logo throughout the guide</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* ═══════════════ PAGE 1: COVER ═══════════════ */}
        <Page number={null} noPad id="cover">
          <div style={{
            background: `linear-gradient(160deg, ${c.primary} 0%, ${c.secondary} 100%)`,
            minHeight: "100vh", padding: "80px 72px",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between", position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: -200, right: -200,
              width: 600, height: 600, borderRadius: "50%",
              background: `${c.accent}11`
            }} />
            <div style={{
              position: "absolute", bottom: -150, left: -100,
              width: 500, height: 500, borderRadius: "50%",
              background: `${c.background}08`
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 80, height: 80, marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h1 style={{
                fontFamily: hf, fontSize: 64, fontWeight: 800,
                color: "#fff", margin: "0 0 16px", lineHeight: 1.05,
                letterSpacing: -3, maxWidth: 600
              }}>
                {brand.name}
              </h1>
              <p style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", margin: "0 0 40px", fontStyle: "italic" }}>
                {brand.tagline}
              </p>
              <div style={{
                display: "inline-block", padding: "10px 28px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 30, fontSize: 12, letterSpacing: 3,
                textTransform: "uppercase", color: "rgba(255,255,255,0.6)"
              }}>
                Brand Identity Guidelines
              </div>
            </div>
            <div style={{
              position: "relative", zIndex: 1,
              fontSize: 11, color: "rgba(255,255,255,0.25)",
              letterSpacing: 1
            }}>
              Confidential · {new Date().getFullYear()}
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 2: TABLE OF CONTENTS ═══════════════ */}
        <Page number={2} bg="#FDFCFA" id="toc">
          <div style={{ maxWidth: 500 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: c.accent,
              letterSpacing: 3, textTransform: "uppercase", marginBottom: 8,
              fontFamily: "'JetBrains Mono', monospace"
            }}>Contents</div>
            <h2 style={{ fontFamily: hf, fontSize: 36, fontWeight: 700, margin: "0 0 32px", color: "#1a1a1a", letterSpacing: -1 }}>
              Table of Contents
            </h2>
            <TOCItem num="01" title="Brand Story" page={3} />
            <TOCItem num="02" title="Brand Values" page={4} />
            <TOCItem num="03" title="Brand Personality" page={5} />
            <TOCItem num="04" title="Voice & Tone" page={6} />
            <TOCItem num="05" title="Logo Guidelines" page={7} />
            <TOCItem num="06" title="Logo Variations" page={8} />
            <TOCItem num="07" title="Color Palette" page={9} />
            <TOCItem num="08" title="Color System & Tints" page={10} />
            <TOCItem num="09" title="Color Accessibility" page={11} />
            <TOCItem num="10" title="Typography" page={12} />
            <TOCItem num="11" title="Typography in Action" page={13} />
            <TOCItem num="12" title="Business Collateral" page={14} />
            <TOCItem num="13" title="Digital Applications" page={15} />
            <TOCItem num="14" title="Brand Patterns" page={16} />
            <TOCItem num="15" title="Quick Reference" page={17} />
          </div>
        </Page>

        {/* ═══════════════ PAGE 3: BRAND STORY ═══════════════ */}
        <Page number={3} id="story">
          <SectionTitle number="01" title="Brand Story" subtitle="The heart and soul of who we are" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div style={{
              padding: 28, background: c.background, borderRadius: 14,
              borderLeft: `4px solid ${c.accent}`
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Mission</div>
              <p style={{ margin: 0, fontSize: 15, color: "#444", lineHeight: 1.8 }}>{brand.mission}</p>
            </div>
            <div style={{
              padding: 28, background: c.background, borderRadius: 14,
              borderLeft: `4px solid ${c.secondary}`
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.secondary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Vision</div>
              <p style={{ margin: 0, fontSize: 15, color: "#444", lineHeight: 1.8 }}>{brand.vision}</p>
            </div>
          </div>
          <div style={{
            padding: 32, background: "#fafafa", borderRadius: 14
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>About {brand.name}</div>
            <p style={{ margin: 0, fontSize: 16, color: "#333", lineHeight: 1.9 }}>{brand.about}</p>
          </div>
          <div style={{ marginTop: 32, padding: 24, background: c.primary, borderRadius: 14, textAlign: "center" }}>
            <p style={{ fontFamily: hf, fontSize: 22, color: "#fff", margin: 0, fontStyle: "italic", fontWeight: 500, lineHeight: 1.6 }}>
              "{brand.tagline}"
            </p>
          </div>
        </Page>

        {/* ═══════════════ PAGE 4: BRAND VALUES ═══════════════ */}
        <Page number={4} id="values">
          <SectionTitle number="02" title="Brand Values" subtitle="The principles that guide every decision" />
          <div style={{ display: "grid", gap: 16 }}>
            {brand.values.map((v, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "60px 1fr",
                gap: 20, padding: "24px 28px",
                background: i % 2 === 0 ? c.background : "#fff",
                borderRadius: 14, alignItems: "center"
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: c.primary, color: c.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16, fontWeight: 700
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c.primary, marginBottom: 4, fontFamily: hf }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Page>

        {/* ═══════════════ PAGE 5: PERSONALITY ═══════════════ */}
        <Page number={5} id="personality">
          <SectionTitle number="03" title="Brand Personality" subtitle="The traits that define how the brand feels" />
          <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
            {brand.traits.map((t, i) => (
              <div key={t} style={{
                padding: "14px 28px", borderRadius: 50,
                background: i === 0 ? c.primary : "transparent",
                color: i === 0 ? "#fff" : c.primary,
                border: `2px solid ${i === 0 ? c.primary : c.neutral}`,
                fontSize: 16, fontWeight: 600
              }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ padding: 28, background: c.background, borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
                If {brand.name} were a person...
              </div>
              <p style={{ margin: 0, fontSize: 15, color: "#444", lineHeight: 1.8 }}>
                They'd be the one in the room who listens intently, speaks with precision, and leaves a lasting impression not through volume but through substance. {brand.traits[0]}, yet approachable. {brand.traits[1]}, but grounded.
              </p>
            </div>
            <div style={{ padding: 28, background: c.primary, borderRadius: 14, color: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
                Brand Archetype
              </div>
              <div style={{ fontFamily: hf, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                The Creator
              </div>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.7, lineHeight: 1.7 }}>
                Driven by the desire to craft something of enduring value. The Creator archetype channels innovation through disciplined craft, turning vision into tangible reality.
              </p>
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 6: VOICE & TONE ═══════════════ */}
        <Page number={6} id="voice">
          <SectionTitle number="04" title="Voice & Tone" subtitle="How the brand communicates" />
          <p style={{ fontSize: 16, color: "#444", lineHeight: 1.8, marginBottom: 32, maxWidth: 600 }}>
            {brand.voiceGuide.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div style={{ padding: 28, background: "#f0fdf4", borderRadius: 14, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>✓ We Are</div>
              {brand.voiceGuide.weAre.map((w, i) => (
                <div key={i} style={{ fontSize: 15, color: "#333", padding: "8px 0", borderBottom: i < 2 ? "1px solid #dcfce7" : "none" }}>{w}</div>
              ))}
            </div>
            <div style={{ padding: 28, background: "#fef2f2", borderRadius: 14, border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>✗ We Are Not</div>
              {brand.voiceGuide.weAreNot.map((w, i) => (
                <div key={i} style={{ fontSize: 15, color: "#333", padding: "8px 0", borderBottom: i < 2 ? "1px solid #fee2e2" : "none" }}>{w}</div>
              ))}
            </div>
          </div>
          {/* Voice Spectrum */}
          <div style={{ padding: 28, background: "#fafafa", borderRadius: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>Voice Spectrum</div>
            {[
              { label: "Formality", value: brand.voiceFormal, left: "Casual", right: "Formal" },
              { label: "Mood", value: brand.voiceSerious, left: "Playful", right: "Serious" },
              { label: "Complexity", value: brand.voiceTechnical, left: "Simple", right: "Technical" },
              { label: "Energy", value: brand.voiceEnthusiasm, left: "Reserved", right: "Enthusiastic" }
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "#999", width: 50, textAlign: "right" }}>{s.left}</span>
                <div style={{ flex: 1, height: 6, background: "#e5e5e5", borderRadius: 3, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, height: "100%",
                    width: `${s.value}%`, background: c.primary, borderRadius: 3
                  }} />
                  <div style={{
                    position: "absolute", top: "50%", left: `${s.value}%`,
                    transform: "translate(-50%, -50%)",
                    width: 14, height: 14, borderRadius: "50%",
                    background: c.accent, border: "2px solid #fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
                  }} />
                </div>
                <span style={{ fontSize: 11, color: "#999", width: 70 }}>{s.right}</span>
              </div>
            ))}
          </div>
        </Page>

        {/* ═══════════════ PAGE 7: LOGO GUIDELINES ═══════════════ */}
        <Page number={7} id="logo">
          <SectionTitle number="05" title="Logo Guidelines" subtitle="Primary logo and usage rules" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              { bg: "#fff", label: "Light Background", border: true },
              { bg: c.primary, label: "Brand Primary" },
              { bg: "#1a1a1a", label: "Dark Background" }
            ].map(v => (
              <div key={v.label} style={{
                background: v.bg, borderRadius: 14, padding: 32,
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: 160,
                border: v.border ? "1px solid #eee" : "none"
              }}>
                <div style={{ width: 80, height: 80 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
                <span style={{
                  marginTop: 12, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5,
                  color: v.bg === "#fff" ? "#aaa" : "rgba(255,255,255,0.4)"
                }}>{v.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: 24, background: "#fafafa", borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Clear Space</div>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>
                Maintain a minimum clear space equal to the height of the logo mark on all sides. This ensures the logo is always legible and visually balanced.
              </p>
            </div>
            <div style={{ padding: 24, background: "#fafafa", borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Minimum Size</div>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>
                Digital: minimum 48px wide. Print: minimum 12mm wide. Below these sizes, use the icon-only version of the logo for legibility.
              </p>
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 8: LOGO DON'TS ═══════════════ */}
        <Page number={8} id="logo-donts">
          <SectionTitle number="06" title="Logo Variations & Misuse" subtitle="What to do and what never to do" />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
            ✗ Incorrect Usage
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
            {[
              { label: "Don't stretch", transform: "scaleX(1.4)" },
              { label: "Don't rotate", transform: "rotate(20deg)" },
              { label: "Don't add shadows", filter: "drop-shadow(3px 3px 0 rgba(255,0,0,0.4))" },
              { label: "Don't skew", transform: "skewX(12deg)" },
              { label: "Don't recolor", style: { filter: "hue-rotate(90deg)" } },
              { label: "Don't outline", style: { filter: "contrast(3) brightness(1.5)", opacity: 0.5 } },
              { label: "Don't crop", style: { overflow: "hidden", width: 40 } },
              { label: "Don't low-contrast", style: { opacity: 0.15 } }
            ].map(r => (
              <div key={r.label} style={{
                background: "#fff", borderRadius: 12, padding: 20,
                border: "2px solid #fee2e2", textAlign: "center"
              }}>
                <div style={{
                  width: 48, height: 48, margin: "0 auto 10px",
                  transform: r.transform, filter: r.filter, ...r.style
                }}>
                  <div dangerouslySetInnerHTML={{ __html: logoSvg }} style={{ width: "100%", height: "100%" }} />
                </div>
                <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>✗ {r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
            ✓ Correct Usage
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { bg: "#fff", label: "On white", border: true },
              { bg: c.primary, label: "On primary" },
              { bg: c.background, label: "On background", border: true },
              { bg: "#1a1a1a", label: "On dark" }
            ].map(v => (
              <div key={v.label} style={{
                background: v.bg, borderRadius: 12, padding: 20,
                border: v.border ? "2px solid #dcfce7" : "2px solid #dcfce7",
                textAlign: "center"
              }}>
                <div style={{ width: 48, height: 48, margin: "0 auto 10px" }}>
                  <div dangerouslySetInnerHTML={{ __html: logoSvg }} style={{ width: "100%", height: "100%" }} />
                </div>
                <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 600 }}>✓ {v.label}</div>
              </div>
            ))}
          </div>
        </Page>

        {/* ═══════════════ PAGE 9: COLOR PALETTE ═══════════════ */}
        <Page number={9} id="colors">
          <SectionTitle number="07" title="Color Palette" subtitle="The brand's color foundation" />
          <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            <ColorSwatch hex={c.primary} label="Primary" showValues large />
            <ColorSwatch hex={c.secondary} label="Secondary" showValues />
            <ColorSwatch hex={c.accent} label="Accent" showValues />
            <ColorSwatch hex={c.neutral} label="Neutral" showValues />
            <ColorSwatch hex={c.background} label="Background" showValues />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: 24, background: "#fafafa", borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Primary Gradients</div>
              <div style={{ height: 60, borderRadius: 10, background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, marginBottom: 8 }} />
              <div style={{ height: 60, borderRadius: 10, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
            </div>
            <div style={{ padding: 24, background: "#fafafa", borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Color Distribution</div>
              <div style={{ display: "flex", height: 60, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: "50%", background: c.primary }} />
                <div style={{ width: "20%", background: c.secondary }} />
                <div style={{ width: "10%", background: c.accent }} />
                <div style={{ width: "20%", background: c.background }} />
              </div>
              <div style={{ fontSize: 11, color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>
                50% Primary · 20% Secondary · 10% Accent · 20% Background
              </div>
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 10: COLOR SYSTEM ═══════════════ */}
        <Page number={10} id="color-system">
          <SectionTitle number="08" title="Color System" subtitle="Tints, shades, and extended palette" />
          {["primary", "secondary", "accent"].map(key => (
            <div key={key} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                {key.charAt(0).toUpperCase() + key.slice(1)} — {c[key]}
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {shades[key].reverse().map((s, i) => (
                  <div key={`s${i}`} style={{ flex: 1, height: 48, background: s, borderRadius: i === 0 ? "8px 0 0 8px" : 0 }} />
                ))}
                <div style={{ flex: 1.5, height: 48, background: c[key], position: "relative" }}>
                  <div style={{
                    position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)",
                    fontSize: 9, color: "#999", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap"
                  }}>Base</div>
                </div>
                {tints[key].map((t, i) => (
                  <div key={`t${i}`} style={{ flex: 1, height: 48, background: t, borderRadius: i === tints[key].length - 1 ? "0 8px 8px 0" : 0 }} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 40, padding: 24, background: "#fafafa", borderRadius: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
              Semantic Colors
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "Success", hex: "#16a34a" },
                { label: "Warning", hex: "#eab308" },
                { label: "Error", hex: "#dc2626" },
                { label: "Info", hex: "#2563eb" }
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 40, background: s.hex, borderRadius: 8, marginBottom: 6 }} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "#bbb", fontFamily: "'JetBrains Mono', monospace" }}>{s.hex}</div>
                </div>
              ))}
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 11: COLOR ACCESSIBILITY ═══════════════ */}
        <Page number={11} id="accessibility">
          <SectionTitle number="09" title="Color Accessibility" subtitle="WCAG contrast ratios and accessible pairings" />
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
              <div style={{ padding: 8, fontSize: 10, fontWeight: 700, color: "#999" }}></div>
              {Object.entries(c).map(([k, v]) => (
                <div key={k} style={{ padding: 8, textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: v, margin: "0 auto 4px", border: "1px solid #eee" }} />
                  <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>{k}</div>
                </div>
              ))}
              {Object.entries(c).map(([rowKey, rowVal]) => (
                [
                  <div key={`label-${rowKey}`} style={{ padding: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: rowVal, border: "1px solid #eee" }} />
                    <span style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>{rowKey}</span>
                  </div>,
                  ...Object.entries(c).map(([colKey, colVal]) => {
                    const ratio = contrastRatio(rowVal, colVal);
                    const pass = ratio >= 4.5;
                    const passAA = ratio >= 3;
                    return (
                      <div key={`${rowKey}-${colKey}`} style={{
                        padding: 8, textAlign: "center", borderRadius: 6,
                        background: rowKey === colKey ? "#f5f5f5" : pass ? "#f0fdf4" : passAA ? "#fffbeb" : "#fef2f2",
                        border: `1px solid ${rowKey === colKey ? "#eee" : pass ? "#bbf7d0" : passAA ? "#fde68a" : "#fecaca"}`
                      }}>
                        {rowKey !== colKey ? (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 700, color: pass ? "#16a34a" : passAA ? "#ca8a04" : "#dc2626" }}>
                              {ratio}
                            </div>
                            <div style={{ fontSize: 8, color: "#999", marginTop: 2 }}>
                              {pass ? "AAA" : passAA ? "AA" : "Fail"}
                            </div>
                          </>
                        ) : <div style={{ fontSize: 10, color: "#ccc" }}>—</div>}
                      </div>
                    );
                  })
                ]
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: c.primary, color: "#fff", padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontFamily: hf, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Aa</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>White on Primary</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{contrastRatio(c.primary, "#FFFFFF")}:1</div>
            </div>
            <div style={{ background: c.background, color: c.primary, padding: 20, borderRadius: 12, textAlign: "center", border: "1px solid #eee" }}>
              <div style={{ fontFamily: hf, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Aa</div>
              <div style={{ fontSize: 11, color: c.neutral }}>Primary on Background</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{contrastRatio(c.primary, c.background)}:1</div>
            </div>
            <div style={{ background: c.primary, color: c.accent, padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontFamily: hf, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Aa</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>Accent on Primary</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{contrastRatio(c.primary, c.accent)}:1</div>
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 12: TYPOGRAPHY ═══════════════ */}
        <Page number={12} id="typography">
          <SectionTitle number="10" title="Typography" subtitle="Font pairing and hierarchy" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div style={{ padding: 28, background: c.background, borderRadius: 14 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: c.neutral, marginBottom: 16 }}>Heading Font</div>
              <div style={{ fontFamily: hf, fontSize: 40, fontWeight: 700, color: c.primary, lineHeight: 1.1, marginBottom: 12 }}>
                {brand.headingFont}
              </div>
              <div style={{ fontFamily: hf, fontSize: 14, color: "#666", lineHeight: 2 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&*
              </div>
            </div>
            <div style={{ padding: 28, background: c.background, borderRadius: 14 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: c.neutral, marginBottom: 16 }}>Body Font</div>
              <div style={{ fontFamily: bf, fontSize: 40, fontWeight: 400, color: c.primary, lineHeight: 1.1, marginBottom: 12 }}>
                {brand.bodyFont}
              </div>
              <div style={{ fontFamily: bf, fontSize: 14, color: "#666", lineHeight: 2 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&*
              </div>
            </div>
          </div>
          {/* Type Scale */}
          <div style={{ padding: 28, background: "#fafafa", borderRadius: 14 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 20 }}>Type Scale</div>
            {[
              { tag: "H1", size: 48, weight: 800, font: hf },
              { tag: "H2", size: 36, weight: 700, font: hf },
              { tag: "H3", size: 28, weight: 600, font: hf },
              { tag: "H4", size: 22, weight: 600, font: hf },
              { tag: "H5", size: 18, weight: 600, font: bf },
              { tag: "Body", size: 16, weight: 400, font: bf },
              { tag: "Small", size: 14, weight: 400, font: bf },
              { tag: "Caption", size: 12, weight: 500, font: bf },
            ].map(t => (
              <div key={t.tag} style={{
                display: "flex", alignItems: "baseline", gap: 16,
                padding: "10px 0", borderBottom: "1px solid #eee"
              }}>
                <span style={{
                  fontSize: 10, color: c.accent, fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, minWidth: 50
                }}>{t.tag}</span>
                <span style={{
                  fontFamily: t.font, fontSize: t.size, fontWeight: t.weight,
                  color: c.primary, lineHeight: 1.2
                }}>
                  {brand.name}
                </span>
                <span style={{
                  fontSize: 10, color: "#bbb", fontFamily: "'JetBrains Mono', monospace",
                  marginLeft: "auto"
                }}>{t.size}px / {t.weight}</span>
              </div>
            ))}
          </div>
        </Page>

        {/* ═══════════════ PAGE 13: TYPOGRAPHY IN ACTION ═══════════════ */}
        <Page number={13} id="type-action">
          <SectionTitle number="11" title="Typography in Action" subtitle="Real-world type hierarchy examples" />
          <div style={{
            padding: 40, background: "#fff", borderRadius: 14,
            border: "1px solid #eee", marginBottom: 24
          }}>
            <div style={{ fontFamily: hf, fontSize: 36, fontWeight: 700, color: c.primary, marginBottom: 8, lineHeight: 1.2 }}>
              Spaces That Inspire Human Connection
            </div>
            <div style={{ fontFamily: bf, fontSize: 16, color: "#888", marginBottom: 20 }}>
              Published on January 15, 2025 · 8 min read
            </div>
            <p style={{ fontFamily: bf, fontSize: 16, color: "#444", lineHeight: 1.9, marginBottom: 16 }}>
              Great architecture doesn't just shelter us — it shapes how we think, feel, and connect with one another. At {brand.name}, we've spent years studying the intersection of design and human behavior.
            </p>
            <div style={{ fontFamily: hf, fontSize: 24, fontWeight: 600, color: c.primary, marginBottom: 12 }}>
              The Power of Intentional Space
            </div>
            <p style={{ fontFamily: bf, fontSize: 16, color: "#444", lineHeight: 1.9 }}>
              Every project begins with a simple question: how should this space make people feel? From there, we work backward — selecting materials, defining proportions, and crafting light to serve that emotional intent.
            </p>
          </div>
          <div style={{
            padding: 32, background: c.primary, borderRadius: 14, color: "#fff"
          }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: c.accent, marginBottom: 16 }}>
              Hero Section Example
            </div>
            <div style={{ fontFamily: hf, fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
              Design is not just<br />what it looks like.
            </div>
            <p style={{ fontSize: 17, opacity: 0.6, lineHeight: 1.7, maxWidth: 450 }}>
              It's how it makes you feel. We create spaces that move people — literally and emotionally.
            </p>
            <div style={{
              display: "inline-block", marginTop: 20,
              padding: "12px 28px", background: c.accent,
              color: c.primary, borderRadius: 8,
              fontSize: 14, fontWeight: 600
            }}>
              View Our Work →
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 14: BUSINESS COLLATERAL ═══════════════ */}
        <Page number={14} id="collateral">
          <SectionTitle number="12" title="Business Collateral" subtitle="Stationery and print applications" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Business Card Front */}
            <div style={{
              background: c.primary, borderRadius: 12, padding: 28,
              color: "#fff", aspectRatio: "1.6/1", display: "flex",
              flexDirection: "column", justifyContent: "space-between",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
            }}>
              <div>
                <div style={{ width: 36, height: 36, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
                <div style={{ fontFamily: hf, fontSize: 18, fontWeight: 700 }}>{brand.name}</div>
              </div>
              <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: 1 }}>
                www.{brand.name.toLowerCase().replace(/\s+/g, "")}.com
              </div>
            </div>
            {/* Business Card Back */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: 28,
              border: "1px solid #eee", aspectRatio: "1.6/1", display: "flex",
              flexDirection: "column", justifyContent: "space-between",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
            }}>
              <div>
                <div style={{ fontFamily: hf, fontSize: 15, fontWeight: 700, color: c.primary }}>Jane Designer</div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>Creative Director</div>
              </div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8 }}>
                <div>jane@{brand.name.toLowerCase().replace(/\s+/g, "")}.com</div>
                <div>+1 (555) 000-0000</div>
                <div style={{ color: c.accent }}>@{brand.name.toLowerCase().replace(/\s+/g, "")}</div>
              </div>
            </div>
          </div>
          {/* Letterhead */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: 40,
            border: "1px solid #eee", minHeight: 300,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
                <span style={{ fontFamily: hf, fontWeight: 700, fontSize: 15, color: c.primary }}>{brand.name}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: 10, color: "#bbb", lineHeight: 1.8 }}>
                123 Design Street · Creative City, ST 00000<br />
                info@{brand.name.toLowerCase().replace(/\s+/g, "")}.com · (555) 000-0000
              </div>
            </div>
            {[90, 100, 85, 95, 60].map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: 7, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
            ))}
            <div style={{ borderTop: `2px solid ${c.primary}`, marginTop: 60, paddingTop: 10, fontSize: 9, color: "#ccc", textAlign: "center" }}>
              {brand.tagline}
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 15: DIGITAL APPLICATIONS ═══════════════ */}
        <Page number={15} id="digital">
          <SectionTitle number="13" title="Digital Applications" subtitle="Social media and web presence" />
          {/* Social Profile */}
          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", marginBottom: 24 }}>
            <div style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
              height: 100, position: "relative"
            }}>
              <div style={{
                position: "absolute", bottom: -28, left: 20,
                width: 56, height: 56, borderRadius: "50%",
                background: "#fff", border: "3px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div style={{ width: 28, height: 28 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
              </div>
            </div>
            <div style={{ padding: "36px 20px 20px", background: "#fff" }}>
              <div style={{ fontFamily: hf, fontWeight: 700, fontSize: 16, color: c.primary }}>{brand.name}</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>@{brand.name.toLowerCase().replace(/\s+/g, "")}</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 8, lineHeight: 1.5 }}>
                {brand.socialBios.instagram}
              </div>
            </div>
          </div>
          {/* Social Bios */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[
              { platform: "Instagram", bio: brand.socialBios.instagram },
              { platform: "LinkedIn", bio: brand.socialBios.linkedin },
              { platform: "Twitter / X", bio: brand.socialBios.twitter }
            ].map(s => (
              <div key={s.platform} style={{
                padding: 20, background: "#fafafa", borderRadius: 12
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                  {s.platform}
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7 }}>{s.bio}</div>
              </div>
            ))}
          </div>
          {/* Email Signature */}
          <div style={{ marginTop: 24, padding: 24, background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Email Signature</div>
            <div style={{ borderLeft: `3px solid ${c.accent}`, paddingLeft: 16 }}>
              <div style={{ fontFamily: hf, fontWeight: 700, fontSize: 15, color: c.primary }}>Jane Designer</div>
              <div style={{ fontSize: 12, color: "#888" }}>Creative Director · {brand.name}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 6, lineHeight: 1.6 }}>
                jane@{brand.name.toLowerCase().replace(/\s+/g, "")}.com · +1 (555) 000-0000<br />
                www.{brand.name.toLowerCase().replace(/\s+/g, "")}.com
              </div>
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 16: BRAND PATTERNS ═══════════════ */}
        <Page number={16} id="patterns">
          <SectionTitle number="14" title="Brand Patterns & Textures" subtitle="Supporting visual elements" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* Geometric Pattern */}
            <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ background: c.primary }}>
                {Array.from({ length: 10 }, (_, i) =>
                  Array.from({ length: 10 }, (_, j) => (
                    <rect key={`${i}-${j}`} x={i * 20 + 2} y={j * 20 + 2} width="16" height="16" rx="2"
                      fill={(i + j) % 3 === 0 ? c.accent : "transparent"} opacity="0.15" />
                  ))
                )}
              </svg>
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Grid</div>
            </div>
            {/* Diagonal Lines */}
            <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ background: c.background }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <line key={i} x1={i * 20 - 100} y1="0" x2={i * 20 + 100} y2="200"
                    stroke={c.primary} strokeWidth="1" opacity="0.08" />
                ))}
              </svg>
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: c.neutral, fontWeight: 600 }}>Diagonal</div>
            </div>
            {/* Dots Pattern */}
            <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ background: c.secondary }}>
                {Array.from({ length: 10 }, (_, i) =>
                  Array.from({ length: 10 }, (_, j) => (
                    <circle key={`${i}-${j}`} cx={i * 20 + 10} cy={j * 20 + 10} r="2.5"
                      fill={c.accent} opacity="0.25" />
                  ))
                )}
              </svg>
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Dots</div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 20, background: "#fafafa", borderRadius: 14, fontSize: 13, color: "#666", lineHeight: 1.7 }}>
            Brand patterns can be used as subtle backgrounds on print materials, social media graphics, presentation slides, and packaging. Always maintain low opacity (10-25%) to ensure the pattern supports rather than competes with primary content.
          </div>
          {/* Pattern in use */}
          <div style={{
            marginTop: 20, borderRadius: 14, overflow: "hidden", position: "relative",
            background: c.primary, padding: "48px 36px", color: "#fff"
          }}>
            <svg width="100%" height="100%" viewBox="0 0 800 300" style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 40 }, (_, i) =>
                Array.from({ length: 15 }, (_, j) => (
                  <rect key={`${i}-${j}`} x={i * 20 + 2} y={j * 20 + 2} width="16" height="16" rx="2"
                    fill={c.accent} opacity="0.04" />
                ))
              )}
            </svg>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: hf, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Pattern in Context</div>
              <p style={{ fontSize: 15, opacity: 0.6, maxWidth: 500, lineHeight: 1.7 }}>
                Patterns add depth and brand recognition when used as subtle background textures behind content sections.
              </p>
            </div>
          </div>
        </Page>

        {/* ═══════════════ PAGE 17: QUICK REFERENCE ═══════════════ */}
        <Page number={17} bg={c.background} id="quickref">
          <SectionTitle number="15" title="Quick Reference" subtitle="Everything at a glance" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Logo */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Logo</div>
              <div style={{ width: 64, height: 64, margin: "0 0 12px" }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
              <div style={{ fontSize: 12, color: "#666" }}>Min size: 48px digital / 12mm print</div>
            </div>
            {/* Colors */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Colors</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {Object.values(c).map((col, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: col, border: "1px solid #eee" }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#999", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
                {Object.entries(c).map(([k, v]) => `${k}: ${v}`).join(" · ")}
              </div>
            </div>
            {/* Typography */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Typography</div>
              <div style={{ fontFamily: hf, fontSize: 20, fontWeight: 700, color: c.primary, marginBottom: 4 }}>{brand.headingFont}</div>
              <div style={{ fontFamily: bf, fontSize: 16, color: "#666" }}>{brand.bodyFont}</div>
            </div>
            {/* Voice */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Voice</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {brand.traits.map(t => (
                  <span key={t} style={{
                    padding: "4px 12px", borderRadius: 20,
                    background: c.background, fontSize: 11,
                    fontWeight: 600, color: c.primary
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Do / Don't */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div style={{ background: "#f0fdf4", borderRadius: 14, padding: 24, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>✓ Do</div>
              {["Use approved color combinations", "Maintain logo clear space", "Follow the type hierarchy", "Stay on voice"].map(d => (
                <div key={d} style={{ fontSize: 13, color: "#333", padding: "6px 0" }}>✓ {d}</div>
              ))}
            </div>
            <div style={{ background: "#fef2f2", borderRadius: 14, padding: 24, border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>✗ Don't</div>
              {["Stretch or distort the logo", "Use unapproved colors", "Mix in off-brand fonts", "Use overly casual language"].map(d => (
                <div key={d} style={{ fontSize: 13, color: "#333", padding: "6px 0" }}>✗ {d}</div>
              ))}
            </div>
          </div>

          {/* Final Footer */}
          <div style={{
            marginTop: 48, padding: 32, background: c.primary,
            borderRadius: 14, textAlign: "center", color: "#fff"
          }}>
            <div style={{ width: 48, height: 48, margin: "0 auto 12px" }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
            <div style={{ fontFamily: hf, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{brand.name}</div>
            <div style={{ fontSize: 13, opacity: 0.4 }}>
              Brand Identity Guidelines · {new Date().getFullYear()} · Generated with BrandForge
            </div>
          </div>
        </Page>
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
