import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const colors = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  white: "#ffffff",
  dark: "#1f2937"
};

export default function Sidebar({ filter, setFilter, onAIClick, onReportClick }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  const menuItems = [
    { id: "all", label: "Tüm Konular", icon: "📚", count: null },
    { id: "completed", label: "Tamamlananlar", icon: "✅", count: null },
    { id: "shouldStudy", label: "Tekrar Edilecek", icon: "🔄", count: null }
  ];

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    // YKS 2026 (Tahmini: 20 Haziran 2026 10:15)
    const yksDate = new Date("2026-06-20T10:15:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = yksDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        width: 280,
        minHeight: "100vh",
        padding: 20,
        background: colors.gradient,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Logo */}
      <div style={{
        marginBottom: 32,
        padding: "16px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        backdropFilter: "blur(10px)"
      }}>
        <h2 style={{
          margin: 0,
          color: colors.white,
          fontSize: 22,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <span style={{ fontSize: 28 }}>📖</span>
          Study Control
        </h2>
        <p style={{
          margin: "8px 0 0",
          color: "rgba(255,255,255,0.7)",
          fontSize: 12
        }}>
          Hedefine odaklan, başarıya ulaş
        </p>
      </div>

      {/* Menu */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 12,
          paddingLeft: 12
        }}>
          Menü
        </div>

        {menuItems.map(item => (
          <div
            key={item.id}
            onClick={() => setFilter(item.id)}
            style={{
              padding: "14px 16px",
              background: filter === item.id
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.1)",
              borderRadius: 12,
              marginBottom: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: filter === item.id ? colors.dark : colors.white,
              fontWeight: filter === item.id ? 600 : 400,
              transition: "all 0.2s ease",
              boxShadow: filter === item.id
                ? "0 4px 15px rgba(0,0,0,0.1)"
                : "none"
            }}
            onMouseEnter={e => {
              if (filter !== item.id) {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }
            }}
            onMouseLeave={e => {
              if (filter !== item.id) {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.count !== null && (
              <span style={{
                background: filter === item.id ? colors.primary : "rgba(255,255,255,0.2)",
                color: colors.white,
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600
              }}>
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* YKS Countdown */}
      <div style={{
        marginTop: "auto",
        marginBottom: 16,
        padding: "16px",
        background: "rgba(0,0,0,0.2)",
        borderRadius: 12,
        color: colors.white,
        textAlign: "center"
      }}>
        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>YKS'YE KALAN SÜRE</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{timeLeft.days}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>GÜN</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.5, paddingBottom: 12 }}>:</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{timeLeft.hours}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>SAAT</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.5, paddingBottom: 12 }}>:</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{timeLeft.minutes}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>DK</div>
          </div>
        </div>
      </div>

      {/* AI Buttons Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        <button
          onClick={onReportClick}
          style={{
            padding: "14px 16px",
            background: "rgba(99, 102, 241, 0.9)", // indigo primary
            color: colors.white,
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.2s ease",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.9)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>📊</span>
          Günlük Analiz
        </button>

        <button
          onClick={onAIClick}
          style={{
            padding: "14px 16px",
            background: "rgba(16, 185, 129, 0.9)",
            color: colors.white,
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.2s ease",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.9)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>🤖</span>
          AI Koç
        </button>
      </div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: "rgba(255,255,255,0.2)",
        margin: "16px 0"
      }} />

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          padding: "14px 16px",
          background: "rgba(239, 68, 68, 0.9)",
          color: colors.white,
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.2s ease",
          boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span>🚪</span>
        Çıkış Yap
      </button>
    </div>
  );
}
