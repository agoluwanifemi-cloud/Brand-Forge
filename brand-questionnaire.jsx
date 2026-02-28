import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ───
const PERSONALITY_TRAITS = [
  { label: "Bold", emoji: "⚡", desc: "Fearless, confident, unapologetic" },
  { label: "Playful", emoji: "🎈", desc: "Fun, lighthearted, approachable" },
  { label: "Luxurious", emoji: "✦", desc: "Premium, exclusive, refined" },
  { label: "Minimal", emoji: "◻", desc: "Simple, clean, essential" },
  { label: "Trustworthy", emoji: "🛡", desc: "Reliable, secure, dependable" },
  { label: "Innovative", emoji: "🔬", desc: "Cutting-edge, forward-thinking" },
  { label: "Warm", emoji: "☀", desc: "Caring, inviting, personal" },
  { label: "Edgy", emoji: "🔥", desc: "Provocative, daring, disruptive" },
  { label: "Sophisticated", emoji: "🎩", desc: "Cultured, elegant, worldly" },
  { label: "Organic", emoji: "🌿", desc: "Natural, authentic, earthy" },
  { label: "Energetic", emoji: "⚡", desc: "Dynamic, vibrant, active" },
  { label: "Intellectual", emoji: "📚", desc: "Thoughtful, analytical, deep" },
  { label: "Friendly", emoji: "👋", desc: "Welcoming, casual, down-to-earth" },
  { label: "Authoritative", emoji: "🏛", desc: "Expert, commanding, respected" },
  { label: "Creative", emoji: "🎨", desc: "Artistic, imaginative, expressive" },
  { label: "Rebellious", emoji: "💀", desc: "Anti-establishment, raw, punk" },
];

const INDUSTRIES = [
  "Technology", "Fashion & Apparel", "Food & Beverage", "Health & Wellness",
  "Finance & Banking", "Education", "Real Estate", "Entertainment & Media",
  "Travel & Hospitality", "Beauty & Cosmetics", "Sports & Fitness",
  "Non-Profit", "Automotive", "Architecture & Design", "Legal Services",
  "E-Commerce", "SaaS / Software", "Agency / Studio", "Other"
];

const AUDIENCES = [
  "Gen Z (18-24)", "Millennials (25-40)", "Gen X (41-56)", "Boomers (57-75)",
  "Professionals / B2B", "Small Business Owners", "Parents & Families",
  "Students", "Creatives & Designers", "Executives / C-Suite",
  "Health-Conscious Consumers", "Luxury Shoppers", "Budget-Conscious Buyers",
  "Tech Enthusiasts", "Environmental Advocates"
];

// ─── AI Call Helper ───
async function callAI(systemPrompt, userPrompt) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("\n") || "";
    return text;
  } catch (err) {
    console.error("AI call failed:", err);
    return null;
  }
}

// ─── Components ───

function StepNav({ current, steps }) {
  return (
    <div style={{
      display: "flex", gap: 0, borderBottom: "1px solid #1a1a1a",
      marginBottom: 40, overflow: "hidden"
    }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          flex: 1, padding: "14px 12px",
          fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
          textTransform: "uppercase",
          color: i === current ? "#fff" : i < current ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
          background: i === current ? "rgba(255,255,255,0.06)" : "transparent",
          borderBottom: i === current ? "2px solid #fff" : "2px solid transparent",
          textAlign: "center",
          transition: "all 0.3s",
          fontFamily: "'Outfit', sans-serif"
        }}>
          <span style={{ opacity: 0.4, marginRight: 6 }}>0{i + 1}</span>
          {s}
        </div>
      ))}
    </div>
  );
}

function PersonalityCard({ trait, selected, onClick }) {
  const isSelected = selected;
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 14px",
        borderRadius: 14,
        border: `2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.08)"}`,
        background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff", color: "#0A0A0A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800
        }}>✓</div>
      )}
      <div style={{ fontSize: 28, marginBottom: 6 }}>{trait.emoji}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{trait.label}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{trait.desc}</div>
    </div>
  );
}

function VoiceSlider({ label, leftLabel, rightLabel, value, onChange }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10
      }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", minWidth: 70, textAlign: "right" }}>{leftLabel}</span>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="range" min="0" max="100" value={value}
            onChange={(e) => onChange(+e.target.value)}
            style={{
              width: "100%", appearance: "none", height: 4,
              borderRadius: 2, outline: "none", cursor: "pointer",
              background: `linear-gradient(to right, rgba(255,255,255,0.3) ${value}%, rgba(255,255,255,0.08) ${value}%)`
            }}
          />
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 4, padding: "0 2px"
          }}>
            {[0, 25, 50, 75, 100].map(tick => (
              <div key={tick} style={{
                width: 1, height: 6,
                background: `rgba(255,255,255,${Math.abs(value - tick) < 10 ? 0.4 : 0.1})`
              }} />
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", minWidth: 70 }}>{rightLabel}</span>
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8,
        display: "block"
      }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>{hint}</div>}
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%", padding: "14px 16px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, color: "#fff", fontSize: 14,
          fontFamily: "'Outfit', sans-serif",
          outline: "none", resize: "vertical",
          lineHeight: 1.7, boxSizing: "border-box",
          transition: "border-color 0.2s"
        }}
        onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8,
        display: "block"
      }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>{hint}</div>}
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "14px 16px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, color: "#fff", fontSize: 14,
          fontFamily: "'Outfit', sans-serif",
          outline: "none", boxSizing: "border-box",
          transition: "border-color 0.2s"
        }}
        onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

function SelectPills({ label, options, selected, onToggle, multi = false, max = 3 }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10,
        display: "block"
      }}>
        {label} {multi && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— select up to {max}</span>}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map(opt => {
          const isActive = multi ? selected.includes(opt) : selected === opt;
          return (
            <div
              key={opt}
              onClick={() => {
                if (multi) {
                  if (isActive) onToggle(selected.filter(s => s !== opt));
                  else if (selected.length < max) onToggle([...selected, opt]);
                } else {
                  onToggle(opt);
                }
              }}
              style={{
                padding: "8px 16px", borderRadius: 20,
                border: `1px solid ${isActive ? "#fff" : "rgba(255,255,255,0.1)"}`,
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                fontSize: 13, cursor: "pointer",
                transition: "all 0.15s", fontWeight: isActive ? 600 : 400
              }}
            >
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIPolishButton({ label, onClick, loading, done }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: done ? "rgba(46,204,113,0.15)" : "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))",
        border: `1px solid ${done ? "rgba(46,204,113,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10, color: done ? "#2ecc71" : "#fff",
        fontSize: 12, fontWeight: 600, cursor: loading ? "wait" : "pointer",
        fontFamily: "'Outfit', sans-serif",
        display: "inline-flex", alignItems: "center", gap: 8,
        transition: "all 0.2s", opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? (
        <>
          <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "aispin 0.6s linear infinite" }} />
          Generating...
        </>
      ) : done ? (
        <>{`✓ ${label}`}</>
      ) : (
        <>{`✦ ${label}`}</>
      )}
    </button>
  );
}

// ─── AI Output Display ───
function AIOutputCard({ title, content, onAccept, onRegenerate, loading }) {
  if (!content && !loading) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, padding: 20, marginTop: 16,
      position: "relative"
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase", letterSpacing: 2, marginBottom: 10,
        display: "flex", alignItems: "center", gap: 6
      }}>
        <span style={{
          background: "linear-gradient(135deg, #6366f1, #ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>AI</span>
        {title}
      </div>
      {loading ? (
        <div style={{ display: "flex", gap: 6, padding: "12px 0" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              animation: `aidot 1s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{
            color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.8,
            whiteSpace: "pre-wrap"
          }}>
            {content}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={onAccept}
              style={{
                padding: "8px 16px", background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Outfit', sans-serif"
              }}
            >✓ Accept</button>
            <button
              onClick={onRegenerate}
              style={{
                padding: "8px 16px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Outfit', sans-serif"
              }}
            >↻ Regenerate</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Review Section ───
function ReviewSection({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div style={{
      padding: "16px 20px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: 12, marginBottom: 10,
      border: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
        textTransform: "uppercase", letterSpacing: 2, marginBottom: 6
      }}>{label}</div>
      <div style={{
        color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.7,
        whiteSpace: "pre-wrap"
      }}>{display}</div>
    </div>
  );
}

// ─── Main Component ───
export default function BrandQuestionnaire() {
  const [step, setStep] = useState(0);
  const steps = ["Basics", "Personality", "Voice", "Story", "AI Magic", "Review"];

  // Basics
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [audiences, setAudiences] = useState([]);

  // Personality
  const [traits, setTraits] = useState([]);

  // Voice
  const [voiceFormal, setVoiceFormal] = useState(50);
  const [voiceSerious, setVoiceSerious] = useState(50);
  const [voiceTechnical, setVoiceTechnical] = useState(30);
  const [voiceEnthusiasm, setVoiceEnthusiasm] = useState(60);

  // Story
  const [missionDraft, setMissionDraft] = useState("");
  const [visionDraft, setVisionDraft] = useState("");
  const [aboutDraft, setAboutDraft] = useState("");
  const [values, setValues] = useState("");

  // AI Outputs
  const [aiMission, setAiMission] = useState("");
  const [aiVision, setAiVision] = useState("");
  const [aiAbout, setAiAbout] = useState("");
  const [aiVoiceGuide, setAiVoiceGuide] = useState("");
  const [aiElevator, setAiElevator] = useState("");
  const [aiBios, setAiBios] = useState("");
  const [aiValues, setAiValues] = useState("");

  // Loading states
  const [loadingMission, setLoadingMission] = useState(false);
  const [loadingVision, setLoadingVision] = useState(false);
  const [loadingAbout, setLoadingAbout] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [loadingElevator, setLoadingElevator] = useState(false);
  const [loadingBios, setLoadingBios] = useState(false);
  const [loadingValues, setLoadingValues] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const brandContext = () => `
Brand Name: ${brandName}
Tagline: ${tagline || "None yet"}
Industry: ${industry}
Target Audience: ${audiences.join(", ") || "General"}
Brand Personality Traits: ${traits.join(", ")}
Voice — Formality: ${voiceFormal}/100 (0=very casual, 100=very formal)
Voice — Seriousness: ${voiceSerious}/100 (0=playful, 100=serious)
Voice — Technical: ${voiceTechnical}/100 (0=simple, 100=technical)
Voice — Enthusiasm: ${voiceEnthusiasm}/100 (0=reserved, 100=enthusiastic)
User's draft mission: ${missionDraft || "Not provided"}
User's draft vision: ${visionDraft || "Not provided"}
User's draft about: ${aboutDraft || "Not provided"}
User's draft values: ${values || "Not provided"}
  `.trim();

  const sysPrompt = "You are a world-class brand strategist and copywriter. Write concise, powerful, professional brand copy. No markdown, no bullet points, no headers — just clean prose. Be specific to this brand, avoid generic platitudes.";

  const generateMission = async () => {
    setLoadingMission(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nWrite a polished, powerful mission statement for this brand in 2-3 sentences. If the user provided a draft, refine and elevate it. If not, create one from scratch based on the brand context.`);
    if (res) setAiMission(res);
    setLoadingMission(false);
  };

  const generateVision = async () => {
    setLoadingVision(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nWrite a compelling vision statement for this brand in 2-3 sentences. Forward-looking, aspirational, specific to their industry and audience. If user provided a draft, elevate it.`);
    if (res) setAiVision(res);
    setLoadingVision(false);
  };

  const generateAbout = async () => {
    setLoadingAbout(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nWrite a polished "About" paragraph for this brand (3-5 sentences). Convey who they are, what they do, why they matter. If user provided a draft, refine and professionalize it.`);
    if (res) setAiAbout(res);
    setLoadingAbout(false);
  };

  const generateVoiceGuide = async () => {
    setLoadingVoice(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nWrite a brand voice & tone guide. Include:\n1. A 2-sentence voice description\n2. Three "We are..." statements and three "We are not..." statements\n3. A sample paragraph written in this brand's voice (like a website hero section)\n\nKeep it concise and practical. No markdown headers, use simple line breaks.`);
    if (res) setAiVoiceGuide(res);
    setLoadingVoice(false);
  };

  const generateElevator = async () => {
    setLoadingElevator(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nWrite two elevator pitches for this brand:\n\n30-second version: (2-3 sentences)\n\n60-second version: (4-6 sentences)\n\nMake them natural, conversational, and memorable. No markdown.`);
    if (res) setAiElevator(res);
    setLoadingElevator(false);
  };

  const generateBios = async () => {
    setLoadingBios(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nWrite social media bios for this brand:\n\nInstagram (150 chars max): ...\nLinkedIn (220 chars max): ...\nTwitter/X (160 chars max): ...\n\nEach should match the brand voice and include relevant keywords. No markdown.`);
    if (res) setAiBios(res);
    setLoadingBios(false);
  };

  const generateValues = async () => {
    setLoadingValues(true);
    const res = await callAI(sysPrompt, `${brandContext()}\n\nDefine 4-5 core brand values for this brand. For each value, write the value name followed by a colon and a 1-sentence description. Put each on its own line. If user provided draft values, refine them. Make them specific and meaningful, not generic.`);
    if (res) setAiValues(res);
    setLoadingValues(false);
  };

  const generateAll = async () => {
    setLoadingAll(true);
    await Promise.all([
      generateMission(),
      generateVision(),
      generateAbout(),
      generateVoiceGuide(),
      generateElevator(),
      generateBios(),
      generateValues()
    ]);
    setLoadingAll(false);
  };

  const canNext = () => {
    if (step === 0) return !!brandName && !!industry;
    if (step === 1) return traits.length >= 3;
    return true;
  };

  const toggleTrait = (t) => {
    if (traits.includes(t)) setTraits(traits.filter(x => x !== t));
    else if (traits.length < 5) setTraits([...traits, t]);
  };

  // Navigation buttons
  const navBtn = (label, onClick, primary = false) => (
    <button
      onClick={onClick}
      style={{
        padding: "14px 28px",
        background: primary ? "#fff" : "transparent",
        color: primary ? "#0A0A0A" : "rgba(255,255,255,0.5)",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, fontSize: 14, fontWeight: 600,
        cursor: "pointer", fontFamily: "'Outfit', sans-serif",
        transition: "all 0.2s",
        opacity: primary && !canNext() ? 0.3 : 1,
        pointerEvents: primary && !canNext() ? "none" : "auto"
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      minHeight: "100vh",
      background: "#0A0A0A",
      color: "#fff"
    }}>
      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.04), transparent)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.03), transparent)", filter: "blur(100px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 32
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: "#fff", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 15, color: "#0A0A0A"
            }}>B</div>
            <span style={{ fontWeight: 700, fontSize: 17 }}>BrandForge</span>
            <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Brand Questionnaire</span>
          </div>
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,0.3)",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {step + 1}/{steps.length}
          </div>
        </div>

        <StepNav current={step} steps={steps} />

        {/* ─── Step 0: Basics ─── */}
        {step === 0 && (
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1.5 }}>
              Let's start with the basics.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 36, fontSize: 15 }}>
              The essential information about this brand.
            </p>
            <InputField label="Brand Name *" value={brandName} onChange={setBrandName} placeholder="e.g. Lumina Studio" />
            <InputField label="Tagline" value={tagline} onChange={setTagline} placeholder="e.g. Designing the future, today" hint="A short phrase that captures the brand's essence" />
            <SelectPills label="Industry *" options={INDUSTRIES} selected={industry} onToggle={setIndustry} />
            <SelectPills label="Target Audience" options={AUDIENCES} selected={audiences} onToggle={setAudiences} multi max={4} />
            <InputField label="Website" value={website} onChange={setWebsite} placeholder="https://..." hint="Optional — if the brand already has a web presence" />
          </div>
        )}

        {/* ─── Step 1: Personality ─── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1.5 }}>
              Define the personality.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 12, fontSize: 15 }}>
              Select 3 to 5 traits that define how this brand feels.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", background: traits.length >= 3 ? "rgba(46,204,113,0.1)" : "rgba(255,255,255,0.03)",
              borderRadius: 20, marginBottom: 24,
              border: `1px solid ${traits.length >= 3 ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.06)"}`
            }}>
              <span style={{
                fontSize: 22, fontWeight: 800,
                color: traits.length >= 3 ? "#2ecc71" : "rgba(255,255,255,0.3)",
                fontFamily: "'JetBrains Mono', monospace"
              }}>{traits.length}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/ 5 selected</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10
            }}>
              {PERSONALITY_TRAITS.map(t => (
                <PersonalityCard
                  key={t.label}
                  trait={t}
                  selected={traits.includes(t.label)}
                  onClick={() => toggleTrait(t.label)}
                />
              ))}
            </div>
            {traits.length > 0 && (
              <div style={{
                marginTop: 20, padding: "14px 18px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)"
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Selected Traits</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {traits.map(t => (
                    <span key={t} style={{
                      padding: "6px 14px", background: "rgba(255,255,255,0.08)",
                      borderRadius: 20, fontSize: 13, fontWeight: 600
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 2: Voice ─── */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1.5 }}>
              Set the voice & tone.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 36, fontSize: 15 }}>
              Drag the sliders to define how this brand communicates.
            </p>
            <VoiceSlider label="Formality" leftLabel="Casual" rightLabel="Formal" value={voiceFormal} onChange={setVoiceFormal} />
            <VoiceSlider label="Mood" leftLabel="Playful" rightLabel="Serious" value={voiceSerious} onChange={setVoiceSerious} />
            <VoiceSlider label="Complexity" leftLabel="Simple" rightLabel="Technical" value={voiceTechnical} onChange={setVoiceTechnical} />
            <VoiceSlider label="Energy" leftLabel="Reserved" rightLabel="Enthusiastic" value={voiceEnthusiasm} onChange={setVoiceEnthusiasm} />

            <div style={{
              marginTop: 12, padding: 20,
              background: "rgba(255,255,255,0.02)",
              borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                Voice Preview
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
                {voiceFormal > 60
                  ? `${brandName || "This brand"} maintains a professional and polished communication style that commands respect and establishes authority in the ${industry || "industry"}.`
                  : voiceFormal < 40
                    ? `Hey there! ${brandName || "We"}'re all about keeping it real and making ${industry || "what we do"} feel approachable for everyone.`
                    : `${brandName || "This brand"} strikes a balance between professional credibility and genuine approachability in the ${industry || "space"}.`
                }
                {voiceEnthusiasm > 65 ? " And we're absolutely thrilled about what's next!" : voiceEnthusiasm < 35 ? " We let our work speak for itself." : ""}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Story ─── */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1.5 }}>
              Tell the brand story.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 36, fontSize: 15 }}>
              Write rough drafts — AI will polish them in the next step. Or leave blank and we'll generate from scratch.
            </p>
            <TextArea
              label="Mission Statement"
              value={missionDraft}
              onChange={setMissionDraft}
              placeholder="What does this brand exist to do? What problem does it solve?"
              hint="The brand's purpose and reason for existing"
            />
            <TextArea
              label="Vision Statement"
              value={visionDraft}
              onChange={setVisionDraft}
              placeholder="Where is this brand headed? What future does it want to create?"
              hint="The aspirational future the brand is working toward"
            />
            <TextArea
              label="About the Brand"
              value={aboutDraft}
              onChange={setAboutDraft}
              placeholder="Tell us about the brand — its story, what makes it unique, what it stands for..."
              rows={4}
            />
            <TextArea
              label="Core Values"
              value={values}
              onChange={setValues}
              placeholder="e.g. Innovation, Transparency, Sustainability, Community..."
              hint="List key values separated by commas"
            />
          </div>
        )}

        {/* ─── Step 4: AI Magic ─── */}
        {step === 4 && (
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1.5 }}>
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>AI</span> Brand Copy Generator
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24, fontSize: 15 }}>
              Generate professional brand copy from your inputs. Click individual sections or generate everything at once.
            </p>

            <button
              onClick={generateAll}
              disabled={loadingAll}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15))",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: loadingAll ? "wait" : "pointer",
                fontFamily: "'Outfit', sans-serif",
                marginBottom: 32, transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10
              }}
            >
              {loadingAll ? (
                <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "aispin 0.6s linear infinite" }} /> Generating all brand copy...</>
              ) : (
                <>✦ Generate Everything at Once</>
              )}
            </button>

            <div style={{ display: "grid", gap: 20 }}>
              {/* Mission */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Mission Statement</div>
                  <AIPolishButton label="Generate Mission" onClick={generateMission} loading={loadingMission} done={!!aiMission} />
                </div>
                <AIOutputCard
                  title="Generated Mission"
                  content={aiMission}
                  loading={loadingMission}
                  onAccept={() => setMissionDraft(aiMission)}
                  onRegenerate={generateMission}
                />
              </div>

              {/* Vision */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Vision Statement</div>
                  <AIPolishButton label="Generate Vision" onClick={generateVision} loading={loadingVision} done={!!aiVision} />
                </div>
                <AIOutputCard title="Generated Vision" content={aiVision} loading={loadingVision} onAccept={() => setVisionDraft(aiVision)} onRegenerate={generateVision} />
              </div>

              {/* About */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>About Paragraph</div>
                  <AIPolishButton label="Generate About" onClick={generateAbout} loading={loadingAbout} done={!!aiAbout} />
                </div>
                <AIOutputCard title="Generated About" content={aiAbout} loading={loadingAbout} onAccept={() => setAboutDraft(aiAbout)} onRegenerate={generateAbout} />
              </div>

              {/* Values */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Brand Values</div>
                  <AIPolishButton label="Generate Values" onClick={generateValues} loading={loadingValues} done={!!aiValues} />
                </div>
                <AIOutputCard title="Generated Values" content={aiValues} loading={loadingValues} onAccept={() => setValues(aiValues)} onRegenerate={generateValues} />
              </div>

              {/* Voice Guide */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Voice & Tone Guide</div>
                  <AIPolishButton label="Generate Guide" onClick={generateVoiceGuide} loading={loadingVoice} done={!!aiVoiceGuide} />
                </div>
                <AIOutputCard title="Generated Voice Guide" content={aiVoiceGuide} loading={loadingVoice} onAccept={() => {}} onRegenerate={generateVoiceGuide} />
              </div>

              {/* Elevator Pitch */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Elevator Pitch</div>
                  <AIPolishButton label="Generate Pitch" onClick={generateElevator} loading={loadingElevator} done={!!aiElevator} />
                </div>
                <AIOutputCard title="Generated Elevator Pitch" content={aiElevator} loading={loadingElevator} onAccept={() => {}} onRegenerate={generateElevator} />
              </div>

              {/* Social Bios */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Social Media Bios</div>
                  <AIPolishButton label="Generate Bios" onClick={generateBios} loading={loadingBios} done={!!aiBios} />
                </div>
                <AIOutputCard title="Generated Social Bios" content={aiBios} loading={loadingBios} onAccept={() => {}} onRegenerate={generateBios} />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 5: Review ─── */}
        {step === 5 && (
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1.5 }}>
              Brand Profile Review
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 36, fontSize: 15 }}>
              Review everything before generating your brand identity guide.
            </p>

            <div style={{
              padding: 24, background: "rgba(255,255,255,0.02)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 24
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase", letterSpacing: 2, marginBottom: 16
              }}>Brand Essentials</div>
              <ReviewSection label="Brand Name" value={brandName} />
              <ReviewSection label="Tagline" value={tagline} />
              <ReviewSection label="Industry" value={industry} />
              <ReviewSection label="Target Audience" value={audiences} />
              <ReviewSection label="Website" value={website} />
            </div>

            <div style={{
              padding: 24, background: "rgba(255,255,255,0.02)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 24
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase", letterSpacing: 2, marginBottom: 16
              }}>Personality & Voice</div>
              <ReviewSection label="Personality Traits" value={traits} />
              <ReviewSection label="Voice Profile" value={`Formality: ${voiceFormal}% · Mood: ${voiceSerious}% · Complexity: ${voiceTechnical}% · Energy: ${voiceEnthusiasm}%`} />
            </div>

            <div style={{
              padding: 24, background: "rgba(255,255,255,0.02)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 24
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase", letterSpacing: 2, marginBottom: 16
              }}>Brand Copy</div>
              <ReviewSection label="Mission" value={aiMission || missionDraft} />
              <ReviewSection label="Vision" value={aiVision || visionDraft} />
              <ReviewSection label="About" value={aiAbout || aboutDraft} />
              <ReviewSection label="Values" value={aiValues || values} />
              <ReviewSection label="Voice Guide" value={aiVoiceGuide} />
              <ReviewSection label="Elevator Pitch" value={aiElevator} />
              <ReviewSection label="Social Bios" value={aiBios} />
            </div>

            <div style={{
              padding: 24,
              background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Brand Profile Complete</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 20 }}>
                This data will feed into your 15-page Brand Identity Guide, mockups, and export assets.
              </div>
              <button style={{
                padding: "16px 40px",
                background: "#fff", color: "#0A0A0A",
                border: "none", borderRadius: 12,
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Outfit', sans-serif"
              }}>
                → Continue to Brand Guide
              </button>
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 40, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>
          {step > 0 ? navBtn("← Back", () => setStep(step - 1)) : <div />}
          {step < steps.length - 1 && navBtn(
            step === 3 ? "Next: AI Magic →" : "Continue →",
            () => setStep(step + 1),
            true
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes aispin {
          to { transform: rotate(360deg); }
        }
        @keyframes aidot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
