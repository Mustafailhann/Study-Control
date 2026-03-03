import { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import ReactMarkdown from "react-markdown";

const colors = {
    primary: "#6366f1",
    primaryLight: "#818cf8",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    white: "#ffffff",
    dark: "#1f2937",
    gray: "#6b7280",
    grayLight: "#f3f4f6",
    danger: "#ef4444",
    success: "#10b981",
};

export default function MistakeBook() {
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [note, setNote] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    useEffect(() => {
        fetchMistakes();
    }, []);

    const fetchMistakes = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const q = query(
                collection(db, "mistakes"),
                where("uid", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const snap = await getDocs(q);
            const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMistakes(fetched);
        } catch (error) {
            console.error("Hata çekme başarısız:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview immediately before compression
        setPreviewUrl(URL.createObjectURL(file));

        const options = {
            maxSizeMB: 1, // Sıkıştırma sonrası hedeflenen max boyut
            maxWidthOrHeight: 1920, // Çözünürlük sınırı koruyarak kaliteyi yüksek tutar
            useWebWorker: true
        };

        try {
            setUploadProgress("Görsel optimize ediliyor...");
            const compressedFile = await imageCompression(file, options);
            setSelectedFile(compressedFile);
            setUploadProgress("");
        } catch (error) {
            console.error("Sıkıştırma hatası:", error);
            alert("Görsel sıkıştırılamadı.");
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress("Yapay zeka analiz ediyor... Lütfen bekleyin.");

        try {
            const user = auth.currentUser;
            const base64Image = await fileToBase64(selectedFile);

            // 1. Backend'den Çözüm Al
            const token = await user.getIdToken();
            const res = await fetch("/.netlify/functions/solve-question", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ imageBase64: base64Image, note })
            });

            const aiResponse = await res.json();

            if (!res.ok || !aiResponse.ok) {
                throw new Error(aiResponse.error || "Soru çözülemedi.");
            }

            setUploadProgress("Buluta kaydediliyor...");

            // 2. Görseli Firebase Storage'a yükle (arşiv için)
            const filename = selectedFile.name || "image.jpg";
            const storageRef = ref(storage, `mistakes/${user.uid}/${Date.now()}_${filename}`);

            console.log("Storage yüklemesi başlıyor...");
            const uploadTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Storage yüklemesi zaman aşımına uğradı. Bağlantıyı veya Firebase yapılandırmasını kontrol edin.")), 15000));
            await Promise.race([
                uploadString(storageRef, base64Image, "data_url"),
                uploadTimeout
            ]);

            console.log("Storage yüklemesi başarılı. URL alınıyor...");
            const imageUrl = await getDownloadURL(storageRef);

            // 3. Firestore'a kaydet
            console.log("Firestore kaydı başlıyor...");
            const newMistake = {
                uid: user.uid,
                imageUrl,
                note,
                solution: aiResponse.solution,
                createdAt: new Date().toISOString()
            };

            const firestoreTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore kaydı zaman aşımına uğradı.")), 15000));
            await Promise.race([
                addDoc(collection(db, "mistakes"), newMistake),
                firestoreTimeout
            ]);
            console.log("Firestore kaydı başarılı.");

            // Reset and refresh
            setShowModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            setNote("");
            fetchMistakes();

        } catch (error) {
            console.error("Yükleme işlemi başarısız:", error);
            alert("İşlem başarısız: " + error.message);
        } finally {
            setIsUploading(false);
            setUploadProgress("");
        }
    };

    return (
        <div style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ margin: 0, color: colors.dark, fontSize: 28, fontWeight: 700 }}>
                        📸 Yanlış Defterim
                    </h1>
                    <p style={{ margin: "8px 0 0", color: colors.gray }}>
                        Yapamadığın soruları biriktir, YZ koçunun adımlı çözümleriyle öğren.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: colors.primary,
                        color: colors.white,
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                        transition: "all 0.2s ease"
                    }}
                >
                    <span>➕</span> Yeni Soru Ekle
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: colors.gray }}>Yükleniyor...</div>
            ) : mistakes.length === 0 ? (
                <div style={{ textAlign: "center", padding: 80, background: colors.white, borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>📓</div>
                    <h3 style={{ margin: 0, color: colors.dark, marginBottom: 8 }}>Henüz kaydettiğin bir soru yok</h3>
                    <p style={{ color: colors.gray, margin: 0 }}>Yapamadığın bir sorunun fotoğrafını çekerek başlayabilirsin.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                    {mistakes.map((mistake) => (
                        <div key={mistake.id} style={{
                            background: colors.white,
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <div style={{ height: 200, background: colors.grayLight, position: "relative" }}>
                                <img
                                    src={mistake.imageUrl}
                                    alt="Soru"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                            <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                                {mistake.note && (
                                    <p style={{ margin: "0 0 12px", fontSize: 13, background: "#fef3c7", padding: "8px 12px", borderRadius: 8, color: "#92400e" }}>
                                        <strong>Senin Notun:</strong> {mistake.note}
                                    </p>
                                )}
                                <div style={{ flex: 1, fontSize: 14, color: colors.dark, maxHeight: 150, overflowY: "auto", paddingRight: 8 }}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p style={{ margin: "0 0 8px" }} {...props} />,
                                            ul: ({ node, ...props }) => <ul style={{ paddingLeft: 20, margin: "0 0 8px" }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: 4 }} {...props} />
                                        }}
                                    >
                                        {mistake.solution.substring(0, 300) + (mistake.solution.length > 300 ? "..." : "")}
                                    </ReactMarkdown>
                                </div>
                                <div style={{ marginTop: 16, borderTop: `1px solid ${colors.grayLight}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 12, color: colors.gray }}>
                                        {new Date(mistake.createdAt).toLocaleDateString("tr-TR")}
                                    </span>
                                    <button style={{ color: colors.primary, background: "none", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                                        Tamamını Oku
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal - Yeni Soru Ekle */}
            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)", zIndex: 999,
                    display: "flex", justifyContent: "center", alignItems: "center", padding: 20
                }}>
                    <div style={{
                        background: colors.white, width: "100%", maxWidth: 500,
                        borderRadius: 24, padding: 32, position: "relative",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
                    }}>
                        <button
                            onClick={() => {
                                if (!isUploading) {
                                    setShowModal(false);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                    setNote("");
                                }
                            }}
                            disabled={isUploading}
                            style={{
                                position: "absolute", top: 20, right: 20,
                                background: colors.grayLight, border: "none",
                                width: 32, height: 32, borderRadius: 16,
                                cursor: isUploading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center"
                            }}
                        >✕</button>

                        <h2 style={{ margin: "0 0 8px", color: colors.dark }}>Yeni Yanlış Ekle</h2>
                        <p style={{ margin: "0 0 24px", color: colors.gray, fontSize: 14 }}>Sorunun net bir fotoğrafını yükle.</p>

                        <div style={{
                            border: `2px dashed ${previewUrl ? colors.primary : colors.gray}`,
                            borderRadius: 16, height: 200, display: "flex", flexDirection: "column",
                            justifyContent: "center", alignItems: "center", marginBottom: 20,
                            overflow: "hidden", position: "relative", background: colors.grayLight
                        }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                                    <div style={{ color: colors.gray, fontWeight: 500 }}>Fotoğraf Seç</div>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                style={{
                                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                    opacity: 0, cursor: isUploading ? "not-allowed" : "pointer"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>
                                AI Koçuna Notun (İsteğe Bağlı)
                            </label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                disabled={isUploading}
                                placeholder="Örn: Sorudaki grafiği anlamadım, B şıkkı neden yanlış?"
                                style={{
                                    width: "100%", padding: 12, borderRadius: 12,
                                    border: `1px solid ${colors.grayLight}`, background: colors.grayLight,
                                    fontSize: 14, minHeight: 80, resize: "none", boxSizing: "border-box", textFont: "inherit"
                                }}
                            />
                        </div>

                        {uploadProgress && (
                            <div style={{ marginBottom: 16, fontSize: 14, color: colors.primary, fontWeight: 500, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔄</span> {uploadProgress}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedFile || isUploading}
                            style={{
                                width: "100%", padding: 16,
                                background: !selectedFile || isUploading ? colors.grayLight : colors.primary,
                                color: !selectedFile || isUploading ? colors.gray : colors.white,
                                border: "none", borderRadius: 12, fontWeight: 600, fontSize: 16,
                                cursor: !selectedFile || isUploading ? "not-allowed" : "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {isUploading ? "Bekleniyor..." : "Gönder ve Çözümü Al"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
