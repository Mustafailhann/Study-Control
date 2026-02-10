import { useState, useEffect, useRef } from "react";
import { auth } from "./firebase";

const colors = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  white: "#ffffff",
  dark: "#1f2937",
  gray: "#6b7280",
  grayLight: "#f3f4f6",
};

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Merhaba! Ben senin AI sınav koçunum. Çalışma planın, zayıf konuların veya hedeflerin hakkında sormak istediğin bir şey var mı? 📚",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestReport, setLatestReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchLatestReport();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchLatestReport = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/.netlify/functions/get-latest-report", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.report) {
        setLatestReport(data.report);
      }
    } catch (e) {
      console.error("Report fetch error:", e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/.netlify/functions/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `❌ Hata: ${data.error || "Bir şeyler ters gitti"}`,
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: `❌ Bağlantı hatası: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 800,
          height: "90vh",
          background: colors.white,
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: colors.gradient,
            color: colors.white,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🤖</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                AI Sınav Koçu
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.9 }}>
                Gemini 1.5 Flash ile desteklenmektedir
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {latestReport && (
              <button
                onClick={() => setShowReport(!showReport)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: colors.white,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                📊 {showReport ? "Sohbet" : "Günlük Analiz"}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                color: colors.white,
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {showReport && latestReport ? (
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            <ReportView report={latestReport} />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: 24,
                background: colors.grayLight,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: 16,
                      background:
                        msg.role === "user" ? colors.primary : colors.white,
                      color: msg.role === "user" ? colors.white : colors.dark,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: colors.white,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <span style={{ fontSize: 14, color: colors.gray }}>
                      AI düşünüyor...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: 16,
                borderTop: `1px solid ${colors.grayLight}`,
                background: colors.white,
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajını yaz... (Enter = gönder)"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    border: `2px solid ${colors.grayLight}`,
                    fontSize: 14,
                    resize: "none",
                    fontFamily: "inherit",
                    minHeight: 48,
                    maxHeight: 120,
                  }}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    background: colors.primary,
                    color: colors.white,
                    border: "none",
                    borderRadius: 12,
                    padding: "0 24px",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    fontSize: 16,
                    fontWeight: 600,
                    opacity: loading || !input.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? "⏳" : "➤"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReportView({ report }) {
  const r = report.report;
  if (!r) return <div>Rapor yükleniyor...</div>;

  if (r.parseError) {
    return (
      <div>
        <h3>❌ Rapor ayrıştırma hatası</h3>
        <pre style={{ fontSize: 12, overflow: "auto" }}>{r.raw}</pre>
      </div>
    );
  }

  return (
    <div style={{ color: colors.dark }}>
      <h2 style={{ marginBottom: 8, color: colors.primary }}>
        {r.headline || "Günlük Analiz"}
      </h2>
      <p style={{ fontSize: 12, color: colors.gray, marginBottom: 24 }}>
        📅 {report.dateKey} • Model: {report.model}
      </p>

      {r.todaySummary && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>📊 Bugünün Özeti</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{r.todaySummary}</p>
        </section>
      )}

      {r.insights && r.insights.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>💡 İçgörüler</h3>
          {r.insights.map((insight, i) => (
            <div
              key={i}
              style={{
                padding: 16,
                background: colors.grayLight,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {insight.title}
              </h4>
              <p style={{ fontSize: 13, marginBottom: 4 }}>{insight.detail}</p>
              <p style={{ fontSize: 11, color: colors.gray }}>
                📈 {insight.metric}
              </p>
            </div>
          ))}
        </section>
      )}

      {r.tomorrowPlan && r.tomorrowPlan.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>🎯 Yarın İçin Plan</h3>
          {r.tomorrowPlan.map((plan, i) => (
            <div
              key={i}
              style={{
                padding: 16,
                background: "#e0f2fe",
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {plan.task}
              </h4>
              <p style={{ fontSize: 13, marginBottom: 4 }}>💭 {plan.why}</p>
              <p style={{ fontSize: 13, fontWeight: 600 }}>🎯 {plan.target}</p>
            </div>
          ))}
        </section>
      )}

      {r.next7Days && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>📅 Gelecek 7 Gün</h3>
          <p style={{ fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
            🎯 Odak: {r.next7Days.focus}
          </p>
          {r.next7Days.dailyTargets?.map((day, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                background: colors.grayLight,
                borderRadius: 8,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <strong>{day.day}:</strong> {day.subjects?.join(", ")} •{" "}
              {day.target}
            </div>
          ))}
        </section>
      )}

      {r.weakAreas && r.weakAreas.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>⚠️ Zayıf Alanlar</h3>
          {r.weakAreas.map((area, i) => (
            <div
              key={i}
              style={{
                padding: 16,
                background: "#fef2f2",
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <h4 style={{ fontSize: 14, fontWeight: 600 }}>
                {area.subject} - {area.topic}
              </h4>
              <p style={{ fontSize: 13, marginBottom: 4 }}>📉 {area.reason}</p>
              <p style={{ fontSize: 13, fontWeight: 600 }}>✅ {area.action}</p>
            </div>
          ))}
        </section>
      )}

      {r.motivation && (
        <section
          style={{
            padding: 20,
            background: colors.gradient,
            color: colors.white,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>💪 Motivasyon</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{r.motivation}</p>
        </section>
      )}

      {r.questions && r.questions.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>❓ Sorular</h3>
          <ul style={{ paddingLeft: 20 }}>
            {r.questions.map((q, i) => (
              <li key={i} style={{ fontSize: 13, marginBottom: 8 }}>
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.confidence && (
        <div
          style={{
            padding: 16,
            background: colors.grayLight,
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          <strong>Güven Seviyesi:</strong>{" "}
          {r.confidence.level === "high"
            ? "🟢 Yüksek"
            : r.confidence.level === "medium"
            ? "🟡 Orta"
            : "🔴 Düşük"}
          <br />
          {r.confidence.notes}
        </div>
      )}
    </div>
  );
}
