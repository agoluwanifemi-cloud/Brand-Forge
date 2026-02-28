
import { useState, useEffect, useRef, useMemo } from "react";

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
  address: "142 West 26th Street, New York, NY 10001",
  socialHandle: "@luminastudio",
  personName: "Jane Designer",
  personTitle: "Creative Director",
};

const PLACEHOLDER_LOGO = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="30" width="30" height="50" rx="4" fill="#1B2838"/><rect x="45" y="15" width="25" height="65" rx="4" fill="#3D5A73"/><polygon points="78,80 60,80 69,20" fill="#C9A96E"/></svg>`;

function getLum(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
}

// ─── Category Tabs ───
const CATEGORIES = [
  { id: "print", label: "Print", icon: "🖨" },
  { id: "digital", label: "Digital", icon: "💻" },
  { id: "social", label: "Social Media", icon: "📱" },
  { id: "merch", label: "Merchandise", icon: "👕" },
  { id: "environ", label: "Environmental", icon: "🏢" },
];

// ─── Mockup Components ───

function BusinessCardFront({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: c.primary, borderRadius: 10, padding: "28px 24px",
      color: "#fff", aspectRatio: "3.5/2", display: "flex",
      flexDirection: "column", justifyContent: "space-between",
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
      fontFamily: `'${brand.bodyFont}', sans-serif`,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${c.accent}12` }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ width: 36, height: 36, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: logo }} />
        <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 16, fontWeight: 700 }}>{brand.name}</div>
        <div style={{ fontSize: 9, opacity: 0.45, marginTop: 2, fontStyle: "italic" }}>{brand.tagline}</div>
      </div>
      <div style={{ position: "relative", zIndex: 1, fontSize: 8, opacity: 0.4, letterSpacing: 1 }}>
        {brand.website}
      </div>
    </div>
  );
}

function BusinessCardBack({ brand }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fff", borderRadius: 10, padding: "28px 24px",
      border: `1px solid #eee`, aspectRatio: "3.5/2", display: "flex",
      flexDirection: "column", justifyContent: "space-between",
      boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      fontFamily: `'${brand.bodyFont}', sans-serif`,
    }}>
      <div>
        <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 14, fontWeight: 700, color: c.primary }}>{brand.personName}</div>
        <div style={{ fontSize: 10, color: c.neutral, marginTop: 2 }}>{brand.personTitle}</div>
      </div>
      <div style={{ fontSize: 9, color: "#777", lineHeight: 2 }}>
        <div>{brand.email}</div>
        <div>{brand.phone}</div>
        <div style={{ color: c.accent }}>{brand.socialHandle}</div>
      </div>
    </div>
  );
}

function Letterhead({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fff", borderRadius: 10, padding: "32px 28px",
      border: "1px solid #eee", aspectRatio: "8.5/11",
      boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
      fontFamily: `'${brand.bodyFont}', sans-serif`,
      display: "flex", flexDirection: "column", justifyContent: "space-between"
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22 }} dangerouslySetInnerHTML={{ __html: logo }} />
            <span style={{ fontFamily: `'${brand.headingFont}', serif`, fontWeight: 700, fontSize: 13, color: c.primary }}>{brand.name}</span>
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: "#bbb", lineHeight: 1.8 }}>
            {brand.address}<br />{brand.email}<br />{brand.phone}
          </div>
        </div>
        <div style={{ fontSize: 9, color: "#ccc", marginBottom: 16 }}>February 28, 2026</div>
        <div style={{ fontSize: 9, color: "#aaa", lineHeight: 2 }}>
          {[90, 100, 82, 96, 100, 75, 92, 100, 68].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 5, background: "#f3f3f3", borderRadius: 3, marginBottom: 5 }} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ borderTop: `2px solid ${c.primary}`, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 7, color: "#ccc" }}>{brand.website}</span>
          <span style={{ fontSize: 7, color: "#ccc", fontStyle: "italic" }}>{brand.tagline}</span>
        </div>
      </div>
    </div>
  );
}

function Envelope({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: c.background, borderRadius: 10,
      padding: "24px 28px", aspectRatio: "9.5/4.125",
      boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
      fontFamily: `'${brand.bodyFont}', sans-serif`,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      border: "1px solid #e8e4de"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: logo }} />
        <div>
          <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 11, fontWeight: 700, color: c.primary }}>{brand.name}</div>
          <div style={{ fontSize: 7, color: c.neutral }}>{brand.address}</div>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, color: c.primary, fontWeight: 500 }}>Mr. John Client</div>
        <div style={{ fontSize: 8, color: "#999" }}>456 Business Ave, Suite 200<br/>New York, NY 10002</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 40, height: 40, borderRadius: 4, border: `1px dashed ${c.neutral}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: c.neutral }}>
          STAMP
        </div>
      </div>
    </div>
  );
}

function WebsiteHero({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: c.primary, borderRadius: 10, overflow: "hidden",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      fontFamily: `'${brand.bodyFont}', sans-serif`, aspectRatio: "16/9"
    }}>
      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: `1px solid ${c.secondary}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: logo }} />
          <span style={{ fontFamily: `'${brand.headingFont}', serif`, color: "#fff", fontSize: 11, fontWeight: 700 }}>{brand.name}</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Work", "About", "Services", "Contact"].map(n => (
            <span key={n} style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{n}</span>
          ))}
        </div>
      </div>
      {/* Hero */}
      <div style={{ padding: "40px 32px", position: "relative" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${c.accent}08` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 8, color: c.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Welcome to {brand.name}</div>
          <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.1, maxWidth: 360, marginBottom: 10 }}>
            Design is not just what it looks like
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", maxWidth: 300, lineHeight: 1.6, marginBottom: 18 }}>
            {brand.tagline}. We create spaces that move people — literally and emotionally.
          </div>
          <div style={{
            display: "inline-block", padding: "8px 20px",
            background: c.accent, color: c.primary,
            borderRadius: 6, fontSize: 10, fontWeight: 600
          }}>
            View Our Work →
          </div>
        </div>
      </div>
    </div>
  );
}

function AppIcon({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        {[{ s: 28, r: 6, l: "29pt" }, { s: 48, r: 10, l: "60pt" }, { s: 72, r: 16, l: "1024pt" }].map(({ s, r, l }) => (
          <div key={s} style={{ textAlign: "center" }}>
            <div style={{
              width: s, height: s, borderRadius: r,
              background: `linear-gradient(145deg, ${c.primary}, ${c.secondary})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              <div style={{ width: s * 0.5, height: s * 0.5 }} dangerouslySetInnerHTML={{ __html: logo }} />
            </div>
            <div style={{ fontSize: 8, color: "#999", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialPost({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fff", borderRadius: 10, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)", width: "100%",
      fontFamily: `'${brand.bodyFont}', sans-serif`
    }}>
      {/* Post header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: c.primary, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: logo }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{brand.name}</div>
          <div style={{ fontSize: 8, color: "#999" }}>{brand.socialHandle}</div>
        </div>
      </div>
      {/* Post image */}
      <div style={{
        background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
        aspectRatio: "1/1", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 28, textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <svg width="100%" height="100%" viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          {Array.from({ length: 20 }, (_, i) => Array.from({ length: 20 }, (_, j) => (
            <circle key={`${i}-${j}`} cx={i*20+10} cy={j*20+10} r="2" fill="#fff" />
          )))}
        </svg>
        <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.3, maxWidth: 220, position: "relative" }}>
          Spaces That Inspire Connection
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 8, position: "relative" }}>
          {brand.website}
        </div>
      </div>
      {/* Post footer */}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 6 }}>
          {["♡", "💬", "↗"].map(i => <span key={i} style={{ fontSize: 14 }}>{i}</span>)}
        </div>
        <div style={{ fontSize: 9, color: "#555", lineHeight: 1.5 }}>
          <strong>{brand.name.toLowerCase().replace(/\s+/g, "")}</strong> Every space tells a story. What story does yours tell? ✦
        </div>
      </div>
    </div>
  );
}

function SocialStory({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: c.primary, borderRadius: 14, aspectRatio: "9/16",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: 24,
      position: "relative", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      fontFamily: `'${brand.bodyFont}', sans-serif`, maxHeight: 420
    }}>
      <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: `${c.accent}10` }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: logo }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 8, color: c.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>New Project</div>
        <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 10 }}>
          Behind The<br/>Design
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Swipe to see our latest residential project in Manhattan →
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ width: 40, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2, margin: "0 auto" }} />
      </div>
    </div>
  );
}

function LinkedInBanner({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: `linear-gradient(160deg, ${c.primary} 0%, ${c.secondary} 100%)`,
      borderRadius: 10, aspectRatio: "4/1", padding: "20px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
      fontFamily: `'${brand.bodyFont}', sans-serif`, overflow: "hidden",
      position: "relative"
    }}>
      <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", background: `${c.accent}08` }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{brand.name}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{brand.tagline}</div>
      </div>
      <div style={{ width: 48, height: 48, position: "relative", zIndex: 1 }} dangerouslySetInnerHTML={{ __html: logo }} />
    </div>
  );
}

function TShirt({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fafafa", borderRadius: 12, padding: 32,
      display: "flex", flexDirection: "column", alignItems: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #eee"
    }}>
      <svg viewBox="0 0 300 320" width="100%" style={{ maxWidth: 240 }}>
        {/* T-shirt shape */}
        <path d="M60,60 L20,80 L40,140 L80,120 L80,280 Q80,300 100,300 L200,300 Q220,300 220,280 L220,120 L260,140 L280,80 L240,60 Q220,40 200,20 Q170,0 150,0 Q130,0 100,20 Q80,40 60,60 Z"
          fill={c.primary} stroke="none" />
        {/* Collar */}
        <path d="M110,10 Q130,30 150,35 Q170,30 190,10" fill="none" stroke={c.secondary} strokeWidth="2" />
        {/* Logo on chest */}
        <foreignObject x="110" y="80" width="80" height="80">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: logo }} />
        </foreignObject>
        <text x="150" y="185" textAnchor="middle" fill={c.accent} fontSize="10" fontFamily={`'${brand.headingFont}', serif`} fontWeight="600">
          {brand.name}
        </text>
      </svg>
    </div>
  );
}

function ToteBag({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fafafa", borderRadius: 12, padding: 32,
      display: "flex", flexDirection: "column", alignItems: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #eee"
    }}>
      <svg viewBox="0 0 240 300" width="100%" style={{ maxWidth: 200 }}>
        {/* Handles */}
        <path d="M70,60 Q70,20 100,20 L100,60" fill="none" stroke={c.primary} strokeWidth="4" />
        <path d="M140,60 Q140,20 170,20 L170,60" fill="none" stroke={c.primary} strokeWidth="4" />
        {/* Bag body */}
        <rect x="30" y="60" width="180" height="220" rx="8" fill={c.background} stroke={c.neutral} strokeWidth="1" />
        {/* Logo */}
        <foreignObject x="80" y="110" width="80" height="80">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: logo }} />
        </foreignObject>
        <text x="120" y="215" textAnchor="middle" fill={c.primary} fontSize="11" fontFamily={`'${brand.headingFont}', serif`} fontWeight="700">
          {brand.name}
        </text>
        <text x="120" y="230" textAnchor="middle" fill={c.neutral} fontSize="7" fontFamily={`'${brand.bodyFont}', sans-serif`}>
          {brand.tagline}
        </text>
      </svg>
    </div>
  );
}

function CoffeeMug({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fafafa", borderRadius: 12, padding: 32,
      display: "flex", flexDirection: "column", alignItems: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #eee"
    }}>
      <svg viewBox="0 0 260 220" width="100%" style={{ maxWidth: 220 }}>
        {/* Mug body */}
        <rect x="30" y="40" width="160" height="150" rx="12" fill={c.primary} />
        {/* Handle */}
        <path d="M190,70 Q230,70 230,115 Q230,160 190,160" fill="none" stroke={c.primary} strokeWidth="14" strokeLinecap="round" />
        <path d="M190,82 Q218,82 218,115 Q218,148 190,148" fill="none" stroke="#fafafa" strokeWidth="6" strokeLinecap="round" />
        {/* Logo */}
        <foreignObject x="70" y="70" width="80" height="80">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: logo }} />
        </foreignObject>
        {/* Base */}
        <rect x="25" y="185" width="170" height="8" rx="4" fill={c.secondary} />
        {/* Steam */}
        <path d="M80,30 Q85,15 80,5" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
        <path d="M110,25 Q115,8 110,0" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
        <path d="M140,30 Q145,15 140,5" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Storefront({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#f0ede8", borderRadius: 12, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
    }}>
      <svg viewBox="0 0 500 340" width="100%">
        {/* Building wall */}
        <rect x="0" y="0" width="500" height="340" fill="#e8e4de" />
        {/* Window / door area */}
        <rect x="40" y="120" width="180" height="200" rx="4" fill="#333" opacity="0.08" />
        <rect x="280" y="120" width="180" height="200" rx="4" fill="#333" opacity="0.08" />
        {/* Door */}
        <rect x="200" y="140" width="100" height="180" rx="2" fill={c.primary} opacity="0.15" />
        <circle cx="285" cy="240" r="4" fill={c.accent} />
        {/* Sign board */}
        <rect x="100" y="40" width="300" height="60" rx="6" fill={c.primary} />
        <foreignObject x="120" y="48" width="40" height="40">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: logo }} />
        </foreignObject>
        <text x="172" y="68" fill="#fff" fontSize="18" fontFamily={`'${brand.headingFont}', serif`} fontWeight="700">
          {brand.name}
        </text>
        <text x="172" y="86" fill={c.accent} fontSize="8" fontFamily={`'${brand.bodyFont}', sans-serif`}>
          {brand.tagline}
        </text>
        {/* Awning */}
        <path d="M30,118 L470,118 L460,105 L40,105 Z" fill={c.accent} opacity="0.8" />
      </svg>
    </div>
  );
}

function VehicleWrap({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fafafa", borderRadius: 12, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #eee"
    }}>
      <svg viewBox="0 0 600 240" width="100%">
        {/* Van body */}
        <rect x="20" y="40" width="480" height="140" rx="10" fill={c.primary} />
        {/* Cabin */}
        <path d="M500,40 L500,180 L560,180 L560,80 Q560,60 540,50 L500,40 Z" fill={c.secondary} />
        {/* Windshield */}
        <path d="M510,55 L510,100 L548,100 Q555,100 555,93 L555,68 Q555,60 548,57 Z" fill="#8ab4d9" opacity="0.4" />
        {/* Wheels */}
        <circle cx="120" cy="190" r="28" fill="#444" />
        <circle cx="120" cy="190" r="14" fill="#666" />
        <circle cx="120" cy="190" r="5" fill="#999" />
        <circle cx="440" cy="190" r="28" fill="#444" />
        <circle cx="440" cy="190" r="14" fill="#666" />
        <circle cx="440" cy="190" r="5" fill="#999" />
        {/* Ground */}
        <rect x="0" y="215" width="600" height="25" fill="#e5e5e5" />
        {/* Branding on van */}
        <foreignObject x="60" y="70" width="80" height="80">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: logo }} />
        </foreignObject>
        <text x="170" y="100" fill="#fff" fontSize="28" fontFamily={`'${brand.headingFont}', serif`} fontWeight="800">
          {brand.name}
        </text>
        <text x="170" y="120" fill={c.accent} fontSize="10" fontFamily={`'${brand.bodyFont}', sans-serif`}>
          {brand.tagline}
        </text>
        <text x="170" y="148" fill="rgba(255,255,255,0.3)" fontSize="9">
          {brand.website} · {brand.phone}
        </text>
        {/* Accent stripe */}
        <rect x="20" y="160" width="480" height="4" fill={c.accent} rx="2" />
      </svg>
    </div>
  );
}

function PresentationSlide({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fff", borderRadius: 10, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)", aspectRatio: "16/9",
      fontFamily: `'${brand.bodyFont}', sans-serif`,
      display: "flex", position: "relative"
    }}>
      {/* Left accent bar */}
      <div style={{ width: 6, background: c.accent, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: logo }} />
            <span style={{ fontSize: 9, color: c.neutral }}>{brand.name}</span>
          </div>
          <span style={{ fontSize: 8, color: "#ccc" }}>Q1 2026 Review</span>
        </div>
        <div>
          <div style={{ fontFamily: `'${brand.headingFont}', serif`, fontSize: 24, fontWeight: 700, color: c.primary, marginBottom: 8, lineHeight: 1.2 }}>
            Project Overview &<br/>Key Milestones
          </div>
          <div style={{ fontSize: 10, color: "#999", lineHeight: 1.6, maxWidth: 300 }}>
            A summary of our progress across all active engagements and upcoming deliverables for the next quarter.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 7, color: "#ccc" }}>Confidential</span>
          <span style={{ fontSize: 8, color: c.accent, fontWeight: 600 }}>03</span>
        </div>
      </div>
    </div>
  );
}

function Packaging({ brand, logo }) {
  const c = brand.colors;
  return (
    <div style={{
      background: "#fafafa", borderRadius: 12, padding: 28,
      display: "flex", justifyContent: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #eee"
    }}>
      <svg viewBox="0 0 300 320" width="100%" style={{ maxWidth: 220 }}>
        {/* Box front face */}
        <path d="M50,80 L150,40 L250,80 L250,260 L150,300 L50,260 Z" fill={c.primary} />
        {/* Box side face */}
        <path d="M250,80 L250,260 L300,240 L300,60 Z" fill={c.secondary} />
        {/* Box top face */}
        <path d="M50,80 L150,40 L250,80 L200,60 L100,60 Z" fill={c.accent} opacity="0.6" />
        {/* Top lid */}
        <path d="M150,40 L250,80 L300,60 L200,20 Z" fill={c.accent} opacity="0.4" />
        {/* Logo on front */}
        <foreignObject x="105" y="115" width="90" height="90">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: logo }} />
        </foreignObject>
        <text x="150" y="230" textAnchor="middle" fill="#fff" fontSize="14" fontFamily={`'${brand.headingFont}', serif`} fontWeight="700">
          {brand.name}
        </text>
        <text x="150" y="248" textAnchor="middle" fill={c.accent} fontSize="7">
          {brand.tagline}
        </text>
      </svg>
    </div>
  );
}

// ─── Mockup Wrapper ───
function MockupCard({ title, children, span = 1 }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      background: "#fff", borderRadius: 16,
      padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      border: "1px solid #f0f0f0"
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "#999",
        textTransform: "uppercase", letterSpacing: 2,
        marginBottom: 14
      }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Main Component ───
export default function MockupEngine() {
  const [brand, setBrand] = useState(DEFAULT);
  const [logo, setLogo] = useState(PLACEHOLDER_LOGO);
  const [activeCategory, setActiveCategory] = useState("print");
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
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
          const w = svgEl.getAttribute("width") || "100";
          const h = svgEl.getAttribute("height") || "100";
          svgEl.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
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

  const renderMockups = () => {
    switch (activeCategory) {
      case "print":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <MockupCard title="Business Card — Front">
              <BusinessCardFront brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Business Card — Back">
              <BusinessCardBack brand={brand} />
            </MockupCard>
            <MockupCard title="Letterhead" span={1}>
              <Letterhead brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Envelope" span={1}>
              <Envelope brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Presentation Slide" span={2}>
              <PresentationSlide brand={brand} logo={logo} />
            </MockupCard>
          </div>
        );
      case "digital":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <MockupCard title="Website Hero Section" span={2}>
              <WebsiteHero brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="App Icon Sizes" span={2}>
              <AppIcon brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Presentation Slide" span={2}>
              <PresentationSlide brand={brand} logo={logo} />
            </MockupCard>
          </div>
        );
      case "social":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <MockupCard title="Instagram Post">
              <SocialPost brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Instagram Story">
              <SocialStory brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Social Post (Alt)">
              <SocialPost brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="LinkedIn Cover" span={3}>
              <LinkedInBanner brand={brand} logo={logo} />
            </MockupCard>
          </div>
        );
      case "merch":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <MockupCard title="T-Shirt">
              <TShirt brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Tote Bag">
              <ToteBag brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Coffee Mug">
              <CoffeeMug brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Packaging" span={3}>
              <Packaging brand={brand} logo={logo} />
            </MockupCard>
          </div>
        );
      case "environ":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            <MockupCard title="Storefront Signage">
              <Storefront brand={brand} logo={logo} />
            </MockupCard>
            <MockupCard title="Vehicle Wrap">
              <VehicleWrap brand={brand} logo={logo} />
            </MockupCard>
          </div>
        );
      default: return null;
    }
  };

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
          <span style={{ color: "#888", fontSize: 13 }}>Mockup Engine</span>
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
            <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Updates all mockups instantly</div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{
        padding: "16px 24px", background: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex", gap: 6
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: "10px 20px", borderRadius: 10,
              border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Outfit'",
              background: activeCategory === cat.id ? "#1a1a1a" : "#f5f5f5",
              color: activeCategory === cat.id ? "#fff" : "#777",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Mockups Grid */}
      <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{
            fontSize: 26, fontWeight: 700, margin: "0 0 4px",
            letterSpacing: -0.5, color: "#1a1a1a"
          }}>
            {CATEGORIES.find(c => c.id === activeCategory)?.icon}{" "}
            {CATEGORIES.find(c => c.id === activeCategory)?.label} Mockups
          </h2>
          <p style={{ color: "#999", fontSize: 13, margin: 0 }}>
            All mockups auto-populate with your brand assets. Upload your SVG logo to replace the placeholder.
          </p>
        </div>
        {renderMockups()}
      </div>
    </div>
  );
}
