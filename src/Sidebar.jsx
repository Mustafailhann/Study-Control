import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { calculateLevel, getNextLevelXp } from "./gamification";
import { NotebookPen } from "lucide-react";

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
    { id: "shouldStudy", label: "Tekrar Edilecek", icon: "🔄", count: null },
    { id: "mistakes", label: "Yanlış Defterim", icon: "📸", count: null },
    { id: "mockExams", label: "Denemelerim", icon: "📊", count: null },
    { id: "pomodoro", label: "Odak Odası", icon: "⏱️", count: null },
    { id: "notebook", label: "Not Defterim", icon: <NotebookPen size={20} strokeWidth={2.5} />, count: null }
  ];

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [userGamification, setUserGamification] = useState({ xp: 0, level: 1 });

  useEffect(() => {
    // Listen to user XP changes
    let unsubscribe = () => { };
    if (auth.currentUser) {
      unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const xp = data.xp || 0;
          setUserGamification({ xp, level: calculateLevel(xp) });
        }
      });
    }
    return () => unsubscribe();
  }, [auth.currentUser]);

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
    <div className="w-full lg:w-[280px] lg:min-h-screen p-4 lg:p-5 flex flex-col lg:flex-col" style={{ background: colors.gradient }}>
      {/* Hamburger / Top Section for Mobile */}
      <div className="flex flex-col lg:flex-col gap-4 lg:gap-0 lg:mb-8 p-4 rounded-2xl mb-4" style={{
        background: "rgba(255,255,255,0.1)",
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

        {/* Level and XP Bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.white }}>Seviye {userGamification.level}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
              {userGamification.xp} / {getNextLevelXp(userGamification.level)} XP
            </span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: "#10b981", // Success green
              width: `${Math.min(100, (userGamification.xp / getNextLevelXp(userGamification.level)) * 100)}%`,
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>
      </div>

      {/* Main Content Area: Menu & Extras */}
      <div className="flex flex-col lg:flex-1 w-full gap-4 lg:gap-0">

        {/* Menu Items: Horizontal scroll on mobile, vertical list on desktop */}
        <div className="flex-1 lg:flex-auto">
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

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 hide-scrollbar">
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
        </div>

        {/* Bottom/Side Area Container */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:mt-auto">
          {/* YKS Countdown */}
          <div className="flex-1 lg:flex-none" style={{
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

          {/* Actions & AI Buttons */}
          <div className="flex-1 flex flex-col gap-2">
            {/* AI Buttons Container */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

          </div>

          {/* Divider (Only visible on Desktop) */}
          <div className="hidden lg:block" style={{
            height: 1,
            background: "rgba(255,255,255,0.2)",
            margin: "8px 0"
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
      </div>
    </div>
  );
}
