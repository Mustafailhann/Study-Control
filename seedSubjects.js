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
  // TYT Matematik
  await setDoc(doc(db, "subjects", "yks_tyt_matematik"), {
    exam: "yks",
    level: "tyt",
    name: "Matematik",
    topics: [
      "Temel Kavramlar",
      "Sayı Basamakları",
      "Bölme ve Bölünebilme",
      "Asal Sayılar",
      "EBOB – EKOK",
      "Rasyonel Sayılar",
      "Basit Eşitsizlikler",
      "Mutlak Değer",
      "Üslü Sayılar",
      "Köklü Sayılar",
      "Oran – Orantı",
      "Denklemler",
      "Problemler (Sayı)",
      "Problemler (Yaş)",
      "Problemler (Hız)",
      "Problemler (Yüzde – Kar – Zarar)",
      "Kümeler",
      "Fonksiyonlara Giriş",
      "Permütasyon – Kombinasyon",
      "Olasılık",
      "İstatistik"
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
      "Temel Kavramlar",
      "Açılar",
      "Üçgenler",
      "Dik Üçgen ve Trigonometri",
      "Özel Üçgenler",
      "Çokgenler",
      "Dörtgenler",
      "Eşlik ve Benzerlik",
      "Çember ve Daire",
      "Analitik Geometri"
    ]
  });
  console.log("✅ TYT Geometri eklendi");

  // TYT Fizik
  await setDoc(doc(db, "subjects", "yks_tyt_fizik"), {
    exam: "yks",
    level: "tyt",
    name: "Fizik",
    topics: [
      "Fizik Bilimine Giriş",
      "Madde ve Özellikleri",
      "Hareket",
      "Newton'un Hareket Yasaları",
      "Basınç",
      "Kaldırma Kuvveti",
      "Dalgalar",
      "Optik",
      "Elektrostatik",
      "Elektrik ve Manyetizma"
    ]
  });
  console.log("✅ TYT Fizik eklendi");

  // TYT Kimya
  await setDoc(doc(db, "subjects", "yks_tyt_kimya"), {
    exam: "yks",
    level: "tyt",
    name: "Kimya",
    topics: [
      "Kimya Bilimi",
      "Atom ve Periyodik Sistem",
      "Kimyasal Türler Arası Etkileşimler",
      "Maddenin Halleri",
      "Doğa ve Kimya",
      "Karışımlar",
      "Kimyasal Tepkimeler",
      "Asitler, Bazlar ve Tuzlar"
    ]
  });
  console.log("✅ TYT Kimya eklendi");

  // TYT Biyoloji
  await setDoc(doc(db, "subjects", "yks_tyt_biyoloji"), {
    exam: "yks",
    level: "tyt",
    name: "Biyoloji",
    topics: [
      "Yaşam Bilimi Biyoloji",
      "Hücre",
      "Canlıların Sınıflandırılması",
      "Mitoz ve Mayoz Bölünme",
      "Kalıtım",
      "Ekosistem Ekolojisi",
      "Güncel Çevre Sorunları"
    ]
  });
  console.log("✅ TYT Biyoloji eklendi");

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
      "Temel Kavramlar ve Fonksiyonlar",
      "Polinomlar",
      "İkinci Dereceden Denklemler",
      "Permütasyon ve Kombinasyon",
      "Olasılık",
      "Karmaşık Sayılar",
      "Logaritma",
      "Diziler",
      "Limit ve Süreklilik",
      "Türev",
      "İntegral",
      "Trigonometri",
      "Analitik Geometri"
    ]
  });
  console.log("✅ AYT Matematik eklendi");

  // AYT Fizik
  await setDoc(doc(db, "subjects", "yks_ayt_fizik"), {
    exam: "yks",
    level: "ayt",
    name: "Fizik",
    topics: [
      "Elektrik ve Manyetizma",
      "Elektriksel Kuvvet ve Alan",
      "Elektriksel Potansiyel",
      "Kondansatörler",
      "Elektrik Akımı",
      "Manyetizma",
      "Elektromanyetik İndüklenme",
      "Alternatif Akım",
      "Çembersel Hareket",
      "Basit Harmonik Hareket",
      "Dalga Mekaniği",
      "Atom Fiziği",
      "Modern Fizik"
    ]
  });
  console.log("✅ AYT Fizik eklendi");

  // AYT Kimya
  await setDoc(doc(db, "subjects", "yks_ayt_kimya"), {
    exam: "yks",
    level: "ayt",
    name: "Kimya",
    topics: [
      "Modern Atom Teorisi",
      "Gazlar",
      "Sıvı Çözeltiler ve Çözünürlük",
      "Kimyasal Tepkimelerde Enerji",
      "Kimyasal Tepkimelerde Hız",
      "Kimyasal Tepkimelerde Denge",
      "Asit Baz Dengeleri",
      "Çözünürlük Dengeleri",
      "Elektrokimya",
      "Nükleeer Kimya",
      "Organik Kimya",
      "Enerji Kaynakları ve Bilimsel Gelişmeler"
    ]
  });
  console.log("✅ AYT Kimya eklendi");

  // AYT Biyoloji
  await setDoc(doc(db, "subjects", "yks_ayt_biyoloji"), {
    exam: "yks",
    level: "ayt",
    name: "Biyoloji",
    topics: [
      "Komünite ve Popülasyon Ekolojisi",
      "Canlıların Sınıflandırılması",
      "Bitki Biyolojisi",
      "Hayvan Biyolojisi",
      "İnsan Fizyolojisi",
      "Duyu Organları",
      "Destek ve Hareket Sistemi",
      "Sinir Sistemi",
      "Endokrin Sistem",
      "Dolaşım Sistemi",
      "Solunum Sistemi",
      "Sindirim Sistemi",
      "Boşaltım Sistemi",
      "Üreme Sistemi",
      "Kalıtım",
      "Canlılarda Enerji Dönüşümleri"
    ]
  });
  console.log("✅ AYT Biyoloji eklendi");

  // AYT Edebiyat
  await setDoc(doc(db, "subjects", "yks_ayt_edebiyat"), {
    exam: "yks",
    level: "ayt",
    name: "Türk Dili ve Edebiyatı",
    topics: [
      "Edebiyat Tarihi",
      "İslam Öncesi Türk Edebiyatı",
      "İslam Etkisinde Türk Edebiyatı",
      "Divan Edebiyatı",
      "Halk Edebiyatı",
      "Tanzimat Dönemi Edebiyatı",
      "Servet-i Fünun Edebiyatı",
      "Fecr-i Ati Edebiyatı",
      "Milli Edebiyat",
      "Cumhuriyet Dönemi Edebiyatı",
      "Yeni Türk Edebiyatı",
      "Modern ve Postmodern Edebiyat",
      "Dil Bilgisi",
      "Ses Bilgisi",
      "Sözcük Bilgisi",
      "Cümle Bilgisi"
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
}


seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Seed hatası:", err);
    process.exit(1);
  });
