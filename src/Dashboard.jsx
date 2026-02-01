import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc, query, where } from "firebase/firestore";
import { db, auth } from "./firebase";

// Modern renk paleti
const colors = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  primaryDark: "#4f46e5",
  success: "#10b981",
  successLight: "#d1fae5",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  gray: "#6b7280",
  grayLight: "#f3f4f6",
  dark: "#1f2937",
  white: "#ffffff",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  cardShadow: "0 10px 40px rgba(0,0,0,0.1)",
  glassBackground: "rgba(255, 255, 255, 0.95)"
};

export default function Dashboard({ filter = "all" }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("");
  const [showAddLog, setShowAddLog] = useState({}); // { "subjectId_topicIndex": true }
  const [newLog, setNewLog] = useState({});
  const [partnerStats, setPartnerStats] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  // Partner tanımları - farklı yazım biçimlerini destekle
  const PARTNERS = {
    songul: { name: "Mustafa", type: "mufettislik", exam: "ziraat" },
    songül: { name: "Mustafa", type: "mufettislik", exam: "ziraat" },
    "songül": { name: "Mustafa", type: "mufettislik", exam: "ziraat" },
    mustafa: { name: "Songül", type: "yks", exam: "yks" }
  };

  // Partner bul (farklı yazım biçimleri için)
  const findPartner = (username) => {
    const normalized = username.toLowerCase()
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ç/g, 'c');
    
    if (normalized.includes('songul') || normalized.includes('songül')) {
      return { name: "Mustafa", type: "mufettislik", exam: "ziraat" };
    }
    if (normalized.includes('mustafa')) {
      return { name: "Songül", type: "yks", exam: "yks" };
    }
    return null;
  };

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserType(userData.userType);
        setUserName(userData.username);
        
        const examType = userData.userType === "mufettislik" ? "ziraat" : "yks";
        
        const q = query(
          collection(db, "subjects"),
          where("exam", "==", examType)
        );
        
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          topicDetails: d.data().topicDetails || {}
        }));
        setSubjects(list);

        // Partner verilerini çek
        await fetchPartnerStats(userData.username);
      }
      
      setLoading(false);
    }

    fetchData();
  }, []);

  // Partner istatistiklerini çek
  const fetchPartnerStats = async (currentUsername) => {
    const partner = findPartner(currentUsername);
    if (!partner) {
      console.log("Partner bulunamadı:", currentUsername);
      return;
    }

    console.log("Partner bulundu:", partner);

    const q = query(
      collection(db, "subjects"),
      where("exam", "==", partner.exam)
    );

    const snap = await getDocs(q);
    const partnerSubjects = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      topicDetails: d.data().topicDetails || {}
    }));

    // Tüm logları topla
    const allLogs = [];
    let totalTopics = 0;
    let completedTopics = 0;

    partnerSubjects.forEach(s => {
      if (Array.isArray(s.topics)) {
        totalTopics += s.topics.length;
        s.topics.forEach((topicName, i) => {
          const details = s.topicDetails[i] || {};
          if (details.completed) completedTopics++;
          
          const logs = details.logs || [];
          logs.forEach(log => {
            allLogs.push({
              ...log,
              subjectName: s.name,
              topicName
            });
          });
        });
      }
    });

    // Tarih bazlı filtreleme
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const calculatePeriodStats = (logs, startDate) => {
      const filtered = logs.filter(log => new Date(log.date) >= startDate);
      return filtered.reduce((acc, log) => ({
        solved: acc.solved + (log.solved || 0),
        correct: acc.correct + (log.correct || 0),
        wrong: acc.wrong + (log.wrong || 0),
        sessions: acc.sessions + 1
      }), { solved: 0, correct: 0, wrong: 0, sessions: 0 });
    };

    setPartnerStats({
      name: partner.name,
      type: partner.type === "mufettislik" ? "Müfettişlik" : "YKS",
      totalTopics,
      completedTopics,
      today: calculatePeriodStats(allLogs, todayStart),
      week: calculatePeriodStats(allLogs, weekStart),
      month: calculatePeriodStats(allLogs, monthStart),
      recentLogs: allLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
    });
  };

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateTopic = async (subjectId, topicIndex, field, value) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const topicDetails = { ...subject.topicDetails };
    topicDetails[topicIndex] = {
      ...topicDetails[topicIndex],
      [field]: value
    };

    await updateDoc(doc(db, "subjects", subjectId), { topicDetails });

    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId ? { ...s, topicDetails } : s
      )
    );
  };

  // Çalışma kaydı ekle
  const addStudyLog = async (subjectId, topicIndex) => {
    const key = `${subjectId}_${topicIndex}`;
    const logData = newLog[key];
    
    if (!logData || (!logData.solved && !logData.correct && !logData.wrong)) {
      alert("Lütfen en az bir değer girin!");
      return;
    }

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const topicDetails = { ...subject.topicDetails };
    const currentDetails = topicDetails[topicIndex] || {};
    const logs = currentDetails.logs || [];

    // Yeni log ekle
    const newLogEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      solved: parseInt(logData.solved || 0),
      correct: parseInt(logData.correct || 0),
      wrong: parseInt(logData.wrong || 0),
      book: logData.book || ""
    };

    logs.push(newLogEntry);

    topicDetails[topicIndex] = {
      ...currentDetails,
      logs
    };

    await updateDoc(doc(db, "subjects", subjectId), { topicDetails });

    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId ? { ...s, topicDetails } : s
      )
    );

    // Formu temizle ve kapat
    setNewLog(prev => ({ ...prev, [key]: {} }));
    setShowAddLog(prev => ({ ...prev, [key]: false }));
  };

  // Çalışma kaydı sil
  const deleteStudyLog = async (subjectId, topicIndex, logId) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const topicDetails = { ...subject.topicDetails };
    const currentDetails = topicDetails[topicIndex] || {};
    const logs = (currentDetails.logs || []).filter(log => log.id !== logId);

    topicDetails[topicIndex] = {
      ...currentDetails,
      logs
    };

    await updateDoc(doc(db, "subjects", subjectId), { topicDetails });

    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId ? { ...s, topicDetails } : s
      )
    );
  };

  // Konu için toplam istatistikleri hesapla
  const getTopicStats = (details) => {
    const logs = details.logs || [];
    return logs.reduce((acc, log) => ({
      totalSolved: acc.totalSolved + (log.solved || 0),
      totalCorrect: acc.totalCorrect + (log.correct || 0),
      totalWrong: acc.totalWrong + (log.wrong || 0)
    }), { totalSolved: 0, totalCorrect: 0, totalWrong: 0 });
  };

  // Genel istatistikleri hesapla
  const calculateStats = () => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalSolved = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    subjects.forEach(s => {
      if (Array.isArray(s.topics)) {
        totalTopics += s.topics.length;
        s.topics.forEach((_, i) => {
          const details = s.topicDetails[i] || {};
          if (details.completed) completedTopics++;
          
          const topicStats = getTopicStats(details);
          totalSolved += topicStats.totalSolved;
          totalCorrect += topicStats.totalCorrect;
          totalWrong += topicStats.totalWrong;
        });
      }
    });

    return { totalTopics, completedTopics, totalSolved, totalCorrect, totalWrong };
  };

  const stats = calculateStats();
  const progressPercent = stats.totalTopics > 0 ? Math.round((stats.completedTopics / stats.totalTopics) * 100) : 0;
  const successRate = stats.totalSolved > 0 ? Math.round((stats.totalCorrect / stats.totalSolved) * 100) : 0;

  // Tarih formatlama
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: colors.grayLight
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: `4px solid ${colors.grayLight}`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Filtreye göre konuları filtrele
  const getFilteredSubjects = () => {
    if (filter === "all") return subjects;
    
    return subjects.map(s => {
      const filteredTopics = s.topics.filter((_, i) => {
        const details = s.topicDetails[i] || {};
        if (filter === "completed") return details.completed === true;
        if (filter === "shouldStudy") return details.shouldStudy === true;
        return true;
      });
      
      return { ...s, filteredTopics };
    }).filter(s => s.filteredTopics.length > 0);
  };

  const filteredSubjects = getFilteredSubjects();

  const filterTitle = filter === "completed" 
    ? "Tamamlananlar" 
    : filter === "shouldStudy" 
      ? "Çalışılması Gerekenler" 
      : "Tüm Konular";

  const categoryTitle = userType === "mufettislik" 
    ? "Müfettişlik" 
    : "YKS";

  return (
    <div style={{ 
      minHeight: "100vh",
      background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
      padding: "24px"
    }}>
      {/* Header */}
      <div style={{
        background: colors.gradient,
        borderRadius: 20,
        padding: "32px",
        marginBottom: 24,
        color: colors.white,
        boxShadow: colors.cardShadow
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              Merhaba, {userName}! 👋
            </h1>
            <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 16 }}>
              {categoryTitle} • {filterTitle}
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            padding: "12px 24px",
            borderRadius: 12,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{progressPercent}%</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Tamamlandı</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            height: 8,
            background: "rgba(255,255,255,0.3)",
            borderRadius: 4,
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: colors.white,
              borderRadius: 4,
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", 
          gap: 12, 
          marginTop: 24 
        }}>
          {[
            { label: "Toplam Konu", value: stats.totalTopics, icon: "📚" },
            { label: "Tamamlanan", value: stats.completedTopics, icon: "✅" },
            { label: "Çözülen Soru", value: stats.totalSolved, icon: "📝" },
            { label: "Doğru", value: stats.totalCorrect, icon: "✓" },
            { label: "Yanlış", value: stats.totalWrong, icon: "✗" },
            { label: "Başarı", value: `%${successRate}`, icon: "🎯" }
          ].map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              padding: "14px 10px",
              borderRadius: 12,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 20 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Stats Card */}
      {partnerStats && (
        <div 
          onClick={() => setShowPartnerModal(true)}
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 24,
            color: colors.white,
            boxShadow: colors.cardShadow,
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = colors.cardShadow;
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>
                👀 Partner Takibi
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {partnerStats.name} ({partnerStats.type})
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                📊 {partnerStats.completedTopics}/{partnerStats.totalTopics} konu tamamlandı
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ 
                background: "rgba(255,255,255,0.2)", 
                padding: "12px 16px", 
                borderRadius: 12,
                textAlign: "center",
                minWidth: 80
              }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Bugün</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{partnerStats.today.solved}</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>soru</div>
              </div>
              <div style={{ 
                background: "rgba(255,255,255,0.2)", 
                padding: "12px 16px", 
                borderRadius: 12,
                textAlign: "center",
                minWidth: 80
              }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Bu Hafta</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{partnerStats.week.solved}</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>soru</div>
              </div>
              <div style={{ 
                background: "rgba(255,255,255,0.2)", 
                padding: "12px 16px", 
                borderRadius: 12,
                textAlign: "center",
                minWidth: 80
              }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Bu Ay</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{partnerStats.month.solved}</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>soru</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            👆 Detayları görmek için tıkla
          </div>
        </div>
      )}

      {/* Partner Detail Modal */}
      {showPartnerModal && partnerStats && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => setShowPartnerModal(false)}
        >
          <div 
            style={{
              background: colors.white,
              borderRadius: 20,
              padding: 32,
              maxWidth: 600,
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 25px 80px rgba(0,0,0,0.3)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, color: colors.dark }}>
                  👤 {partnerStats.name}
                </h2>
                <p style={{ margin: "4px 0 0", color: colors.gray }}>
                  {partnerStats.type} Çalışmaları
                </p>
              </div>
              <button
                onClick={() => setShowPartnerModal(false)}
                style={{
                  background: colors.grayLight,
                  border: "none",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 18
                }}
              >
                ✕
              </button>
            </div>

            {/* Period Stats */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: 12,
              marginBottom: 24
            }}>
              {[
                { label: "Bugün", data: partnerStats.today, color: "#10b981" },
                { label: "Son 7 Gün", data: partnerStats.week, color: "#6366f1" },
                { label: "Son 30 Gün", data: partnerStats.month, color: "#f59e0b" }
              ].map((period, i) => (
                <div 
                  key={i}
                  style={{
                    background: colors.grayLight,
                    borderRadius: 12,
                    padding: 16,
                    borderTop: `4px solid ${period.color}`
                  }}
                >
                  <div style={{ fontSize: 12, color: colors.gray, fontWeight: 600, marginBottom: 8 }}>
                    {period.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: colors.dark }}>
                    {period.data.solved}
                  </div>
                  <div style={{ fontSize: 12, color: colors.gray }}>soru çözüldü</div>
                  <div style={{ 
                    display: "flex", 
                    gap: 12, 
                    marginTop: 8,
                    fontSize: 12
                  }}>
                    <span style={{ color: colors.success }}>✓ {period.data.correct}</span>
                    <span style={{ color: colors.danger }}>✗ {period.data.wrong}</span>
                  </div>
                  <div style={{ fontSize: 11, color: colors.gray, marginTop: 4 }}>
                    {period.data.sessions} çalışma seansı
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ 
              background: colors.grayLight, 
              borderRadius: 12, 
              padding: 16,
              marginBottom: 24
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: colors.dark }}>Konu İlerlemesi</span>
                <span style={{ color: colors.primary, fontWeight: 600 }}>
                  {Math.round((partnerStats.completedTopics / partnerStats.totalTopics) * 100)}%
                </span>
              </div>
              <div style={{
                height: 10,
                background: "#e5e7eb",
                borderRadius: 5,
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${(partnerStats.completedTopics / partnerStats.totalTopics) * 100}%`,
                  background: colors.gradient,
                  borderRadius: 5
                }} />
              </div>
              <div style={{ fontSize: 12, color: colors.gray, marginTop: 8 }}>
                {partnerStats.completedTopics} / {partnerStats.totalTopics} konu tamamlandı
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: colors.dark, 
                marginBottom: 12 
              }}>
                📜 Son Aktiviteler
              </div>
              {partnerStats.recentLogs.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: 24, 
                  color: colors.gray,
                  background: colors.grayLight,
                  borderRadius: 12
                }}>
                  Henüz çalışma kaydı yok
                </div>
              ) : (
                <div style={{ 
                  maxHeight: 250, 
                  overflow: "auto",
                  background: colors.grayLight,
                  borderRadius: 12,
                  padding: 8
                }}>
                  {partnerStats.recentLogs.map((log, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: colors.white,
                        borderRadius: 8,
                        marginBottom: idx < partnerStats.recentLogs.length - 1 ? 6 : 0,
                        fontSize: 13
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: colors.dark }}>
                          {log.subjectName}
                        </div>
                        <div style={{ fontSize: 11, color: colors.gray }}>
                          {log.topicName}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
                          <span>📝 {log.solved}</span>
                          <span style={{ color: colors.success }}>✓ {log.correct}</span>
                          <span style={{ color: colors.danger }}>✗ {log.wrong}</span>
                        </div>
                        <div style={{ fontSize: 10, color: colors.gray, marginTop: 2 }}>
                          {formatDate(log.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSubjects.length === 0 && (
        <div style={{ 
          padding: 60, 
          textAlign: "center", 
          background: colors.glassBackground,
          borderRadius: 20,
          boxShadow: colors.cardShadow
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {filter === "completed" ? "🎯" : "📖"}
          </div>
          <h3 style={{ margin: 0, color: colors.dark }}>
            {filter === "completed" ? "Henüz tamamlanmış konu yok" : "Çalışılması gereken konu yok"}
          </h3>
          <p style={{ color: colors.gray, marginTop: 8 }}>
            Konuları işaretlemeye başla!
          </p>
        </div>
      )}

      {/* Subjects Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: 20,
        alignItems: "start"
      }}>
        {filteredSubjects.map(s => {
          const subjectStats = {
            total: s.topics?.length || 0,
            completed: 0,
            solved: 0,
            correct: 0
          };
          
          s.topics?.forEach((_, i) => {
            const d = s.topicDetails[i] || {};
            if (d.completed) subjectStats.completed++;
            const ts = getTopicStats(d);
            subjectStats.solved += ts.totalSolved;
            subjectStats.correct += ts.totalCorrect;
          });

          const subjectProgress = subjectStats.total > 0 
            ? Math.round((subjectStats.completed / subjectStats.total) * 100) 
            : 0;

          return (
            <div
              key={s.id}
              style={{
                background: colors.glassBackground,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: colors.cardShadow,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {/* Subject Header */}
              <div
                onClick={() => toggle(s.id)}
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  background: expanded[s.id] ? colors.gradient : colors.white,
                  color: expanded[s.id] ? colors.white : colors.dark,
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      opacity: 0.7,
                      marginBottom: 4
                    }}>
                      {s.exam?.toUpperCase()} • {s.level?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{s.name}</div>
                  </div>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: expanded[s.id] ? "rgba(255,255,255,0.2)" : colors.grayLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    transition: "transform 0.3s ease",
                    transform: expanded[s.id] ? "rotate(180deg)" : "rotate(0)"
                  }}>
                    ▼
                  </div>
                </div>

                {/* Mini Progress */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span>{subjectStats.completed}/{subjectStats.total} konu</span>
                    <span>{subjectProgress}%</span>
                  </div>
                  <div style={{
                    height: 6,
                    background: expanded[s.id] ? "rgba(255,255,255,0.3)" : colors.grayLight,
                    borderRadius: 3,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${subjectProgress}%`,
                      background: expanded[s.id] ? colors.white : colors.primary,
                      borderRadius: 3,
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>

                {/* Quick Stats */}
                <div style={{ 
                  display: "flex", 
                  gap: 16, 
                  marginTop: 12,
                  fontSize: 12
                }}>
                  <span>📝 {subjectStats.solved} soru</span>
                  <span>✓ {subjectStats.correct} doğru</span>
                </div>
              </div>

              {/* Topics Content */}
              {expanded[s.id] && (
                <div style={{ padding: "16px", background: "#fafbfc" }}>
                  {Array.isArray(s.topics) && s.topics.map((topic, i) => {
                    const details = s.topicDetails[i] || {};
                    const topicStats = getTopicStats(details);
                    const logs = details.logs || [];
                    const key = `${s.id}_${i}`;
                    
                    if (filter === "completed" && !details.completed) return null;
                    if (filter === "shouldStudy" && !details.shouldStudy) return null;

                    const netScore = (topicStats.totalCorrect - (topicStats.totalWrong * 0.25)).toFixed(1);

                    return (
                      <div
                        key={i}
                        style={{
                          marginBottom: 16,
                          padding: 16,
                          borderRadius: 12,
                          background: colors.white,
                          border: details.completed 
                            ? `2px solid ${colors.success}` 
                            : details.shouldStudy 
                              ? `2px solid ${colors.warning}` 
                              : "1px solid #e5e7eb",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                        }}
                      >
                        {/* Topic Header */}
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          marginBottom: 12
                        }}>
                          <div style={{ 
                            fontWeight: 600, 
                            fontSize: 15,
                            color: colors.dark,
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}>
                            {details.completed && <span style={{ color: colors.success }}>✓</span>}
                            {topic}
                          </div>
                        </div>

                        {/* Checkboxes & Stats Summary */}
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                          flexWrap: "wrap",
                          gap: 8
                        }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <label style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 6,
                              cursor: "pointer",
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: details.completed ? colors.successLight : colors.grayLight,
                              fontSize: 12,
                              fontWeight: 500,
                            }}>
                              <input
                                type="checkbox"
                                checked={!!details.completed}
                                onChange={e => updateTopic(s.id, i, "completed", e.target.checked)}
                                style={{ accentColor: colors.success }}
                              />
                              Tamamlandı
                            </label>

                            <label style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 6,
                              cursor: "pointer",
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: details.shouldStudy ? colors.warningLight : colors.grayLight,
                              fontSize: 12,
                              fontWeight: 500,
                            }}>
                              <input
                                type="checkbox"
                                checked={!!details.shouldStudy}
                                onChange={e => updateTopic(s.id, i, "shouldStudy", e.target.checked)}
                                style={{ accentColor: colors.warning }}
                              />
                              Tekrar Et
                            </label>
                          </div>

                          {/* Summary Stats */}
                          {topicStats.totalSolved > 0 && (
                            <div style={{ 
                              display: "flex", 
                              gap: 12, 
                              fontSize: 12,
                              color: colors.gray 
                            }}>
                              <span>📝 {topicStats.totalSolved}</span>
                              <span style={{ color: colors.success }}>✓ {topicStats.totalCorrect}</span>
                              <span style={{ color: colors.danger }}>✗ {topicStats.totalWrong}</span>
                              <span style={{ 
                                background: colors.primaryLight,
                                color: colors.white,
                                padding: "2px 8px",
                                borderRadius: 10,
                                fontWeight: 600
                              }}>
                                Net: {netScore}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Study Logs */}
                        {logs.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ 
                              fontSize: 12, 
                              fontWeight: 600, 
                              color: colors.gray,
                              marginBottom: 8 
                            }}>
                              📊 Çalışma Geçmişi ({logs.length} kayıt)
                            </div>
                            <div style={{ 
                              maxHeight: 200, 
                              overflowY: "auto",
                              background: colors.grayLight,
                              borderRadius: 8,
                              padding: 8
                            }}>
                              {logs.slice().reverse().map((log, idx) => (
                                <div 
                                  key={log.id} 
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    background: colors.white,
                                    borderRadius: 6,
                                    marginBottom: idx < logs.length - 1 ? 6 : 0,
                                    fontSize: 12
                                  }}
                                >
                                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    <span style={{ color: colors.gray, minWidth: 90 }}>
                                      {formatDate(log.date)}
                                    </span>
                                    <span>📝 {log.solved}</span>
                                    <span style={{ color: colors.success }}>✓ {log.correct}</span>
                                    <span style={{ color: colors.danger }}>✗ {log.wrong}</span>
                                    {log.book && (
                                      <span style={{ color: colors.primary }}>📖 {log.book}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteStudyLog(s.id, i, log.id)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: colors.danger,
                                      cursor: "pointer",
                                      padding: 4,
                                      fontSize: 14,
                                      opacity: 0.6
                                    }}
                                    onMouseEnter={e => e.target.style.opacity = 1}
                                    onMouseLeave={e => e.target.style.opacity = 0.6}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add New Log Button/Form */}
                        {!showAddLog[key] ? (
                          <button
                            onClick={() => setShowAddLog(prev => ({ ...prev, [key]: true }))}
                            style={{
                              width: "100%",
                              padding: "12px",
                              background: colors.gradient,
                              color: colors.white,
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            onMouseEnter={e => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                            }}
                            onMouseLeave={e => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "none";
                            }}
                          >
                            ➕ Çalışma Kaydı Ekle
                          </button>
                        ) : (
                          <div style={{
                            background: colors.grayLight,
                            borderRadius: 10,
                            padding: 16
                          }}>
                            <div style={{ 
                              fontSize: 13, 
                              fontWeight: 600, 
                              marginBottom: 12,
                              color: colors.dark 
                            }}>
                              ✏️ Yeni Çalışma Kaydı
                            </div>
                            
                            {/* Input Row */}
                            <div style={{ 
                              display: "grid", 
                              gridTemplateColumns: "repeat(3, 1fr)", 
                              gap: 8,
                              marginBottom: 10
                            }}>
                              <div>
                                <label style={{ fontSize: 10, color: colors.gray, display: "block", marginBottom: 4 }}>
                                  Çözülen Soru
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={newLog[key]?.solved || ""}
                                  onChange={e => setNewLog(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], solved: e.target.value }
                                  }))}
                                  style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: 6,
                                    border: "1px solid #e5e7eb",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    boxSizing: "border-box"
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 10, color: colors.success, display: "block", marginBottom: 4 }}>
                                  Doğru
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={newLog[key]?.correct || ""}
                                  onChange={e => setNewLog(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], correct: e.target.value }
                                  }))}
                                  style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: 6,
                                    border: `1px solid ${colors.successLight}`,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    background: "#f0fdf4",
                                    boxSizing: "border-box"
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 10, color: colors.danger, display: "block", marginBottom: 4 }}>
                                  Yanlış
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={newLog[key]?.wrong || ""}
                                  onChange={e => setNewLog(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], wrong: e.target.value }
                                  }))}
                                  style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: 6,
                                    border: `1px solid ${colors.dangerLight}`,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    background: "#fef2f2",
                                    boxSizing: "border-box"
                                  }}
                                />
                              </div>
                            </div>

                            {/* Book Input */}
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ fontSize: 10, color: colors.gray, display: "block", marginBottom: 4 }}>
                                📖 Kaynak / Kitap (opsiyonel)
                              </label>
                              <input
                                type="text"
                                placeholder="Örn: 345 Yayınları, TYT Matematik"
                                value={newLog[key]?.book || ""}
                                onChange={e => setNewLog(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key], book: e.target.value }
                                }))}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: 6,
                                  border: "1px solid #e5e7eb",
                                  fontSize: 13,
                                  boxSizing: "border-box"
                                }}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => addStudyLog(s.id, i)}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: colors.success,
                                  color: colors.white,
                                  border: "none",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: 13
                                }}
                              >
                                ✓ Kaydet
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddLog(prev => ({ ...prev, [key]: false }));
                                  setNewLog(prev => ({ ...prev, [key]: {} }));
                                }}
                                style={{
                                  padding: "10px 16px",
                                  background: colors.grayLight,
                                  color: colors.gray,
                                  border: "none",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: 13
                                }}
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div style={{ marginTop: 12 }}>
                          <label style={{ fontSize: 11, color: colors.gray, fontWeight: 500, display: "block", marginBottom: 4 }}>
                            📝 Notlar
                          </label>
                          <textarea
                            placeholder="Bu konu hakkında notların..."
                            value={details.note || ""}
                            onChange={e => updateTopic(s.id, i, "note", e.target.value)}
                            rows={2}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: 8,
                              border: "1px solid #e5e7eb",
                              fontSize: 13,
                              outline: "none",
                              resize: "vertical",
                              fontFamily: "inherit",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
