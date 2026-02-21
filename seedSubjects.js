import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

/* firebase.js içindeki config ile AYNI olmalı */
const firebaseConfig = {
  apiKey: "AIzaSyB44xLP0UwppvWtuA5_790FfJBL3sfZM_Q",
  authDomain: "studycontrol-9d3c4.firebaseapp.com",
  projectId: "studycontrol-9d3c4",
  storageBucket: "studycontrol-9d3c4.firebasestorage.app",
  messagingSenderId: "460391406433",
  appId: "1:460391406433:web:6d2c93a975fb22dfb24320"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  // TYT Problemler
  await setDoc(doc(db, "subjects", "yks_tyt_problemler"), {
    exam: "yks",
    level: "tyt",
    name: "Problemler Kampı",
    topics: [
      "Oran Orantı 1 | 0 DAN Problemler Kampı 1.Gün",
      "Oran Orantı 2 | 0 DAN Problemler Kampı 2.Gün",
      "Oran Orantı 3 | 0 DAN Problemler Kampı 3.Gün",
      "Sayı Problemleri 1 | 0 DAN Problemler Kampı 4.Gün | Rehber Matematik",
      "Sayı Problemleri 2 | 0 DAN Problemler Kampı 5.Gün | Rehber Matematik",
      "Sayı Problemleri 3 | 0 DAN Problemler Kampı 6.Gün | Rehber Matematik",
      "Kesir Problemleri 1 | 0 DAN Problemler Kampı 7.Gün | Rehber Matematik",
      "Kesir Problemleri 2 | 0 DAN Problemler Kampı 8.Gün | Rehber Matematik",
      "Yaş Problemleri 1 | 0 DAN Problemler Kampı 9.Gün | Rehber Matematik",
      "Yaş Problemleri 2 | 0 DAN Problemler Kampı 10.Gün | Rehber Matematik",
      "Hareket Problemleri 1 | 0 DAN Problemler Kampı 11.Gün | Rehber Matematik",
      "Hareket Problemleri 2 | 0 DAN Problemler Kampı 12.Gün | Rehber Matematik",
      "Yüzde Problemleri | 0 DAN Problemler Kampı 13.Gün | Rehber Matematik",
      "Kar - Zarar Problemleri | 0 DAN Problemler Kampı 14.Gün | Rehber Matematik",
      "Karışım Problemleri | 0 DAN Problemler Kampı 15.Gün | Rehber Matematik",
      "Tablo ve Grafik Problemleri | 0 DAN Problemler Kampı 16.Gün | Rehber Matematik",
      "Sayısal Yetenek ve Muhakeme Problemleri | 0 DAN Problemler Kampı 17.Gün | Rehber Matematik",
      "Problem Denemesi | 0 DAN Problemler Kampı 18.Gün | Rehber Matematik"
    ]
  });
  console.log("✅ TYT Problemler eklendi");

  // TYT Matematik
  await setDoc(doc(db, "subjects", "yks_tyt_matematik"), {
    exam: "yks",
    level: "tyt",
    name: "Matematik",
    topics: [
      "(1. Bölüm: Temel Kavramlar ve Sayılar)",
      "1. Gün: Sayı Kümeleri",
      "2. Gün: Pozitif ve Negatif Sayılar",
      "3. Gün: Tek ve Çift Sayılar",
      "4. Gün: Ardışık Sayılar",
      "5. Gün: Asal Sayılar, Aralarında Asallık ve Faktöriyel",
      "6. Gün: Sayı Basamakları ve Çözümleme",
      "7. Gün: Rasyonel Sayılar",
      "8. Gün: Ondalık Sayılar ve Devirli Ondalık Sayılar",
      "9. Gün: Bölme İşlemi",
      "10. Gün: Bölünebilme Kuralları",
      "11. Gün: EBOB - EKOK (1. Kısım)",
      "12. Gün: EBOB - EKOK (2. Kısım - Problemler)",
      "(2. Bölüm: Basit Denklemler ve Eşitsizlikler)",
      "13. Gün: Birinci Dereceden Denklemler",
      "14. Gün: Basit Eşitsizlikler (1. Kısım)",
      "15. Gün: Basit Eşitsizlikler (2. Kısım)",
      "16. Gün: Mutlak Değer (1. Kısım)",
      "17. Gün: Mutlak Değer (2. Kısım)",
      "18. Gün: Mutlak Değer (3. Kısım - Denklemler ve Eşitsizlikler)",
      "(3. Bölüm: Üslü ve Köklü İfadeler)",
      "19. Gün: Üslü Sayılar (1. Kısım)",
      "20. Gün: Üslü Sayılar (2. Kısım)",
      "21. Gün: Üslü Sayılar (3. Kısım)",
      "22. Gün: Köklü Sayılar (1. Kısım)",
      "23. Gün: Köklü Sayılar (2. Kısım)",
      "24. Gün: Köklü Sayılar (3. Kısım)",
      "25. Gün: Çarpanlara Ayırma (1. Kısım)",
      "26. Gün: Çarpanlara Ayırma (2. Kısım)",
      "27. Gün: Çarpanlara Ayırma (3. Kısım)",
      "(4. Bölüm: Oran-Orantı ve Problemler)",
      "28. Gün: Oran - Orantı (1. Kısım)",
      "29. Gün: Oran - Orantı (2. Kısım)",
      "30. Gün: Sayı Problemleri (1. Kısım)",
      "31. Gün: Sayı Problemleri (2. Kısım)",
      "32. Gün: Sayı Problemleri (3. Kısım)",
      "33. Gün: Kesir Problemleri",
      "34. Gün: Yaş Problemleri",
      "35. Gün: Hareket Problemleri (1. Kısım)",
      "36. Gün: Hareket Problemleri (2. Kısım)",
      "37. Gün: Yüzde Problemleri",
      "38. Gün: Kar - Zarar Problemleri",
      "39. Gün: Karışım Problemleri",
      "40. Gün: İşçi Problemleri",
      "41. Gün: Grafik ve Tablo Problemleri",
      "42. Gün: Sayısal Mantık ve Muhakeme Problemleri",
      "43. Gün: Rutin Olmayan Problemler",
      "(5. Bölüm: Kümeler, Mantık ve Fonksiyonlar)",
      "44. Gün: Mantık (1. Kısım)",
      "45. Gün: Mantık (2. Kısım)",
      "46. Gün: Kümeler (1. Kısım)",
      "47. Gün: Kümeler (2. Kısım)",
      "48. Gün: Kartezyen Çarpım",
      "49. Gün: Fonksiyonlar (1. Kısım)",
      "50. Gün: Fonksiyonlar (2. Kısım)",
      "51. Gün: Fonksiyonlar (3. Kısım - Türleri)",
      "52. Gün: Fonksiyonlar (4. Kısım - İşlemler ve Bileşke)",
      "53. Gün: Fonksiyonlar (5. Kısım - Ters Fonksiyon ve Grafikler)",
      "(6. Bölüm: İleri Düzey Konular)",
      "54. Gün: Polinomlar (1. Kısım)",
      "55. Gün: Polinomlar (2. Kısım)",
      "56. Gün: Polinomlar (3. Kısım)",
      "57. Gün: İkinci Dereceden Denklemler (1. Kısım)",
      "58. Gün: İkinci Dereceden Denklemler (2. Kısım)",
      "59. Gün: İkinci Dereceden Denklemler (3. Kısım - Kök Katsayı İlişkisi)",
      "(7. Bölüm: PKOB ve Veri)",
      "60. Gün: Sayma ve Permütasyon (1. Kısım)",
      "61. Gün: Sayma ve Permütasyon (2. Kısım)",
      "62. Gün: Kombinasyon (1. Kısım)",
      "63. Gün: Kombinasyon (2. Kısım)",
      "64. Gün: Binom Açılımı",
      "65. Gün: Olasılık (1. Kısım)",
      "66. Gün: Olasılık (2. Kısım)",
      "67. Gün: Olasılık (3. Kısım)",
      "68. Gün: Veri ve İstatistik (1. Kısım)",
      "69. Gün: Veri ve İstatistik (2. Kısım)",
      "70. Gün: Kamp Değerlendirmesi ve Kapanış"
    ]
  });
  console.log("✅ TYT Matematik eklendi");

  // TYT Türkçe
  await setDoc(doc(db, "subjects", "yks_tyt_turkce"), {
    exam: "yks",
    level: "tyt",
    name: "Türkçe",
    topics: [
      "Sözcükte Anlam",
      "Cümlede Anlam",
      "Paragrafta Anlam",
      "Ses Bilgisi",
      "Yazım Kuralları",
      "Noktalama İşaretleri",
      "Sözcük Türleri",
      "İsimler",
      "Sıfatlar",
      "Zamirler",
      "Zarflar",
      "Edat – Bağlaç – Ünlem",
      "Fiiller",
      "Fiilde Yapı",
      "Fiilimsiler",
      "Cümlenin Ögeleri",
      "Cümle Türleri",
      "Anlatım Bozuklukları",
      "Sözel Mantık"
    ]
  });
  console.log("✅ TYT Türkçe eklendi");

  // TYT Geometri
  await setDoc(doc(db, "subjects", "yks_tyt_geometri"), {
    exam: "yks",
    level: "tyt",
    name: "Geometri",
    topics: [
      "Doğruda Açılar 1 | 0 DAN Geometri Kampı 1.Gün | Rehber Matematik",
      "Doğruda Açılar 2 | 0 DAN Geometri Kampı 2.Gün | Rehber Matematik",
      "Doğruda Açılar 3 | 0 DAN Geometri Kampı 3.Gün | Rehber Matematik",
      "Üçgende Açılar 1 | 0 DAN Geometri Kampı 4.Gün | Rehber Matematik",
      "Üçgende Açılar 2 | 0 DAN Geometri Kampı 5.Gün | Rehber Matematik",
      "Üçgende Açılar 3 | 0 DAN Geometri Kampı 6.Gün | Rehber Matematik",
      "Üçgende Açılar 4 | 0 DAN Geometri Kampı 7.Gün | Rehber Matematik",
      "Dik Üçgen 1 | 0 DAN Geometri Kampı 8.Gün | Rehber Matematik",
      "Dik Üçgen 2 | 0 DAN Geometri Kampı 9.Gün | Rehber Matematik",
      "Dik Üçgen 3 | 0 DAN Geometri Kampı 10.Gün | Rehber Matematik",
      "İkizkenar Üçgen | 0 DAN Geometri Kampı 11.Gün | Rehber Matematik",
      "Eşkenar Üçgen | 0 DAN Geometri Kampı 12.Gün | Rehber Matematik",
      "Üçgende Açıortay 1 | 0 DAN Geometri Kampı 13.Gün | Rehber Matematik",
      "Üçgende Açıortay 2 | 0 DAN Geometri Kampı 14.Gün | Rehber Matematik",
      "Üçgende Kenarortay 1 | 0 DAN Geometri Kampı 15.Gün | Rehber Matematik",
      "Üçgende Kenarortay 2 | 0 DAN Geometri Kampı 16.Gün | Rehber Matematik",
      "Üçgende Eşlik ve Benzerlik 1 | 0 DAN Geometri Kampı 17.Gün | Rehber Matematik",
      "Üçgende Eşlik ve Benzerlik 2 | 0 DAN Geometri Kampı 18.Gün | Rehber Matematik",
      "Üçgende Alan 1 | 0 DAN Geometri Kampı 19.Gün | Rehber Matematik",
      "Üçgende Alan 2 | 0 DAN Geometri Kampı 20.Gün | Rehber Matematik",
      "Üçgende Alan 3 | 0 DAN Geometri Kampı 21.Gün | Rehber Matematik",
      "Açı Kenar Bağıntıları 1 | 0 DAN Geometri Kampı 22.Gün | Rehber Matematik",
      "Açı Kenar Bağıntıları 2 | 0 DAN Geometri Kampı 23.Gün | Rehber Matematik",
      "Çokgenler 1 | 0 DAN Geometri Kampı 24.Gün | Rehber Matematik",
      "Çokgenler 2 | 0 DAN Geometri Kampı 25.Gün | Rehber Matematik",
      "Dörtgenler 1 | 0 DAN Geometri Kampı 26.Gün | Rehber Matematik",
      "Dörtgenler 2 | 0 DAN Geometri Kampı 27.Gün | Rehber Matematik",
      "Deltoid | 0 DAN Geometri Kampı 28.Gün | Rehber Matematik",
      "Yamuk 1 | 0 DAN Geometri Kampı 29.Gün | Rehber Matematik",
      "Yamuk 2 | 0 DAN Geometri Kampı 30.Gün | Rehber Matematik",
      "Paralelkenar 1 | 0 DAN Geometri Kampı 31.Gün | Rehber Matematik",
      "Paralelkenar 2 | 0 DAN Geometri Kampı 32.Gün | Rehber Matematik",
      "Eşkenar Dörtgen | 0 DAN Geometri Kampı 33.Gün | Rehber Matematik",
      "Dikdörtgen | 0 DAN Geometri Kampı 34.Gün | Rehber Matematik",
      "Kare | 0 DAN Geometri Kampı 35.Gün | Rehber Matematik"
    ]
  });
  console.log("✅ TYT Geometri eklendi");

  // TYT Tarih
  await setDoc(doc(db, "subjects", "yks_tyt_tarih"), {
    exam: "yks",
    level: "tyt",
    name: "Tarih",
    topics: [
      "Tarih Bilimi",
      "İlk ve Orta Çağ Medeniyetleri",
      "İlk Türk Devletleri",
      "İslam Tarihi ve Uygarlığı",
      "Türklerin İslamiyeti Kabulü",
      "Orta Asya'dan Anadolu'ya",
      "Beylikten Devlete Osmanlı",
      "Dünya Gücü Osmanlı",
      "Değişen Dünya Dengeleri",
      "Uluslararası İlişkilerde Denge",
      "Devrimler Çağında Osmanlı",
      "19. Yüzyılda Osmanlı",
      "20. Yüzyıl Başlarında Osmanlı"
    ]
  });
  console.log("✅ TYT Tarih eklendi");

  // TYT Coğrafya
  await setDoc(doc(db, "subjects", "yks_tyt_cografya"), {
    exam: "yks",
    level: "tyt",
    name: "Coğrafya",
    topics: [
      "Doğa ve İnsan",
      "Harita Bilgisi",
      "Dünya'nın Şekli ve Özellikleri",
      "Yerşekilleri",
      "İklim",
      "İç Kuvvetler ve Yer Şekilleri",
      "Dış Kuvvetler ve Yer Şekilleri",
      "Nüfus ve Yerleşme",
      "Göç",
      "Ekonomik Faaliyetler",
      "Doğal Kaynaklar",
      "Çevre ve Toplum",
      "Türkiye Coğrafyası"
    ]
  });
  console.log("✅ TYT Coğrafya eklendi");

  // TYT Felsefe
  await setDoc(doc(db, "subjects", "yks_tyt_felsefe"), {
    exam: "yks",
    level: "tyt",
    name: "Felsefe",
    topics: [
      "Felsefe Nedir?",
      "Felsefi Düşünme",
      "Bilgi Felsefesi",
      "Bilim Felsefesi",
      "Ahlak Felsefesi",
      "Sanat Felsefesi",
      "Din Felsefesi",
      "Siyaset Felsefesi"
    ]
  });
  console.log("✅ TYT Felsefe eklendi");

  // TYT Din Kültürü
  await setDoc(doc(db, "subjects", "yks_tyt_din"), {
    exam: "yks",
    level: "tyt",
    name: "Din Kültürü ve Ahlak Bilgisi",
    topics: [
      "İslam Düşüncesinde İtikadi Yorumlar",
      "Hz. Muhammed ve Evrensel Mesajı",
      "İslam ve Bilim",
      "Ahlak ve Değerler",
      "İslam Düşüncesinde Yorumlar",
      "Din ve Hayat"
    ]
  });
  console.log("✅ TYT Din Kültürü eklendi");

  // AYT Matematik
  await setDoc(doc(db, "subjects", "yks_ayt_matematik"), {
    exam: "yks",
    level: "ayt",
    name: "Matematik",
    topics: [
      "BÖLÜM 1: Temel AYT Konuları (1 - 27. Gün)",
      "1. Gün: Polinomlar",
      "2. Gün: Polinomlar",
      "3. Gün: Polinomlar",
      "4. Gün: Polinomlar",
      "5. Gün: Polinomlar",
      "6. Gün: Fonksiyon Uygulamaları",
      "7. Gün: Fonksiyon Uygulamaları",
      "8. Gün: Fonksiyon Uygulamaları",
      "9. Gün: Fonksiyon Uygulamaları",
      "10. Gün: Fonksiyon Uygulamaları",
      "11. Gün: İkinci Dereceden Denklemler",
      "12. Gün: İkinci Dereceden Denklemler",
      "13. Gün: İkinci Dereceden Denklemler / Karmaşık Sayılar",
      "14. Gün: Karmaşık Sayılar",
      "15. Gün: Parabol",
      "16. Gün: Parabol",
      "17. Gün: Parabol",
      "18. Gün: Parabol",
      "19. Gün: Parabol",
      "20. Gün: Eşitsizlikler",
      "21. Gün: Eşitsizlikler",
      "22. Gün: Eşitsizlikler",
      "23. Gün: Eşitsizlikler",
      "24. Gün: Eşitsizlikler",
      "25. Gün: Eşitsizlik Sistemleri",
      "26. Gün: Eşitsizlik Sistemleri",
      "27. Gün: Part 1 Kamp Değerlendirmesi / Soru Çözümü",
      "BÖLÜM 2: Trigonometri, Logaritma ve Diziler (28 - 53. Gün)",
      "28. Gün: Trigonometri",
      "29. Gün: Trigonometri",
      "30. Gün: Trigonometri",
      "31. Gün: Trigonometri",
      "32. Gün: Trigonometri",
      "33. Gün: Trigonometri",
      "34. Gün: Trigonometri",
      "35. Gün: Trigonometri",
      "36. Gün: Trigonometri",
      "37. Gün: Trigonometri",
      "38. Gün: Trigonometri",
      "39. Gün: Trigonometri",
      "40. Gün: Trigonometri",
      "41. Gün: Trigonometri",
      "42. Gün: Logaritma",
      "43. Gün: Logaritma",
      "44. Gün: Logaritma",
      "45. Gün: Logaritma",
      "46. Gün: Logaritma",
      "47. Gün: Logaritma",
      "48. Gün: Diziler",
      "49. Gün: Diziler",
      "50. Gün: Diziler",
      "51. Gün: Diziler",
      "52. Gün: Diziler",
      "53. Gün: Part 2 Kamp Değerlendirmesi / Soru Çözümü",
      "BÖLÜM 3: Limit, Türev ve İntegral (LTİ) (54 - 90. Gün)",
      "54. Gün: Limit",
      "55. Gün: Limit",
      "56. Gün: Limit",
      "57. Gün: Limit",
      "58. Gün: Süreklilik",
      "59. Gün: Süreklilik",
      "60. Gün: Süreklilik / Limit Soru Çözümü",
      "61. Gün: Türev Alma Kuralları",
      "62. Gün: Türev Alma Kuralları",
      "63. Gün: Türev Alma Kuralları",
      "64. Gün: Türevin Geometrik Yorumu",
      "65. Gün: Türevin Geometrik Yorumu",
      "66. Gün: Türevin Geometrik Yorumu",
      "67. Gün: Artan ve Azalan Fonksiyonlar",
      "68. Gün: Ekstremum Noktaları",
      "69. Gün: Ekstremum Noktaları",
      "70. Gün: Maksimum - Minimum Problemleri",
      "71. Gün: Maksimum - Minimum Problemleri",
      "72. Gün: Türev Grafikleri",
      "73. Gün: Türev Grafikleri",
      "74. Gün: Türev Soru Çözümü / Genel Tekrar",
      "75. Gün: Belirsiz İntegral",
      "76. Gün: Belirsiz İntegral",
      "77. Gün: İntegral Alma Kuralları",
      "78. Gün: İntegral Alma Kuralları",
      "79. Gün: Değişken Değiştirme Yöntemi",
      "80. Gün: Değişken Değiştirme Yöntemi",
      "81. Gün: Belirli İntegral",
      "82. Gün: Belirli İntegral",
      "83. Gün: Belirli İntegralin Özellikleri",
      "84. Gün: Belirli İntegralin Özellikleri",
      "85. Gün: Riemann Toplamı",
      "86. Gün: İntegralde Alan",
      "87. Gün: İntegralde Alan",
      "88. Gün: İntegralde Alan",
      "89. Gün: İntegralde Alan Uygulamaları",
      "90. Gün: İntegral Soru Çözümü ve Kamp Kapanışı"
    ]
  });
  console.log("✅ AYT Matematik eklendi");

  // AYT Edebiyat
  await setDoc(doc(db, "subjects", "yks_ayt_edebiyat"), {
    exam: "yks",
    level: "ayt",
    name: "Türk Dili ve Edebiyatı",
    topics: [
      "Türk Edebiyatının Dönemleri - Güzel Sanatlar ve Edebiyat",
      "İslamiyet Öncesi Türk Edebiyatı - Sözlü Dönem",
      "İslamiyet Öncesi Türk Edebiyatı - Yazılı Dönem",
      "Destanlar",
      "İslami Devir Türk Edebiyatına Geçiş Dönemi Eserleri",
      "Şiir Bilgisi 1 (Nazım Birimi, Ölçü, Kafiye, Redif)",
      "Şiir Bilgisi 2 (Ahenk Unsurları, Şiir Türleri)",
      "Söz Sanatları (Edebi Sanatlar) 1",
      "Söz Sanatları (Edebi Sanatlar) 2",
      "Halk Edebiyatı - Anonim Halk Edebiyatı",
      "Halk Edebiyatı - Aşık Tarzı Halk Edebiyatı",
      "Halk Edebiyatı - Dini Tasavvufi (Tekke) Halk Edebiyatı",
      "Halk Edebiyatı Temsilcileri",
      "Divan Edebiyatına Giriş ve Genel Özellikler",
      "Divan Edebiyatı Nazım Biçimleri 1 (Beyitlerle Kurulanlar)",
      "Divan Edebiyatı Nazım Biçimleri 2 (Bentlerle Kurulanlar)",
      "Divan Edebiyatı Nazım Biçimleri 3 (Bentlerle Kurulanlar)",
      "Divan Edebiyatı Nesir (Düz Yazı) Türleri",
      "Divan Edebiyatı Temsilcileri 1 (13. ve 14. Yüzyıl)",
      "Divan Edebiyatı Temsilcileri 2 (15. ve 16. Yüzyıl)",
      "Divan Edebiyatı Temsilcileri 3 (17, 18 ve 19. Yüzyıl)",
      "Edebi Akımlar",
      "Tanzimat Edebiyatı 1. Dönem Özellikleri ve Şiiri",
      "Tanzimat Edebiyatı 2. Dönem Özellikleri ve Şiiri",
      "Tanzimat Edebiyatı Roman ve Hikaye",
      "Tanzimat Edebiyatı Tiyatro ve Gazetecilik",
      "Servetifünun Edebiyatı Özellikleri ve Şiiri",
      "Servetifünun Edebiyatı Roman ve Hikayesi",
      "Fecriati Edebiyatı ve Temsilcileri",
      "Milli Edebiyat Dönemi Özellikleri ve Şiiri",
      "Milli Edebiyat Dönemi Roman ve Hikayesi",
      "Milli Edebiyat Dönemi Temsilcileri",
      "Milli Edebiyat Zevk ve Anlayışını Sürdürenler",
      "Cumhuriyet Dönemi Şiir 1 (Öz/Saf Şiir, Yedi Meşaleciler)",
      "Cumhuriyet Dönemi Şiir 2 (Serbest Nazım ve Toplumcu Şiir)",
      "Cumhuriyet Dönemi Şiir 3 (Milli Edebiyat Zevkini Sürdürenler, Hisarcılar)",
      "Cumhuriyet Dönemi Şiir 4 (Garip Akımı / I. Yeni)",
      "Cumhuriyet Dönemi Şiir 5 (Garip Dışında Yeniliği Sürdürenler)",
      "Cumhuriyet Dönemi Şiir 6 (İkinci Yeni)",
      "Cumhuriyet Dönemi Şiir 7 (İkinci Yeni Sonrası Toplumcu Şiir, 1980 Sonrası)",
      "Cumhuriyet Dönemi Roman ve Hikaye 1 (Milli Edebiyat Zevkini Sürdürenler)",
      "Cumhuriyet Dönemi Roman ve Hikaye 2 (Toplumcu Gerçekçiler)",
      "Cumhuriyet Dönemi Roman ve Hikaye 3 (Bireyin İç Dünyasını Esas Alanlar)",
      "Cumhuriyet Dönemi Roman ve Hikaye 4 (Modernizmi ve Postmodernizmi Esas Alanlar)",
      "Cumhuriyet Dönemi Tiyatro",
      "Cumhuriyet Dönemi Öğretici Metinler"
    ]
  });
  console.log("✅ AYT Edebiyat eklendi");

  // AYT Tarih-1
  await setDoc(doc(db, "subjects", "yks_ayt_tarih1"), {
    exam: "yks",
    level: "ayt",
    name: "Tarih-1",
    topics: [
      "Yerleşme ve Devletleşme Sürecinde Selçuklular",
      "Beylikten Devlete Osmanlı Siyaseti",
      "Beylikten Devlete Osmanlı Medeniyeti",
      "Dünya Gücü Osmanlı",
      "Osmanlı Kültür ve Medeniyeti",
      "Sultan ve Osmanlı Merkez Teşkilatı",
      "Osmanlı Taşra Teşkilatı",
      "Klasik Çağda Osmanlı Toplum Düzeni",
      "Değişen Dünya Dengeleri",
      "Güçler Dengesinde Osmanlı",
      "Değişim Çağında Osmanlı"
    ]
  });
  console.log("✅ AYT Tarih-1 eklendi");

  // AYT Coğrafya-1
  await setDoc(doc(db, "subjects", "yks_ayt_cografya1"), {
    exam: "yks",
    level: "ayt",
    name: "Coğrafya-1",
    topics: [
      "Doğal Sistemler",
      "Atmosfer ve İklim",
      "İklim Elemanları",
      "İklim Tipleri",
      "Hidrosfer",
      "Türkiye'nin İklimi",
      "İç Kuvvetler ve Yer Şekilleri",
      "Dış Kuvvetler ve Yer Şekilleri",
      "Türkiye'nin Yer Şekilleri",
      "Doğal Afetler",
      "Beşeri Sistemler",
      "Nüfus",
      "Göç",
      "Yerleşme",
      "Ekonomik Faaliyetler",
      "Ulaşım ve Ticaret"
    ]
  });
  console.log("✅ AYT Coğrafya-1 eklendi");

  // AYT Tarih-2
  await setDoc(doc(db, "subjects", "yks_ayt_tarih2"), {
    exam: "yks",
    level: "ayt",
    name: "Tarih-2",
    topics: [
      "Türk İnkılabı",
      "I. Dünya Savaşı",
      "Mondros Ateşkes Antlaşması",
      "Kurtuluş Savaşı Hazırlıkları",
      "TBMM'nin Açılması",
      "Cepheler ve Savaşlar",
      "Lozan Barış Antlaşması",
      "Atatürk İlkeleri",
      "İnkılaplar",
      "Siyasi Alanda İnkılaplar",
      "Sosyal Alanda İnkılaplar",
      "Eğitim ve Kültür",
      "Ekonomik Gelişmeler",
      "II. Dünya Savaşı",
      "Soğuk Savaş Dönemi",
      "Çok Partili Hayata Geçiş"
    ]
  });
  console.log("✅ AYT Tarih-2 eklendi");

  // AYT Coğrafya-2
  await setDoc(doc(db, "subjects", "yks_ayt_cografya2"), {
    exam: "yks",
    level: "ayt",
    name: "Coğrafya-2",
    topics: [
      "Türkiye'nin Coğrafi Bölgeleri",
      "Bölgesel Coğrafya",
      "Çevre ve Toplum",
      "Küresel Ortam",
      "Doğal Kaynaklar",
      "Enerji Kaynakları",
      "Türkiye'de Tarım",
      "Türkiye'de Hayvancılık",
      "Türkiye'de Madencilik",
      "Türkiye'de Sanayi",
      "Türkiye'de Ulaşım",
      "Türkiye'de Ticaret",
      "Türkiye'de Turizm",
      "Çevre Sorunları",
      "Küresel İklim Değişikliği"
    ]
  });
  console.log("✅ AYT Coğrafya-2 eklendi");

  // AYT Felsefe
  await setDoc(doc(db, "subjects", "yks_ayt_felsefe"), {
    exam: "yks",
    level: "ayt",
    name: "Felsefe",
    topics: [
      "Felsefenin Temel Disiplinleri",
      "Varlık Felsefesi (Ontoloji)",
      "Bilgi Felsefesi (Epistemoloji)",
      "Doğru Düşünme Yöntemleri",
      "Mantık",
      "Bilim Felsefesi",
      "Ahlak Felsefesi (Etik)",
      "Sanat Felsefesi (Estetik)",
      "Din Felsefesi",
      "Siyaset Felsefesi",
      "Hukuk Felsefesi"
    ]
  });
  console.log("✅ AYT Felsefe eklendi");

  // AYT Din Kültürü
  await setDoc(doc(db, "subjects", "yks_ayt_din"), {
    exam: "yks",
    level: "ayt",
    name: "Din Kültürü ve Ahlak Bilgisi",
    topics: [
      "Din ve Ahlak",
      "İslam'ın Temel Kavramları",
      "Kur'an ve Yorumu",
      "Hz. Muhammed'in Hayatı",
      "İslam Düşünce Tarihi",
      "İslam ve Tasavvuf",
      "Güncel Dini Meseleler",
      "Dinler Arası Diyalog",
      "İslam Ahlakı",
      "Aile ve Toplum"
    ]
  });
  console.log("✅ AYT Din Kültürü eklendi");

  // Ziraat BT - Algoritma ve Veri Yapıları
  await setDoc(doc(db, "subjects", "ziraat_bt_algoritma"), {
    exam: "ziraat",
    level: "bt",
    name: "Algoritma ve Veri Yapıları",
    topics: [
      "Algoritma Kavramı",
      "Akış Diyagramları",
      "Zaman ve Bellek Karmaşıklığı",
      "Big-O Notasyonu",
      "Diziler (Arrays)",
      "Bağlı Listeler (Linked Lists)",
      "Stack (Yığın)",
      "Queue (Kuyruk)",
      "Ağaçlar (Trees)",
      "Binary Search Tree",
      "Heap Yapısı",
      "Hash Table",
      "Graf Yapıları",
      "Arama Algoritmaları",
      "Sıralama Algoritmaları",
      "Dinamik Programlama",
      "Greedy Algoritmalar",
      "Backtracking",
      "Recursion (Özyineleme)"
    ]
  });
  console.log("✅ Ziraat BT - Algoritma eklendi");

  // Ziraat BT - Programlama
  await setDoc(doc(db, "subjects", "ziraat_bt_programlama"), {
    exam: "ziraat",
    level: "bt",
    name: "Programlama Dilleri",
    topics: [
      "Programlama Temelleri",
      "Veri Tipleri ve Değişkenler",
      "Operatörler",
      "Kontrol Yapıları (if, switch)",
      "Döngüler (for, while)",
      "Fonksiyonlar ve Metodlar",
      "Diziler ve Listeler",
      "Nesne Yönelimli Programlama (OOP)",
      "Sınıflar ve Nesneler",
      "Kalıtım (Inheritance)",
      "Polymorphism (Çok Biçimlilik)",
      "Encapsulation (Kapsülleme)",
      "Abstraction (Soyutlama)",
      "Interface ve Abstract Class",
      "Exception Handling (Hata Yönetimi)",
      "File I/O İşlemleri",
      "Java Programlama",
      "C# Programlama",
      "Python Temelleri",
      "SQL Programlama"
    ]
  });
  console.log("✅ Ziraat BT - Programlama eklendi");

  // Ziraat BT - Veritabanı
  await setDoc(doc(db, "subjects", "ziraat_bt_veritabani"), {
    exam: "ziraat",
    level: "bt",
    name: "Veritabanı Yönetim Sistemleri",
    topics: [
      "Veritabanı Kavramları",
      "İlişkisel Veritabanı Modeli",
      "ER Diyagramları",
      "Normalizasyon",
      "1NF, 2NF, 3NF, BCNF",
      "SQL Temelleri",
      "DDL Komutları (CREATE, ALTER, DROP)",
      "DML Komutları (SELECT, INSERT, UPDATE, DELETE)",
      "JOIN İşlemleri",
      "Aggregate Functions",
      "GROUP BY ve HAVING",
      "Subqueries (Alt Sorgular)",
      "Views (Görünümler)",
      "Index Yapıları",
      "Stored Procedures",
      "Triggers (Tetikleyiciler)",
      "Transaction Yönetimi",
      "ACID Özellikleri",
      "Veritabanı Güvenliği",
      "Backup ve Recovery",
      "NoSQL Veritabanları (Temel)"
    ]
  });
  console.log("✅ Ziraat BT - Veritabanı eklendi");

  // Ziraat BT - Ağlar
  await setDoc(doc(db, "subjects", "ziraat_bt_aglar"), {
    exam: "ziraat",
    level: "bt",
    name: "Bilgisayar Ağları",
    topics: [
      "Ağ Temelleri",
      "OSI Referans Modeli",
      "TCP/IP Protokol Ailesi",
      "IP Adresleme",
      "Subnetting",
      "CIDR Notasyonu",
      "IPv4 ve IPv6",
      "MAC Adresleri",
      "Switch ve Router",
      "VLAN Yapıları",
      "Routing Protokolleri",
      "DNS (Domain Name System)",
      "DHCP Protokolü",
      "NAT/PAT",
      "Firewall Kavramları",
      "VPN Teknolojileri",
      "Kablosuz Ağlar (Wi-Fi)",
      "Ağ Topolojileri",
      "HTTP/HTTPS Protokolleri",
      "FTP, SMTP, POP3",
      "Ağ Güvenliği Temelleri"
    ]
  });
  console.log("✅ Ziraat BT - Ağlar eklendi");

  // Ziraat BT - İşletim Sistemleri
  await setDoc(doc(db, "subjects", "ziraat_bt_isletimsistemi"), {
    exam: "ziraat",
    level: "bt",
    name: "İşletim Sistemleri",
    topics: [
      "İşletim Sistemi Kavramı",
      "İşletim Sistemi Çeşitleri",
      "Process Yönetimi",
      "Thread Kavramı",
      "CPU Scheduling",
      "Process Synchronization",
      "Deadlock (Kilitlenme)",
      "Bellek Yönetimi",
      "Virtual Memory",
      "Paging ve Segmentation",
      "Disk Yönetimi",
      "File System",
      "I/O Yönetimi",
      "Windows İşletim Sistemleri",
      "Linux/Unix Temelleri",
      "Linux Komutları",
      "Shell Scripting",
      "Kullanıcı ve Yetki Yönetimi",
      "Sistem Güvenliği",
      "Backup Stratejileri"
    ]
  });
  console.log("✅ Ziraat BT - İşletim Sistemleri eklendi");

  // Ziraat BT - Yazılım Mühendisliği
  await setDoc(doc(db, "subjects", "ziraat_bt_yazilimmuh"), {
    exam: "ziraat",
    level: "bt",
    name: "Yazılım Mühendisliği",
    topics: [
      "Yazılım Geliştirme Yaşam Döngüsü",
      "Waterfall Model",
      "Agile Metodolojisi",
      "Scrum Framework",
      "Kanban",
      "DevOps Kavramı",
      "Gereksinim Analizi",
      "Yazılım Tasarım Prensipleri",
      "SOLID Prensipleri",
      "Design Patterns (Tasarım Desenleri)",
      "UML Diyagramları",
      "Use Case Diyagramı",
      "Class Diyagramı",
      "Sequence Diyagramı",
      "Yazılım Test Teknikleri",
      "Unit Testing",
      "Integration Testing",
      "Version Control (Git)",
      "CI/CD Pipeline",
      "Code Review",
      "Yazılım Kalite Metrikleri"
    ]
  });
  console.log("✅ Ziraat BT - Yazılım Mühendisliği eklendi");

  // Ziraat BT - Siber Güvenlik
  await setDoc(doc(db, "subjects", "ziraat_bt_siberguvenlik"), {
    exam: "ziraat",
    level: "bt",
    name: "Siber Güvenlik",
    topics: [
      "Bilgi Güvenliği Kavramları",
      "CIA Üçgeni (Confidentiality, Integrity, Availability)",
      "Kriptografi Temelleri",
      "Simetrik Şifreleme",
      "Asimetrik Şifreleme",
      "Hash Fonksiyonları",
      "Dijital İmza",
      "SSL/TLS Protokolleri",
      "Sertifika Yönetimi (PKI)",
      "Güvenlik Duvarları (Firewall)",
      "IDS/IPS Sistemleri",
      "Malware Türleri",
      "Virüs, Trojan, Worm, Ransomware",
      "Phishing Saldırıları",
      "DDoS Saldırıları",
      "SQL Injection",
      "XSS (Cross-Site Scripting)",
      "Güvenlik Testleri",
      "Penetration Testing",
      "Güvenlik Politikaları",
      "ISO 27001 Temelleri"
    ]
  });
  console.log("✅ Ziraat BT - Siber Güvenlik eklendi");

  // Ziraat BT - Bilgi Sistemleri
  await setDoc(doc(db, "subjects", "ziraat_bt_bilgisistemleri"), {
    exam: "ziraat",
    level: "bt",
    name: "Bilgi Sistemleri",
    topics: [
      "Bilgi Sistemleri Kavramı",
      "Bilgi Sistemleri Türleri",
      "Yönetim Bilgi Sistemleri (MIS)",
      "Karar Destek Sistemleri (DSS)",
      "Kurumsal Kaynak Planlaması (ERP)",
      "Müşteri İlişkileri Yönetimi (CRM)",
      "Tedarik Zinciri Yönetimi (SCM)",
      "İş Zekası (Business Intelligence)",
      "Veri Madenciliği",
      "Veri Ambarı (Data Warehouse)",
      "Big Data Kavramı",
      "Cloud Computing",
      "SaaS, PaaS, IaaS",
      "Sistem Analizi ve Tasarımı",
      "E-Ticaret Sistemleri",
      "Mobil Uygulama Sistemleri",
      "Web Tabanlı Sistemler",
      "API ve Web Servisleri",
      "Mikroservis Mimarisi",
      "Proje Yönetimi",
      "ITIL Temelleri"
    ]
  });
  console.log("✅ Ziraat BT - Bilgi Sistemleri eklendi");

  // Ziraat BT - KVKK
  await setDoc(doc(db, "subjects", "ziraat_bt_kvkk"), {
    exam: "ziraat",
    level: "bt",
    name: "KVKK ve Veri Güvenliği",
    topics: [
      "KVKK Kanunu Genel Bilgiler",
      "Kişisel Veri Kavramı",
      "Kişisel Verilerin İşlenmesi",
      "Açık Rıza",
      "Aydınlatma Yükümlülüğü",
      "Veri Sorumlusu",
      "Veri İşleyen",
      "İlgili Kişinin Hakları",
      "Kişisel Verileri Koruma Kurulu",
      "Veri Güvenliği Tedbirleri",
      "Teknik ve İdari Tedbirler",
      "Veri İhlali Bildirimi",
      "Veri Envanteri (VERBIS)",
      "Yurtdışına Veri Aktarımı",
      "KVKK İdari Yaptırımlar",
      "Kişisel Verilerin Silinmesi",
      "Veri Koruma Politikaları",
      "GDPR ile Karşılaştırma",
      "Bankacılıkta KVKK Uygulamaları",
      "Veri Sızıntısı Senaryoları"
    ]
  });
  console.log("✅ Ziraat BT - KVKK eklendi");
  // Ziraat Müfettişlik - Alan Bilgisi (Bilgisayar ve Yazılım Mühendisliği)
  await setDoc(doc(db, "subjects", "ziraat_mufettislik_alanbilgisi"), {
    exam: "ziraat",
    level: "mufettislik",
    name: "Alan Bilgisi (Bilgisayar ve Yazılım Mühendisliği)",
    topics: [
      "Veri Yapıları: Diziler, Bağlı Listeler, Yığıtlar, Kuyruklar, Ağaçlar",
      "Veri Yapıları: Graflar, Hash Tabloları, Heap'ler",
      "Algoritmalar: Zaman ve Alan Karmaşıklığı (Big-O vb.)",
      "Algoritmalar: Sıralama ve Arama Algoritmaları",
      "Algoritmalar: Graf Algoritmaları ve Tasarım Teknikleri",
      "Veri Tabanı: Temel Kavramlar, Anahtarlar ve Normalizasyon",
      "Veri Tabanı: SQL DDL, DML, DCL ve TCL",
      "Veri Tabanı: Gelişmiş SQL (Joins, Views, Triggers vb.)",
      "Veri Tabanı: İşlem Yönetimi (ACID) ve NoSQL",
      "Bilgisayar Ağları: Referans Modelleri (OSI, TCP/IP)",
      "Bilgisayar Ağları: Protokoller ve IP Adresleme",
      "Bilgisayar Ağları: Ağ Cihazları, Yönlendirme ve Topolojiler",
      "İşletim Sistemleri: İşlem Yönetimi ve İş Parçacığı (Thread)",
      "İşletim Sistemleri: CPU Çizelgeleme ve Senkronizasyon",
      "İşletim Sistemleri: Kördüğüm (Deadlock) ve Bellek Yönetimi",
      "İşletim Sistemleri: Dosya Sistemleri ve Sistem Mimarisi",
      "Yazılım Mühendisliği: OOP Prensipleri ve SOLID",
      "Yazılım Mühendisliği: Geliştirme Modelleri ve Tasarım Şablonları",
      "Yazılım Mühendisliği: Yazılım Testleri",
      "Siber Güvenlik: Güvenlik Temelleri ve Kriptografi",
      "Siber Güvenlik: Ağ Güvenliği ve Web Güvenliği",
      "Siber Güvenlik: Zararlı Yazılımlar ve Saldırı Türleri"
    ]
  });
  console.log("✅ Ziraat Müfettişlik - Alan Bilgisi eklendi");

  // Ziraat Müfettişlik - Yabancı Dil (İngilizce)
  await setDoc(doc(db, "subjects", "ziraat_mufettislik_ingilizce"), {
    exam: "ziraat",
    level: "mufettislik",
    name: "Yabancı Dil (İngilizce)",
    topics: [
      "Dil Bilgisi: Zamanlar (Tenses) ve Zaman Uyumu",
      "Dil Bilgisi: Kipler (Modals)",
      "Dil Bilgisi: Edilgen Çatı (Passive Voice) ve Ettirgen Yapılar",
      "Dil Bilgisi: Şart ve Dilek Cümleleri (Conditionals & Wish Clauses)",
      "Dil Bilgisi: Yabancı Cümlecikler (Relative & Noun Clauses)",
      "Dil Bilgisi: Bağlaçlar ve Geçişler (Conjunctions & Transitions)",
      "Dil Bilgisi: Edatlar, İsim-Fiiller, Mastarlar, Sıfat ve Zarflar",
      "Kelime Bilgisi: Akademik Kelimeler ve Phrasal Verbs",
      "Kelime Bilgisi: BT Terminolojisi ve İş İngilizcesi"
    ]
  });
  console.log("✅ Ziraat Müfettişlik - İngilizce eklendi");

  // Ziraat Müfettişlik - Genel Yetenek ve Genel Kültür
  await setDoc(doc(db, "subjects", "ziraat_mufettislik_gygk"), {
    exam: "ziraat",
    level: "mufettislik",
    name: "Genel Yetenek ve Genel Kültür",
    topics: [
      "Genel Yetenek: Matematiksel İşlemler",
      "Genel Yetenek: Denklemler ve Oran-Orantı",
      "Genel Yetenek: Problemler",
      "Genel Yetenek: Geometri",
      "Genel Yetenek: Sayısal Mantık",
      "Genel Yetenek: Sözel Mantık",
      "Genel Kültür: Tarih",
      "Genel Kültür: Coğrafya",
      "Genel Kültür: Vatandaşlık",
      "Genel Kültür: Güncel Bilgiler"
    ]
  });
  console.log("✅ Ziraat Müfettişlik - GYGK eklendi");
}


seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Seed hatası:", err);
    process.exit(1);
  });
