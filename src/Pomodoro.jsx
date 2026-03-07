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
    const [workDuration, setWorkDuration] = useState(25); // 25 or 40
    const [sessionNote, setSessionNote] = useState("");
    const [workStartTime, setWorkStartTime] = useState(null); // time when session started
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

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

    useEffect(() => {
        // Fetch history when component mounts
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            // we could optimize by getting today's only, but getting recent 20 is fine
            const q = collection(db, "pomodoros");
            // note: without an index, we might just get all and filter/sort in JS if too small,
            // or we use simple getDocs if it's minimal. To avoid complex query issues, get user's data and sort.
            // Using a simple fetch for now since it's a personal app.
            import("firebase/firestore").then(({ getDocs, query, where, orderBy, limit }) => {
                const userQuery = query(
                    q,
                    where("uid", "==", user.uid),
                    orderBy("createdAt", "desc"),
                    limit(50)
                );
                getDocs(userQuery).then(snapshot => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setHistory(data.filter(d => d.type === "work"));
                }).catch(err => {
                    console.error("Geçmiş çekilemedi, index gerekebilir:", err);
                    // Fallback without orderBy if index is missing
                    const simpleQuery = query(q, where("uid", "==", user.uid));
                    getDocs(simpleQuery).then(snap => {
                        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        data = data.filter(d => d.type === "work");
                        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setHistory(data.slice(0, 50));
                    });
                });
            });
        } catch (e) {
            console.error("Geçmiş çekilemedi:", e);
        }
    }

    const handleComplete = async () => {
        setIsActive(false);
        clearInterval(timerRef.current);

        // If a work session completed, save to DB
        if (isWork) {
            await savePomodoro();
            // Switch to break
            setIsWork(false);
            setTimeLeft(BREAK_TIME);
            setSessionNote(""); // clear note for next session
            alert(`Harika çalıştın! Şimdi 5 dakikalık mola zamanı.`);
        } else {
            // Break completed, switch to work
            setIsWork(true);
            setTimeLeft(workDuration * 60);
            alert("Mola bitti! Yeni bir odak seansına hazır mısın?");
        }
    };

    const savePomodoro = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setSaving(true);
        try {
            const dateKey = new Date().toLocaleDateString("tr-TR"); // format: 22.02.2026
            const startedAt = workStartTime || new Date(Date.now() - workDuration * 60000).toISOString();

            const newDoc = {
                uid: user.uid,
                dateKey,
                minutes: workDuration,
                type: "work",
                note: sessionNote,
                startedAt: startedAt,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, "pomodoros"), newDoc);

            // Add to local history immediately
            setHistory([{ id: docRef.id, ...newDoc }, ...history]);

            // Trigger gamification (+150 XP for a Pomodoro)
            // if duration is 40, give more xp? Let's give proportional xp: 25m = 150XP, 40m = 240XP
            const xpToGive = workDuration === 40 ? 240 : 150;
            const result = await processGamification(user.uid, xpToGive, { type: "pomodoro", minutes: workDuration });
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

    const toggleTimer = () => {
        if (!isActive && isWork && timeLeft === workDuration * 60) {
            setWorkStartTime(new Date().toISOString());
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        clearInterval(timerRef.current);
        setTimeLeft(isWork ? workDuration * 60 : BREAK_TIME);
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
            setTimeLeft(workDuration * 60);
        }
    };

    // Helper for history display
    const formatHistoryTime = (isoString) => {
        if (!isoString) return "";
        const d = new Date(isoString);
        return d.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ textAlign: "left" }}>
                    <h1 style={{ margin: 0, color: colors.dark, fontSize: 28, fontWeight: 700 }}>
                        ⏱️ Odak Odası
                    </h1>
                    <p style={{ margin: "8px 0 0", color: colors.gray }}>
                        Süre boyunca dikkatin dağılmadan çalış. Analizlerine yansıyacak.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={{
                            background: showHistory ? colors.primary : colors.white,
                            color: showHistory ? colors.white : colors.dark,
                            border: `1px solid ${colors.grayLight}`,
                            padding: "10px 16px",
                            borderRadius: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        📜 Geçmiş
                    </button>
                    <button
                        onClick={() => setShowMusic(!showMusic)}
                        style={{
                            background: showMusic ? colors.primary : colors.white,
                            color: showMusic ? colors.white : colors.dark,
                            border: `1px solid ${colors.grayLight}`,
                            padding: "10px 16px",
                            borderRadius: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        🎧 Lofi Radyo
                    </button>
                </div>
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

                    <div style={{ display: "flex", gap: 8, marginBottom: 20, background: colors.grayLight, padding: 6, borderRadius: 16 }}>
                        <button
                            onClick={() => { setIsWork(true); setIsActive(false); setTimeLeft(workDuration * 60); }}
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

                    {/* Duration Selection */}
                    {isWork && !isActive && timeLeft === workDuration * 60 && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                            <button
                                onClick={() => { setWorkDuration(25); setTimeLeft(25 * 60); }}
                                style={{
                                    padding: "6px 16px",
                                    borderRadius: 10,
                                    border: `1px solid ${workDuration === 25 ? colors.primary : colors.grayLight}`,
                                    background: workDuration === 25 ? colors.primary + "11" : colors.white,
                                    color: workDuration === 25 ? colors.primary : colors.gray,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                25 Dakika
                            </button>
                            <button
                                onClick={() => { setWorkDuration(40); setTimeLeft(40 * 60); }}
                                style={{
                                    padding: "6px 16px",
                                    borderRadius: 10,
                                    border: `1px solid ${workDuration === 40 ? colors.primary : colors.grayLight}`,
                                    background: workDuration === 40 ? colors.primary + "11" : colors.white,
                                    color: workDuration === 40 ? colors.primary : colors.gray,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                40 Dakika
                            </button>
                        </div>
                    )}

                    {/* Subject/Note Input */}
                    {isWork && !isActive && timeLeft === workDuration * 60 && (
                        <div style={{ marginBottom: 24, width: "100%", maxWidth: 300 }}>
                            <input
                                type="text"
                                placeholder="Örn: Türev çalışıyorum..."
                                value={sessionNote}
                                onChange={(e) => setSessionNote(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: 12,
                                    border: `1px solid ${colors.grayLight}`,
                                    outline: "none",
                                    fontSize: 14,
                                    fontFamily: "inherit",
                                    textAlign: "center",
                                    boxSizing: "border-box"
                                }}
                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                onBlur={(e) => e.target.style.borderColor = colors.grayLight}
                            />
                        </div>
                    )}

                    {isWork && isActive && sessionNote && (
                        <div style={{ marginBottom: 16, color: colors.gray, fontWeight: 500, fontSize: 16 }}>
                            🎯 {sessionNote}
                        </div>
                    )}

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

                {/* History Section */}
                {showHistory && (
                    <div style={{
                        width: 300,
                        background: colors.white,
                        borderRadius: 24,
                        overflow: "hidden",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                        animation: "fadeIn 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: 500
                    }}>
                        <div style={{ padding: "16px 20px", color: colors.dark, fontWeight: 700, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.grayLight}` }}>
                            📜 Geçmiş Seanslar
                            <button
                                onClick={() => setShowHistory(false)}
                                style={{ background: "none", border: "none", color: colors.gray, cursor: "pointer", fontSize: 18 }}
                            >✕</button>
                        </div>
                        <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
                            {history.length === 0 ? (
                                <div style={{ color: colors.gray, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                                    Henüz odak seansı kaydın yok.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {history.map((item, idx) => (
                                        <div key={item.id || idx} style={{
                                            background: colors.grayLight,
                                            padding: 12,
                                            borderRadius: 12,
                                            textAlign: "left"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, fontSize: 14, color: item.minutes === 40 ? colors.secondary : colors.primary }}>
                                                    {item.minutes} Dakika
                                                </span>
                                                <span style={{ fontSize: 12, color: colors.gray }}>
                                                    {formatHistoryTime(item.startedAt || item.createdAt)}
                                                    <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>
                                                        ({item.dateKey})
                                                    </span>
                                                </span>
                                            </div>
                                            {item.note && (
                                                <div style={{ fontSize: 13, color: colors.dark, marginTop: 4, display: "flex", alignItems: "flex-start", gap: 4 }}>
                                                    <span>📝</span> <span>{item.note}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
