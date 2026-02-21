import { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { processGamification } from "./gamification";

const colors = {
    primary: "#6366f1",
    secondary: "#10b981",
    break: "#3b82f6",
    dark: "#1f2937",
    gray: "#6b7280",
    grayLight: "#f3f4f6",
    white: "#ffffff"
};

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function Pomodoro() {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isWork, setIsWork] = useState(true);
    const [showMusic, setShowMusic] = useState(false);
    const [saving, setSaving] = useState(false);

    const timerRef = useRef(null);

    // Helper formatting mm:ss
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            handleComplete();
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const handleComplete = async () => {
        setIsActive(false);
        clearInterval(timerRef.current);

        // If a work session completed, save to DB
        if (isWork) {
            await savePomodoro();
            // Switch to break
            setIsWork(false);
            setTimeLeft(BREAK_TIME);
            alert("Harika çalıştın! Şimdi 5 dakikalık mola zamanı.");
        } else {
            // Break completed, switch to work
            setIsWork(true);
            setTimeLeft(WORK_TIME);
            alert("Mola bitti! Yeni bir odak seansına hazır mısın?");
        }
    };

    const savePomodoro = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setSaving(true);
        try {
            const dateKey = new Date().toLocaleDateString("tr-TR"); // format: 22.02.2026

            await addDoc(collection(db, "pomodoros"), {
                uid: user.uid,
                dateKey,
                minutes: 25,
                type: "work",
                createdAt: new Date().toISOString()
            });

            // Trigger gamification (+150 XP for a Pomodoro)
            const result = await processGamification(user.uid, 150, { type: "pomodoro" });
            if (result && result.newBadgesUnlocked.length > 0) {
                const names = result.newBadgesUnlocked.map(b => `${b.icon} ${b.name}`).join(", ");
                alert(`🎉 TEBRİKLER! Yeni rozet(ler) kazandın: ${names}`);
            }

        } catch (e) {
            console.error("Pomodoro kaydedilemedi:", e);
        } finally {
            setSaving(false);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        clearInterval(timerRef.current);
        setTimeLeft(isWork ? WORK_TIME : BREAK_TIME);
    };

    const skipSession = () => {
        setIsActive(false);
        clearInterval(timerRef.current);
        if (isWork) {
            if (window.confirm("Çalışma seansını atlamak istiyor musun? Bu süre kaydedilmeyecek.")) {
                setIsWork(false);
                setTimeLeft(BREAK_TIME);
            }
        } else {
            setIsWork(true);
            setTimeLeft(WORK_TIME);
        }
    };

    return (
        <div style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                <div style={{ textAlign: "left" }}>
                    <h1 style={{ margin: 0, color: colors.dark, fontSize: 28, fontWeight: 700 }}>
                        ⏱️ Odak Odası
                    </h1>
                    <p style={{ margin: "8px 0 0", color: colors.gray }}>
                        Pomodoro tekniğiyle dikkatin dağılmadan çalış. Sürelerin analizine yansıyacak.
                    </p>
                </div>
                <button
                    onClick={() => setShowMusic(!showMusic)}
                    style={{
                        background: showMusic ? colors.primary : colors.grayLight,
                        color: showMusic ? colors.white : colors.dark,
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s ease"
                    }}
                >
                    🎧 Lofi Radyo {showMusic ? "Açık" : "Kapalı"}
                </button>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                {/* Timer Section */}
                <div style={{
                    flex: 1,
                    background: colors.white,
                    borderRadius: 24,
                    padding: 40,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>

                    <div style={{ display: "flex", gap: 8, marginBottom: 32, background: colors.grayLight, padding: 6, borderRadius: 16 }}>
                        <button
                            onClick={() => { setIsWork(true); setIsActive(false); setTimeLeft(WORK_TIME); }}
                            style={{
                                flex: 1,
                                padding: "8px 24px",
                                borderRadius: 12,
                                border: "none",
                                background: isWork ? colors.white : "transparent",
                                color: isWork ? colors.primary : colors.gray,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: isWork ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
                                transition: "all 0.2s"
                            }}
                        >
                            💼 Çalışma
                        </button>
                        <button
                            onClick={() => { setIsWork(false); setIsActive(false); setTimeLeft(BREAK_TIME); }}
                            style={{
                                flex: 1,
                                padding: "8px 24px",
                                borderRadius: 12,
                                border: "none",
                                background: !isWork ? colors.white : "transparent",
                                color: !isWork ? colors.break : colors.gray,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: !isWork ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
                                transition: "all 0.2s"
                            }}
                        >
                            ☕ Mola
                        </button>
                    </div>

                    {/* Time Display */}
                    <div style={{
                        fontSize: 120,
                        fontWeight: 800,
                        color: isWork ? colors.primary : colors.break,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                        marginBottom: 40,
                        textShadow: isWork ? "0 4px 20px rgba(99, 102, 241, 0.2)" : "0 4px 20px rgba(59, 130, 246, 0.2)"
                    }}>
                        {formatTime(timeLeft)}
                    </div>

                    <div style={{ display: "flex", gap: 16 }}>
                        <button
                            onClick={toggleTimer}
                            style={{
                                background: isActive ? colors.grayLight : (isWork ? colors.primary : colors.break),
                                color: isActive ? colors.dark : colors.white,
                                border: "none",
                                padding: "16px 40px",
                                borderRadius: 16,
                                fontWeight: 700,
                                fontSize: 18,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                boxShadow: isActive ? "none" : `0 8px 25px ${isWork ? 'rgba(99, 102, 241, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                                transition: "all 0.2s ease"
                            }}
                        >
                            {isActive ? "⏸ Duraklat" : "▶ Başlat"}
                        </button>
                        <button
                            onClick={resetTimer}
                            style={{
                                background: colors.grayLight,
                                color: colors.dark,
                                border: "none",
                                padding: "16px 24px",
                                borderRadius: 16,
                                fontWeight: 600,
                                fontSize: 16,
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            🔄 Sıfırla
                        </button>
                        <button
                            onClick={skipSession}
                            style={{
                                background: "transparent",
                                color: colors.gray,
                                border: "none",
                                padding: "16px",
                                borderRadius: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            ⏭ Atla
                        </button>
                    </div>

                    {saving && (
                        <div style={{ marginTop: 24, fontSize: 13, color: colors.secondary, fontWeight: 500 }}>
                            ✅ Odaklanma süren kaydediliyor...
                        </div>
                    )}
                </div>

                {/* Music Player Side */}
                {showMusic && (
                    <div style={{
                        width: 300,
                        background: colors.dark,
                        borderRadius: 24,
                        overflow: "hidden",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        animation: "fadeIn 0.3s ease"
                    }}>
                        <div style={{ padding: "16px 20px", color: colors.white, fontWeight: 600, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            Sesli Odak (Lofi)
                            <button
                                onClick={() => setShowMusic(false)}
                                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18 }}
                            >✕</button>
                        </div>
                        {/* YouTube Embed for Lofi Girl */}
                        <iframe
                            width="100%"
                            height="200"
                            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1"
                            title="Lofi Girl Radio"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ display: "block", pointerEvents: "none" }} // prevent full youtube navigation
                        ></iframe>
                        <div style={{ padding: 16, fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "left" }}>
                            * Müzik sesi çok yüksekse bilgisayarının sesini kısabilirsin.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
