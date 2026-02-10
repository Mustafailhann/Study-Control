# AI Chat Entegrasyonu - Kurulum Talimatları

## ✅ Yapılan İşlemler

1. **Netlify Functions klasörü oluşturuldu**
   - `netlify/functions/_lib/firebaseAdmin.mjs` - Firebase Admin SDK
   - `netlify/functions/_lib/gemini.mjs` - Gemini API client
   - `netlify/functions/ai-chat.mjs` - Chat endpoint (Gemini 1.5 Flash)
   - `netlify/functions/nightly-analysis.mjs` - Gece analizi (Gemini 1.5 Pro)
   - `netlify/functions/get-latest-report.mjs` - Rapor getirme endpoint

2. **Frontend komponenti eklendi**
   - `src/AIChat.jsx` - AI chat modal
   - `src/Sidebar.jsx` - AI Koç butonu eklendi
   - `src/App.jsx` - AIChat entegrasyonu

3. **Konfigürasyon güncellemeleri**
   - `package.json` - firebase-admin eklendi
   - `netlify.toml` - functions klasörü tanımlandı

## 🔑 Netlify Environment Variables (ÖNEMLİ!)

Netlify dashboard'unuzda **Site settings > Environment variables** bölümüne şu değişkenleri ekleyin:

### 1. GEMINI_API_KEY
```
Google AI Studio'dan alın: https://aistudio.google.com/apikey
```

### 2. FIREBASE_SERVICE_ACCOUNT_JSON
Firebase Console'dan Service Account JSON indirin:

1. Firebase Console > Project Settings > Service Accounts
2. "Generate new private key" butonuna tıklayın
3. İndirilen JSON dosyasını **tek satıra** çevirin (minify)
   - Online tool: https://codebeautify.org/jsonminifier
   - Veya terminal: `cat serviceAccount.json | jq -c`
4. Tek satır JSON'u Netlify'a yapıştırın

**Örnek format:**
```json
{"type":"service_account","project_id":"studycontrol-xxxx","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### 3. Mevcut VITE_ değişkenleri
Zaten var olan Firebase client config'inizin de Netlify'da olduğundan emin olun:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📊 Firestore Güvenlik Kuralları

`ai_reports` koleksiyonu için Firestore Rules'a ekleyin:

```javascript
match /ai_reports/{reportId} {
  allow read: if request.auth != null && 
              resource.data.uid == request.auth.uid;
  allow write: if false; // Sadece backend yazabilir
}
```

## 🚀 Deploy

```bash
# Local test (optional)
npm run dev

# Deploy to Netlify
git add .
git commit -m "AI chat entegrasyonu eklendi"
git push origin main
```

Netlify otomatik deploy edecek.

## 🤖 Kullanım

### 1. AI Chat
- Sidebar'daki **"🤖 AI Koç"** butonuna tıklayın
- Kullanıcının verileri otomatik analiz edilir
- Chat üzerinden soru sorun, plan isteyin

### 2. Gece Otomatik Analiz
- Her gece **23:40 TR saati** (20:40 UTC) otomatik çalışır
- Tüm kullanıcılar için Gemini 1.5 Pro ile detaylı rapor oluşturur
- Raporlar `ai_reports` koleksiyonuna yazılır
- Chat modalındaki **"📊 Günlük Analiz"** butonundan görülebilir

### 3. Manuel Analiz Tetikleme (Test için)
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/nightly-analysis
```

## 💰 Maliyet Tahmini (3 kullanıcı)

- **Chat (Flash)**: ~$0-2/ay
- **Gece analiz (Pro)**: ~$2-10/ay
- **Toplam**: ~$3-12/ay

## 🔧 Test

### Local test (Netlify CLI ile)
```bash
# Netlify CLI kur (eğer yoksa)
npm install -g netlify-cli

# Netlify dev server
netlify dev

# Environment variables'ı .env dosyasına ekle
# GEMINI_API_KEY=...
# FIREBASE_SERVICE_ACCOUNT_JSON=...
```

### Chat endpoint test
```bash
# Token al (browser console'da)
const token = await firebase.auth().currentUser.getIdToken()
console.log(token)

# Test isteği
curl -X POST http://localhost:8888/.netlify/functions/ai-chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Bugün ne çalışmalıyım?"}'
```

## 📝 Notlar

- **Güvenlik**: API key'ler backend'de, browser'a düşmüyor
- **Rate limiting**: Gemini Flash 15 req/min (ücretsiz), Pro limitsiz
- **Token yönetimi**: Her request'te fresh token alınıyor
- **Error handling**: Tüm hatalar kullanıcıya gösteriliyor

## 🐛 Sorun Giderme

### "Missing GEMINI_API_KEY"
- Netlify environment variables kontrol edin
- Deploy sonrası değişken eklediyseniz redeploy yapın

### "Missing FIREBASE_SERVICE_ACCOUNT_JSON"
- JSON formatı doğru mu kontrol edin (tek satır, escape edilmiş)
- Service account'un Firestore erişimi var mı kontrol edin

### Scheduled function çalışmıyor
- Netlify'da Pro plan gerekebilir (scheduled functions için)
- Alternatif: External cron service (cron-job.org) kullanın

### Chat açılmıyor
- Browser console'da hata var mı kontrol edin
- Network tab'da API response'ları kontrol edin

## 📞 Destek

Sorun olursa chat'te bana yazın! 🚀
