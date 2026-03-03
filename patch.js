const fs = require('fs');
const file = '/Users/admin/Desktop/study-control/src/MistakeBook.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Firebase Storage / Firestore section with timeout handling
const target = `            // 2. Görseli Firebase Storage'a yükle (arşiv için)
            const storageRef = ref(storage, \`mistakes/\${user.uid}/\${Date.now()}_\${selectedFile.name}\`);
            await uploadString(storageRef, base64Image, "data_url");
            const imageUrl = await getDownloadURL(storageRef);

            // 3. Firestore'a kaydet
            const newMistake = {
                uid: user.uid,
                imageUrl,
                note,
                solution: aiResponse.solution,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "mistakes"), newMistake);`;

const replacement = `            // 2. Görseli Firebase Storage'a yükle (arşiv için)
            const filename = selectedFile.name || "image.jpg";
            const storageRef = ref(storage, \`mistakes/\${user.uid}/\${Date.now()}_\${filename}\`);
            
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
            console.log("Firestore kaydı başarılı.");`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log("Patched MistakeBook.jsx");
} else {
    console.log("Target string not found in MistakeBook.jsx");
}
