import { useState, useRef, useCallback, useEffect } from "react";

const GOOGLE_FONTS = [
  { name: "Playfair Display", category: "Serif", style: "Elegant & Editorial" },
  { name: "Montserrat", category: "Sans-Serif", style: "Modern & Clean" },
  { name: "Lora", category: "Serif", style: "Classic & Warm" },
  { name: "Raleway", category: "Sans-Serif", style: "Thin & Sophisticated" },
  { name: "Merriweather", category: "Serif", style: "Readable & Traditional" },
  { name: "Oswald", category: "Sans-Serif", style: "Bold & Condensed" },
  { name: "Poppins", category: "Sans-Serif", style: "Geometric & Friendly" },
  { name: "Cormorant Garamond", category: "Serif", style: "Luxurious & Refined" },
  { name: "Work Sans", category: "Sans-Serif", style: "Neutral & Professional" },
  { name: "DM Serif Display", category: "Serif", style: "Strong & Distinctive" },
  { name: "Space Grotesk", category: "Sans-Serif", style: "Tech & Contemporary" },
  { name: "Bitter", category: "Serif", style: "Sturdy & Readable" },
  { name: "Archivo", category: "Sans-Serif", style: "Grotesque & Versatile" },
  { name: "Libre Baskerville", category: "Serif", style: "Classic & Literary" },
  { name: "Syne", category: "Sans-Serif", style: "Experimental & Bold" },
];

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

const INDUSTRIES = [
  "Technology", "Fashion & Apparel", "Food & Beverage", "Health & Wellness",
  "Finance & Banking", "Education", "Real Estate", "Entertainment & Media",
  "Travel & Hospitality", "Beauty & Cosmetics", "Sports & Fitness",
  "Non-Profit", "Automotive", "Architecture & Design", "Legal Services", "Other"
];

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: i <= current ? "#1a1a1a" : "#e5e5e5",
            color: i <= current ? "#fff" : "#999",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 600,
            transition: "all 0.3s ease",
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{
              width: 40, height: 2,
              background: i < current ? "#1a1a1a" : "#e5e5e5",
              transition: "all 0.3s ease"
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function LogoUpload({ logo, setLogo }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => fileRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "#1a1a1a" : logo ? "#ccc" : "#bbb"}`,
        borderRadius: 16, padding: logo ? 20 : 60,
        textAlign: "center", cursor: "pointer",
        background: dragging ? "#f5f5f5" : "#fafafa",
        transition: "all 0.2s ease",
        minHeight: 200, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12
      }}
    >
      <input ref={fileRef} type="file" accept="image/*" hidden
        onChange={(e) => handleFile(e.target.files[0])} />
      {logo ? (
        <>
          <img src={logo} alt="Logo" style={{ maxHeight: 120, maxWidth: "80%", objectFit: "contain" }} />
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Click or drag to replace</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, lineHeight: 1 }}>⬆</div>
          <p style={{ color: "#555", margin: 0, fontSize: 16, fontWeight: 500 }}>
            Drop your logo here or click to upload
          </p>
          <p style={{ color: "#999", margin: 0, fontSize: 13 }}>SVG, PNG, or JPG — transparent background recommended</p>
        </>
      )}
    </div>
  );
}

function FontSelector({ selected, onSelect, label }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </label>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "12px 16px", border: "1px solid #ddd", borderRadius: 10,
          cursor: "pointer", background: "#fff", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}
      >
        <span style={{ fontFamily: selected ? `'${selected}', serif` : "inherit", fontWeight: 500 }}>
          {selected || "Select a font…"}
        </span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
      </div>
      {open && (
        <div style={{
          border: "1px solid #ddd", borderRadius: 10, marginTop: 4,
          maxHeight: 240, overflowY: "auto", background: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 10, position: "relative"
        }}>
          {GOOGLE_FONTS.map((f) => (
            <div
              key={f.name}
              onClick={() => { onSelect(f.name); setOpen(false); }}
              style={{
                padding: "10px 16px", cursor: "pointer",
                background: selected === f.name ? "#f0f0f0" : "transparent",
                borderBottom: "1px solid #f5f5f5",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8f8f8"}
              onMouseLeave={(e) => e.currentTarget.style.background = selected === f.name ? "#f0f0f0" : "transparent"}
            >
              <span style={{ fontWeight: 500 }}>{f.name}</span>
              <span style={{ fontSize: 12, color: "#999" }}>{f.style}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPaletteSelector({ selected, onSelect, customColors, setCustomColors }) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 12, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
        Color Palette
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {PALETTES.map((p, i) => (
          <div
            key={p.name}
            onClick={() => { onSelect(i); setShowCustom(false); }}
            style={{
              padding: 12, borderRadius: 10, cursor: "pointer",
              border: `2px solid ${selected === i && !showCustom ? "#1a1a1a" : "#eee"}`,
              background: "#fff", transition: "all 0.2s"
            }}
          >
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
              {p.colors.map((c) => (
                <div key={c} style={{ flex: 1, height: 24, borderRadius: 4, background: c }} />
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#444" }}>{p.name}</p>
          </div>
        ))}
      </div>
      <div
        onClick={() => setShowCustom(!showCustom)}
        style={{
          padding: "10px 16px", borderRadius: 10, cursor: "pointer",
          border: `2px solid ${showCustom ? "#1a1a1a" : "#eee"}`,
          background: "#fff", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#555"
        }}
      >
        ✏️ Custom Colors
      </div>
      {showCustom && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          {customColors.map((c, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <input
                type="color" value={c}
                onChange={(e) => {
                  const nc = [...customColors];
                  nc[i] = e.target.value;
                  setCustomColors(nc);
                }}
                style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer", padding: 0 }}
              />
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{c}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Brand Identity Preview / Output
function BrandPreview({ data }) {
  const { logo, brandName, tagline, industry, mission, vision, about, headingFont, bodyFont, palette, customColors, paletteIndex } = data;
  const colors = paletteIndex !== null ? PALETTES[paletteIndex].colors : customColors;
  const primary = colors[0];
  const secondary = colors[1];
  const accent = colors[2];
  const light = colors[4] || colors[3];
  const mid = colors[3] || colors[2];

  const section = {
    padding: "48px 40px", borderBottom: `1px solid ${colors[4]}22`
  };

  return (
    <div style={{ background: "#fff", fontFamily: `'${bodyFont}', sans-serif` }}>
      {/* Cover Page */}
      <div style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        padding: "80px 60px", textAlign: "center", color: "#fff",
        minHeight: 400, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100, width: 400, height: 400,
          borderRadius: "50%", background: `${accent}22`
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 250, height: 250,
          borderRadius: "50%", background: `${light}15`
        }} />
        {logo && <img src={logo} alt="Logo" style={{ maxHeight: 100, maxWidth: 200, objectFit: "contain", position: "relative", zIndex: 1 }} />}
        <h1 style={{
          fontFamily: `'${headingFont}', serif`, fontSize: 48, fontWeight: 700,
          margin: 0, position: "relative", zIndex: 1, letterSpacing: -1
        }}>
          {brandName || "Brand Name"}
        </h1>
        {tagline && <p style={{ fontSize: 18, opacity: 0.85, margin: 0, position: "relative", zIndex: 1, fontStyle: "italic" }}>{tagline}</p>}
        <div style={{
          marginTop: 16, padding: "8px 24px", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 30, fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
          position: "relative", zIndex: 1
        }}>
          Brand Identity Guidelines
        </div>
      </div>

      {/* Logo Usage */}
      <div style={section}>
        <h2 style={{ fontFamily: `'${headingFont}', serif`, fontSize: 28, margin: "0 0 8px", color: primary }}>
          01 — Logo
        </h2>
        <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>Primary logo mark and usage guidelines</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { bg: "#ffffff", label: "Light Background", border: true },
            { bg: primary, label: "On Brand Color", border: false },
            { bg: "#1a1a1a", label: "Dark Background", border: false }
          ].map((v) => (
            <div key={v.label} style={{
              background: v.bg, borderRadius: 12, padding: 32,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: 140, border: v.border ? "1px solid #eee" : "none"
            }}>
              {logo && <img src={logo} alt="" style={{ maxHeight: 60, maxWidth: "80%", objectFit: "contain" }} />}
              <span style={{ fontSize: 11, color: v.bg === "#ffffff" ? "#999" : "rgba(255,255,255,0.6)", marginTop: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {v.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: 20, background: "#fafafa", borderRadius: 10, fontSize: 13, color: "#666", lineHeight: 1.7 }}>
          <strong>Clear Space:</strong> Maintain a minimum clear space equal to the height of the logomark around all sides. Never distort, rotate, or apply effects to the logo.
        </div>
      </div>

      {/* Color Palette */}
      <div style={section}>
        <h2 style={{ fontFamily: `'${headingFont}', serif`, fontSize: 28, margin: "0 0 8px", color: primary }}>
          02 — Color Palette
        </h2>
        <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>Brand color system and usage</p>
        <div style={{ display: "flex", gap: 12 }}>
          {colors.map((c, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                background: c, height: 100, borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 8
              }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{c.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                {["Primary", "Secondary", "Accent", "Neutral", "Background"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div style={section}>
        <h2 style={{ fontFamily: `'${headingFont}', serif`, fontSize: 28, margin: "0 0 8px", color: primary }}>
          03 — Typography
        </h2>
        <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>Font pairing and hierarchy</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ padding: 24, background: "#fafafa", borderRadius: 12 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 12 }}>Heading Font</div>
            <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 36, fontWeight: 700, color: primary, lineHeight: 1.2 }}>
              {headingFont}
            </div>
            <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 14, color: "#666", marginTop: 12, lineHeight: 1.6 }}>
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
            </div>
            <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 14, color: "#666", marginTop: 4 }}>
              0 1 2 3 4 5 6 7 8 9
            </div>
          </div>
          <div style={{ padding: 24, background: "#fafafa", borderRadius: 12 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 12 }}>Body Font</div>
            <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 36, fontWeight: 400, color: primary, lineHeight: 1.2 }}>
              {bodyFont}
            </div>
            <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 14, color: "#666", marginTop: 12, lineHeight: 1.6 }}>
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
            </div>
            <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 14, color: "#666", marginTop: 4 }}>
              0 1 2 3 4 5 6 7 8 9
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20, padding: 24, background: primary, borderRadius: 12, color: "#fff" }}>
          <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Heading Example
          </div>
          <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>
            This is how your body copy will look paired with the heading font. Good typography creates hierarchy, guides the reader, and reinforces your brand personality across every touchpoint.
          </div>
        </div>
      </div>

      {/* Brand Story */}
      <div style={section}>
        <h2 style={{ fontFamily: `'${headingFont}', serif`, fontSize: 28, margin: "0 0 8px", color: primary }}>
          04 — Brand Story
        </h2>
        <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>Mission, vision, and purpose</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {mission && (
            <div style={{ padding: 24, background: `${primary}08`, borderLeft: `4px solid ${primary}`, borderRadius: "0 12px 12px 0" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: primary, marginBottom: 8, fontWeight: 700 }}>Mission</div>
              <p style={{ margin: 0, color: "#444", lineHeight: 1.7, fontSize: 14 }}>{mission}</p>
            </div>
          )}
          {vision && (
            <div style={{ padding: 24, background: `${secondary}08`, borderLeft: `4px solid ${secondary}`, borderRadius: "0 12px 12px 0" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: secondary, marginBottom: 8, fontWeight: 700 }}>Vision</div>
              <p style={{ margin: 0, color: "#444", lineHeight: 1.7, fontSize: 14 }}>{vision}</p>
            </div>
          )}
        </div>
        {about && (
          <div style={{ padding: 24, background: "#fafafa", borderRadius: 12 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 8, fontWeight: 700 }}>About</div>
            <p style={{ margin: 0, color: "#444", lineHeight: 1.8, fontSize: 14 }}>{about}</p>
          </div>
        )}
      </div>

      {/* Business Card Mockup */}
      <div style={section}>
        <h2 style={{ fontFamily: `'${headingFont}', serif`, fontSize: 28, margin: "0 0 8px", color: primary }}>
          05 — Applications
        </h2>
        <p style={{ color: "#777", marginBottom: 24, fontSize: 14 }}>Brand identity in context</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Business Card Front */}
          <div style={{
            background: primary, borderRadius: 12, padding: 32,
            color: "#fff", aspectRatio: "1.6/1", display: "flex",
            flexDirection: "column", justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            <div>
              {logo && <img src={logo} alt="" style={{ height: 28, objectFit: "contain", marginBottom: 12, filter: "brightness(10)" }} />}
              <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 18, fontWeight: 700 }}>
                {brandName || "Brand Name"}
              </div>
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1 }}>
              www.{(brandName || "brand").toLowerCase().replace(/\s+/g, "")}.com
            </div>
          </div>
          {/* Business Card Back */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: 32,
            border: "1px solid #eee", aspectRatio: "1.6/1", display: "flex",
            flexDirection: "column", justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)"
          }}>
            <div>
              <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 15, fontWeight: 700, color: primary }}>
                Jane Designer
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>Creative Director</div>
            </div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8 }}>
              <div>jane@{(brandName || "brand").toLowerCase().replace(/\s+/g, "")}.com</div>
              <div>+1 (555) 000-0000</div>
              <div style={{ color: accent }}>@{(brandName || "brand").toLowerCase().replace(/\s+/g, "")}</div>
            </div>
          </div>
        </div>

        {/* Letterhead Mockup */}
        <div style={{
          marginTop: 24, background: "#fff", border: "1px solid #eee",
          borderRadius: 12, padding: 40, boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          minHeight: 300
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {logo && <img src={logo} alt="" style={{ height: 32, objectFit: "contain" }} />}
              <span style={{ fontFamily: `'${headingFont}', serif`, fontWeight: 700, color: primary, fontSize: 18 }}>
                {brandName || "Brand Name"}
              </span>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#999", lineHeight: 1.6 }}>
              <div>123 Design Street</div>
              <div>Creative City, ST 00000</div>
              <div>info@{(brandName || "brand").toLowerCase().replace(/\s+/g, "")}.com</div>
            </div>
          </div>
          <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 13, color: "#888", lineHeight: 2 }}>
            <div style={{ width: "90%", height: 8, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ width: "100%", height: 8, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ width: "85%", height: 8, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ width: "95%", height: 8, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ width: "60%", height: 8, background: "#f0f0f0", borderRadius: 4 }} />
          </div>
          <div style={{ borderTop: `2px solid ${primary}`, marginTop: 40, paddingTop: 12, fontSize: 10, color: "#bbb", textAlign: "center" }}>
            {tagline || `${brandName || "Brand"} — Where great things happen`}
          </div>
        </div>

        {/* Social Media Header */}
        <div style={{
          marginTop: 24, borderRadius: 12, overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            background: `linear-gradient(120deg, ${primary}, ${accent})`,
            height: 120, position: "relative"
          }}>
            <div style={{
              position: "absolute", bottom: -30, left: 24,
              width: 64, height: 64, borderRadius: "50%",
              background: "#fff", border: "3px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              {logo && <img src={logo} alt="" style={{ height: 32, objectFit: "contain" }} />}
            </div>
          </div>
          <div style={{ padding: "40px 24px 20px", background: "#fff" }}>
            <div style={{ fontFamily: `'${headingFont}', serif`, fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>
              {brandName || "Brand Name"}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
              @{(brandName || "brand").toLowerCase().replace(/\s+/g, "")} · {industry || "Creative"}
            </div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 8, lineHeight: 1.5 }}>
              {tagline || "Making the world a better place through design."}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "40px 60px", background: primary, color: "rgba(255,255,255,0.5)",
        textAlign: "center", fontSize: 12
      }}>
        <div style={{ fontFamily: `'${headingFont}', serif`, color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {brandName || "Brand Name"}
        </div>
        Brand Identity Guidelines · Confidential · Generated with BrandForge
      </div>
    </div>
  );
}

export default function BrandIdentityGenerator() {
  const [step, setStep] = useState(0);
  const [logo, setLogo] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [about, setAbout] = useState("");
  const [headingFont, setHeadingFont] = useState("Playfair Display");
  const [bodyFont, setBodyFont] = useState("Poppins");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customColors, setCustomColors] = useState(["#1a1a1a", "#444444", "#888888", "#cccccc", "#f5f5f5"]);
  const [useCustom, setUseCustom] = useState(false);

  // Load Google Fonts
  useEffect(() => {
    const families = GOOGLE_FONTS.map(f => f.name.replace(/ /g, '+')).join('&family=');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${families}:wght@400;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // Also load DM Sans for UI
    const ui = document.createElement('link');
    ui.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
    ui.rel = 'stylesheet';
    document.head.appendChild(ui);
  }, []);

  const inputStyle = {
    width: "100%", padding: "12px 16px", border: "1px solid #ddd",
    borderRadius: 10, fontSize: 15, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const textareaStyle = {
    ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6,
    display: "block", textTransform: "uppercase", letterSpacing: 1
  };

  const btnPrimary = {
    padding: "14px 32px", background: "#1a1a1a", color: "#fff",
    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s", letterSpacing: 0.5
  };

  const btnSecondary = {
    ...btnPrimary, background: "transparent", color: "#1a1a1a",
    border: "1px solid #ddd"
  };

  const canNext = () => {
    if (step === 0) return !!logo;
    if (step === 1) return !!brandName;
    if (step === 2) return !!headingFont && !!bodyFont;
    return true;
  };

  const data = {
    logo, brandName, tagline, industry, mission, vision, about,
    headingFont, bodyFont, palette: useCustom ? customColors : PALETTES[paletteIndex]?.colors,
    customColors, paletteIndex: useCustom ? null : paletteIndex
  };

  if (step === 4) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{
          padding: "20px 40px", background: "#fff",
          borderBottom: "1px solid #eee", display: "flex",
          justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 100
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: "#1a1a1a", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14
            }}>B</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>BrandForge</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep(0)}
              style={{ ...btnSecondary, padding: "10px 20px", fontSize: 13 }}
            >
              ← Edit
            </button>
            <button
              onClick={() => window.print?.()}
              style={{ ...btnPrimary, padding: "10px 20px", fontSize: 13 }}
            >
              📄 Export / Print
            </button>
          </div>
        </div>
        <BrandPreview data={data} />
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f8f8f8, #fff)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 20px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, background: "#1a1a1a", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 18
        }}>B</div>
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: -0.5 }}>BrandForge</span>
      </div>
      <p style={{ color: "#999", fontSize: 14, marginBottom: 32, textAlign: "center" }}>
        Upload your logo → Answer a few questions → Get a complete brand identity
      </p>

      <div style={{
        width: "100%", maxWidth: 600, background: "#fff",
        borderRadius: 20, padding: "40px 36px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)"
      }}>
        <StepIndicator current={step} total={4} />

        {/* Step 0: Logo Upload */}
        {step === 0 && (
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
              Upload Your Logo
            </h2>
            <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
              Start with your logo — we'll build everything around it.
            </p>
            <LogoUpload logo={logo} setLogo={setLogo} />
          </div>
        )}

        {/* Step 1: Brand Info */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
              Tell Us About the Brand
            </h2>
            <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
              The essentials that define who this brand is.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Brand Name *</label>
                <input style={inputStyle} value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g. Lumina Studio" />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input style={inputStyle} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Designing the future, today" />
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none", background: `#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 16px center` }}
                  value={industry} onChange={e => setIndustry(e.target.value)}
                >
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mission Statement</label>
                <textarea style={textareaStyle} value={mission} onChange={e => setMission(e.target.value)}
                  placeholder="What does this brand exist to do?" />
              </div>
              <div>
                <label style={labelStyle}>Vision</label>
                <textarea style={textareaStyle} value={vision} onChange={e => setVision(e.target.value)}
                  placeholder="Where is this brand headed?" />
              </div>
              <div>
                <label style={labelStyle}>About the Brand</label>
                <textarea style={{ ...textareaStyle, minHeight: 100 }} value={about} onChange={e => setAbout(e.target.value)}
                  placeholder="A brief description of the brand, its values, and what makes it unique…" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Typography */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
              Choose Your Typography
            </h2>
            <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
              Select a heading and body font pairing.
            </p>
            <FontSelector selected={headingFont} onSelect={setHeadingFont} label="Heading Font" />
            <FontSelector selected={bodyFont} onSelect={setBodyFont} label="Body Font" />
            <div style={{ marginTop: 20, padding: 24, background: "#fafafa", borderRadius: 12 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 12 }}>Preview</div>
              <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                {brandName || "Brand Name"} Heading
              </div>
              <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                This is how your body text will look. The right font pairing creates visual hierarchy and reinforces your brand personality across every touchpoint.
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Colors */}
        {step === 3 && (
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
              Select Color Palette
            </h2>
            <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
              Choose a pre-built palette or create your own.
            </p>
            <ColorPaletteSelector
              selected={paletteIndex}
              onSelect={(i) => { setPaletteIndex(i); setUseCustom(false); }}
              customColors={customColors}
              setCustomColors={(c) => { setCustomColors(c); setUseCustom(true); }}
            />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          {step > 0 ? (
            <button style={btnSecondary} onClick={() => setStep(step - 1)}>← Back</button>
          ) : <div />}
          <button
            style={{
              ...btnPrimary,
              opacity: canNext() ? 1 : 0.4,
              pointerEvents: canNext() ? "auto" : "none"
            }}
            onClick={() => setStep(step + 1)}
          >
            {step === 3 ? "Generate Brand Identity →" : "Continue →"}
          </button>
        </div>
      </div>

      <p style={{ color: "#ccc", fontSize: 12, marginTop: 32 }}>
        BrandForge — Brand identity made simple
      </p>
    </div>
  );
}
