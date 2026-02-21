import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { processGamification } from "./gamification";

const colors = {
    primary: "#6366f1",
    success: "#10b981",
    danger: "#ef4444",
    dark: "#1f2937",
    gray: "#6b7280",
    grayLight: "#f3f4f6",
    white: "#ffffff",
    cardShadow: "0 10px 40px rgba(0,0,0,0.05)"
};

const EXAM_TYPES = [
    { id: "tyt", label: "TYT Genel" },
    { id: "ayt", label: "AYT Genel" },
    { id: "ziraat", label: "Ziraat Genel" },
    { id: "branch", label: "Branş Denemesi" }
];

const SUBJECTS_YKS = [
    { id: "turkish", label: "Türkçe" },
    { id: "social", label: "Sosyal Bilimler" },
    { id: "math", label: "Matematik" },
    { id: "science", label: "Fen Bilimleri" }
];

const SUBJECTS_ZIRAAT = [
    { id: "alan", label: "Alan Bilgisi" },
    { id: "gygk", label: "GYGK" },
    { id: "ydil", label: "Yabancı Dil" }
];

const BRANCH_SUBJECTS_YKS = [
    { id: "tyt_turkish", label: "TYT Türkçe" },
    { id: "tyt_social", label: "TYT Sosyal Bilimler" },
    { id: "tyt_math", label: "TYT Matematik" },
    { id: "tyt_science", label: "TYT Fen Bilimleri" },
    { id: "ayt_math", label: "AYT Matematik" },
    { id: "ayt_physics", label: "AYT Fizik" },
    { id: "ayt_chemistry", label: "AYT Kimya" },
    { id: "ayt_biology", label: "AYT Biyoloji" },
    { id: "ayt_literature", label: "AYT Edebiyat" },
    { id: "ayt_history", label: "AYT Tarih" },
    { id: "ayt_geography", label: "AYT Coğrafya" }
];

const BRANCH_SUBJECTS_ZIRAAT = [
    { id: "ziraat_alan", label: "Alan Bilgisi" },
    { id: "ziraat_gygk", label: "Genel Yetenek Genel Kültür" },
    { id: "ziraat_ydil", label: "Yabancı Dil" }
];

const ALL_BRANCH_SUBJECTS = [...BRANCH_SUBJECTS_YKS, ...BRANCH_SUBJECTS_ZIRAAT];

export default function MockExams({ userType }) {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const defaultType = userType === "mufettislik" ? "ziraat" : "tyt";
    const [formType, setFormType] = useState(defaultType);
    const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
    const [branchSubject, setBranchSubject] = useState(userType === "mufettislik" ? "ziraat_alan" : "tyt_math");
    const [useOsymRule, setUseOsymRule] = useState(true); // 4 mistakes = 1 correct penalty
    const [scores, setScores] = useState({});

    useEffect(() => {
        fetchExams();
    }, [userType]);

    const fetchExams = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const q = query(
                collection(db, "mock_exams"),
                where("uid", "==", user.uid),
                orderBy("date", "desc")
            );
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExams(list);
        } catch (error) {
            console.error("Error fetching mock exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSubjectsForType = (type) => {
        if (type === "ziraat") return SUBJECTS_ZIRAAT;
        if (type === "tyt" || type === "ayt") return SUBJECTS_YKS;
        if (type === "branch") {
            const branchList = userType === "mufettislik" ? BRANCH_SUBJECTS_ZIRAAT : BRANCH_SUBJECTS_YKS;
            const selected = branchList.find(b => b.id === branchSubject);
            if (selected) return [selected];
            return [branchList[0]];
        }
        return [];
    };

    const handleScoreChange = (subjectId, field, value) => {
        const val = parseInt(value) || 0;
        setScores(prev => ({
            ...prev,
            [subjectId]: {
                ...prev[subjectId],
                [field]: val
            }
        }));
    };

    const calculateNet = (correct, wrong) => {
        if (useOsymRule) {
            return correct - (wrong / 4);
        }
        return correct;
    };

    const calculateTotalNet = () => {
        let total = 0;
        Object.values(scores).forEach(s => {
            const c = s.correct || 0;
            const w = s.wrong || 0;
            total += calculateNet(c, w);
        });
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        if (Object.keys(scores).length === 0) {
            alert("Lütfen en az bir dersin sonucunu girin.");
            return;
        }

        setSaving(true);
        try {
            // Process calculated nets
            const processedScores = {};
            let totalNet = 0;

            Object.keys(scores).forEach(subId => {
                const c = scores[subId].correct || 0;
                const w = scores[subId].wrong || 0;
                const n = calculateNet(c, w);
                processedScores[subId] = { correct: c, wrong: w, net: n };
                totalNet += n;
            });

            const newExam = {
                uid: user.uid,
                type: formType,
                date: formDate,
                dateKey: new Date(formDate).toLocaleDateString("tr-TR"),
                scores: processedScores,
                totalNet,
                useOsymRule,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "mock_exams"), newExam);

            // Award Gamification (+500 for general exams, +100 for branch)
            const isGeneral = formType === "tyt" || formType === "ayt" || formType === "ziraat";
            const xpToAdd = isGeneral ? 500 : 100;

            const res = await processGamification(user.uid, xpToAdd, { type: "mock_exam" });
            if (res && res.newBadgesUnlocked.length > 0) {
                const names = res.newBadgesUnlocked.map(b => `${b.icon} ${b.name}`).join(", ");
                alert(`🎉 TEBRİKLER! Deneme kaydedildi ve Yeni rozet(ler) kazandın: ${names}`);
            } else {
                alert("Deneme başarıyla kaydedildi! +" + xpToAdd + " XP");
            }

            // Reset form
            setScores({});
            setShowForm(false);
            fetchExams(); // Refresh list

        } catch (error) {
            console.error("Deneme eklenirken hata:", error);
            alert("Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const renderForm = () => {
        const activeSubjects = getSubjectsForType(formType);
        const totalNetPreview = calculateTotalNet();

        return (
            <div style={{ background: colors.white, padding: 32, borderRadius: 24, boxShadow: colors.cardShadow, marginBottom: 40, animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ margin: 0, color: colors.dark }}>Yeni Deneme Ekle</h2>
                    <button
                        onClick={() => setShowForm(false)}
                        style={{ background: "transparent", border: "none", fontSize: 16, color: colors.gray, cursor: "pointer" }}
                    >✕ İptal</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Sınav Türü</label>
                            <select
                                value={formType}
                                onChange={(e) => {
                                    setFormType(e.target.value);
                                    setScores({});
                                    if (e.target.value === "branch" && !branchSubject) {
                                        setBranchSubject(userType === "mufettislik" ? "ziraat_alan" : "tyt_math");
                                    }
                                }}
                                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${colors.grayLight}`, outline: "none" }}
                            >
                                {EXAM_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                        {formType === "branch" && (
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Ders</label>
                                <select
                                    value={branchSubject}
                                    onChange={(e) => { setBranchSubject(e.target.value); setScores({}); }}
                                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${colors.grayLight}`, outline: "none" }}
                                >
                                    {(userType === "mufettislik" ? BRANCH_SUBJECTS_ZIRAAT : BRANCH_SUBJECTS_YKS).map(b => (
                                        <option key={b.id} value={b.id}>{b.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Tarih</label>
                            <input
                                type="date"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                required
                                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${colors.grayLight}`, outline: "none" }}
                            />
                        </div>
                    </div>

                    <div style={{
                        background: colors.grayLight, padding: "16px 20px", borderRadius: 12, marginBottom: 24,
                        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: colors.dark }}>ÖSYM Formatı (4 Yanlış 1 Doğruyu Götürür)</div>
                            <div style={{ fontSize: 12, color: colors.gray }}>Kapalıysa net doğrudan doğru sayısına eşittir.</div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            <div style={{
                                width: 50, height: 26, background: useOsymRule ? colors.primary : "#d1d5db",
                                borderRadius: 20, position: "relative", transition: "all 0.3s"
                            }}>
                                <div style={{
                                    width: 20, height: 20, background: colors.white, borderRadius: "50%",
                                    position: "absolute", top: 3, left: useOsymRule ? 27 : 3, transition: "all 0.3s"
                                }} />
                            </div>
                            <input type="checkbox" checked={useOsymRule} onChange={(e) => setUseOsymRule(e.target.checked)} style={{ display: "none" }} />
                        </label>
                    </div>

                    {/* Subjects inputs */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 24 }}>
                        {activeSubjects.map(sub => {
                            const currentScores = scores[sub.id] || {};
                            const currentNet = calculateNet(currentScores.correct || 0, currentScores.wrong || 0);

                            return (
                                <div key={sub.id} style={{ border: `1px solid ${colors.grayLight}`, borderRadius: 16, padding: 16 }}>
                                    <div style={{ fontWeight: 600, color: colors.dark, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                                        {sub.label}
                                        <span style={{ color: colors.primary }}>{currentNet} Net</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <div>
                                            <label style={{ fontSize: 11, color: colors.gray }}>Doğru</label>
                                            <input
                                                type="number" min="0"
                                                value={currentScores.correct || ""}
                                                onChange={(e) => handleScoreChange(sub.id, "correct", e.target.value)}
                                                style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${colors.grayLight}`, textAlign: "center" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 11, color: colors.gray }}>Yanlış</label>
                                            <input
                                                type="number" min="0"
                                                value={currentScores.wrong || ""}
                                                onChange={(e) => handleScoreChange(sub.id, "wrong", e.target.value)}
                                                style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${colors.grayLight}`, textAlign: "center" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${colors.grayLight}`, paddingTop: 20 }}>
                        <div>
                            <div style={{ fontSize: 13, color: colors.gray }}>Yaklaşık Toplam</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: colors.primary }}>{totalNetPreview} Net</div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                background: colors.primary, color: colors.white, border: "none", padding: "14px 32px", borderRadius: 12,
                                fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? "Kaydediliyor..." : "Denemeyi Kaydet"}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0, color: colors.dark, fontSize: 32, fontWeight: 700 }}>📊 Denemelerim</h1>
                    <p style={{ margin: "8px 0 0", color: colors.gray }}>
                        Genel ve branş deneme sonuçlarını gir, net trendini takip et. Yapay zeka analizine yansısın.
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            background: colors.dark, color: colors.white, border: "none", padding: "12px 24px", borderRadius: 12,
                            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                        }}
                    >
                        <span>+</span> Yeni Deneme Ekle
                    </button>
                )}
            </div>

            {showForm && renderForm()}

            {/* List of Exams */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: colors.gray }}>Yükleniyor...</div>
            ) : exams.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, background: colors.white, borderRadius: 24, boxShadow: colors.cardShadow }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                    <h3 style={{ color: colors.dark, margin: "0 0 8px 0" }}>Henüz Deneme Eklemedin</h3>
                    <p style={{ color: colors.gray, margin: 0 }}>Hemen ilk netlerini girerek gelişimi takip etmeye başla.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {exams.map(exam => (
                        <div key={exam.id} style={{
                            background: colors.white, padding: 24, borderRadius: 20, boxShadow: colors.cardShadow,
                            display: "flex", alignItems: "center", flexWrap: "wrap", gap: 20
                        }}>
                            <div style={{ minWidth: 100 }}>
                                <div style={{ fontSize: 12, color: colors.gray, fontWeight: 600, textTransform: "uppercase" }}>
                                    {EXAM_TYPES.find(t => t.id === exam.type)?.label || exam.type}
                                </div>
                                <div style={{ fontSize: 13, color: colors.dark, marginTop: 4 }}>
                                    {new Date(exam.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>

                            <div style={{ flex: 1, display: "flex", gap: 16, flexWrap: "wrap" }}>
                                {Object.keys(exam.scores).map(subId => {
                                    const s = exam.scores[subId];
                                    const label = SUBJECTS_YKS.find(x => x.id === subId)?.label || SUBJECTS_ZIRAAT.find(x => x.id === subId)?.label || ALL_BRANCH_SUBJECTS.find(x => x.id === subId)?.label || "Branş";
                                    return (
                                        <div key={subId} style={{ background: colors.grayLight, padding: "8px 12px", borderRadius: 8 }}>
                                            <div style={{ fontSize: 11, color: colors.gray, marginBottom: 4 }}>{label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>
                                                {s.net} <span style={{ fontSize: 11, fontWeight: 400, color: colors.gray }}>({s.correct}D {s.wrong}Y)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ textAlign: "right", minWidth: 100 }}>
                                <div style={{ fontSize: 12, color: colors.gray }}>Toplam Net</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>{exam.totalNet}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
