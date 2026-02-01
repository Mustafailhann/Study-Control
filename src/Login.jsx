import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { createUserSubjects } from "./createUserSubjects";

// Önceden tanımlı kullanıcılar ve kategorileri
const PREDEFINED_USERS = {
  songul: "yks",
  mustafa: "mufettislik"
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [userType, setUserType] = useState("yks"); // yks veya mufettislik
  const [error, setError] = useState("");

  const fakeEmail = `${username}@studycontrol.local`;

  const handleSubmit = async () => {
    setError("");

    try {
      if (isRegister) {
        // Kullanıcı tipi belirleme - önceden tanımlı kullanıcılar için otomatik
        const finalUserType = PREDEFINED_USERS[username.toLowerCase()] || userType;

        // 1️⃣ Önce Auth kaydı (request.auth oluşur)
        const cred = await createUserWithEmailAndPassword(
          auth,
          fakeEmail,
          password
        );
        
        const uid = cred.user.uid;

        // 2️⃣ Username alınmış mı kontrol et (artık auth var)
        const usernameRef = doc(db, "usernames", username);
        const snap = await getDoc(usernameRef);

        if (snap.exists()) {
          setError("Bu kullanıcı adı alınmış");
          return;
        }

        // 3️⃣ Kullanıcı profili (userType ile birlikte)
        await setDoc(doc(db, "users", uid), {
          username,
          userType: finalUserType,
          createdAt: new Date()
        });

        // 4️⃣ Username → uid eşlemesi
        await setDoc(usernameRef, {
          uid,
          userType: finalUserType
        });

        // 5️⃣ Kullanıcı tipine göre konuları oluştur
        await createUserSubjects(uid, finalUserType);

      } else {
        // Giriş
        const cred = await signInWithEmailAndPassword(auth, fakeEmail, password);
        
        // Önceden tanımlı kullanıcılar için userType'ı her zaman güncelle
        const predefinedType = PREDEFINED_USERS[username.toLowerCase()];
        if (predefinedType) {
          const userDoc = await getDoc(doc(db, "users", cred.user.uid));
          const currentType = userDoc.exists() ? userDoc.data().userType : null;
          
          // Eğer mevcut tip önceden tanımlı tipten farklıysa güncelle
          if (currentType !== predefinedType) {
            await setDoc(doc(db, "users", cred.user.uid), {
              username,
              userType: predefinedType,
              createdAt: new Date()
            }, { merge: true });
            
            // Konuları da oluştur
            await createUserSubjects(cred.user.uid, predefinedType);
          }
        } else {
          // Tanımlı olmayan kullanıcılar için userType yoksa ekle
          const userDoc = await getDoc(doc(db, "users", cred.user.uid));
          if (!userDoc.exists() || !userDoc.data().userType) {
            await setDoc(doc(db, "users", cred.user.uid), {
              username,
              userType: "yks",
              createdAt: new Date()
            }, { merge: true });
            
            await createUserSubjects(cred.user.uid, "yks");
          }
        }
      }

    } catch (e) {
      setError(e.message);
    }
  };

  // Önceden tanımlı kullanıcı mı kontrol et
  const isPredefinedUser = PREDEFINED_USERS[username.toLowerCase()];

  return (
    <div style={{ 
      padding: 40, 
      maxWidth: 400, 
      margin: "80px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginBottom: 24, textAlign: "center" }}>
        📚 {isRegister ? "Kayıt Ol" : "Giriş Yap"}
      </h2>

      <input
        placeholder="Kullanıcı adı"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 6,
          border: "1px solid #ddd",
          fontSize: 16,
          boxSizing: "border-box"
        }}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 6,
          border: "1px solid #ddd",
          fontSize: 16,
          boxSizing: "border-box"
        }}
      />

      {/* Kayıt olurken kullanıcı tipi seçimi */}
      {isRegister && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Hangi sınava hazırlanıyorsunuz?
          </label>
          
          {isPredefinedUser ? (
            <div style={{ 
              padding: 12, 
              background: "#e3f2fd", 
              borderRadius: 6,
              color: "#1565c0"
            }}>
              ✓ {PREDEFINED_USERS[username.toLowerCase()] === "yks" ? "YKS" : "Müfettişlik"} kategorisi otomatik seçildi
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <label style={{
                flex: 1,
                padding: 12,
                border: userType === "yks" ? "2px solid #1976d2" : "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "center",
                background: userType === "yks" ? "#e3f2fd" : "#fff"
              }}>
                <input
                  type="radio"
                  name="userType"
                  value="yks"
                  checked={userType === "yks"}
                  onChange={() => setUserType("yks")}
                  style={{ display: "none" }}
                />
                🎓 YKS
              </label>
              
              <label style={{
                flex: 1,
                padding: 12,
                border: userType === "mufettislik" ? "2px solid #1976d2" : "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "center",
                background: userType === "mufettislik" ? "#e3f2fd" : "#fff"
              }}>
                <input
                  type="radio"
                  name="userType"
                  value="mufettislik"
                  checked={userType === "mufettislik"}
                  onChange={() => setUserType("mufettislik")}
                  style={{ display: "none" }}
                />
                🏦 Müfettişlik
              </label>
            </div>
          )}
        </div>
      )}

      <br />

      <button 
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: 14,
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        {isRegister ? "Kayıt Ol" : "Giriş Yap"}
      </button>

      <br /><br />

      <span
        style={{ color: "#1976d2", cursor: "pointer", display: "block", textAlign: "center" }}
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? "Zaten hesabım var" : "Hesabım yok"}
      </span>

      {error && <p style={{ color: "#d32f2f", textAlign: "center", marginTop: 16 }}>{error}</p>}
    </div>
  );
}
