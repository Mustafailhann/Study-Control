import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import Page from './Page';
import StickyHeart from './StickyHeart';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Notebook() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    // Array of pages text. Index 0 is left page, Index 1 is right page, etc.
    const [pages, setPages] = useState([
        "", "",
        "", "",
        "", ""
    ]);

    const [notes, setNotes] = useState([
        { id: 1, x: 850, y: 150, text: "Odağını kaybetme!" } // Initial note placed near the pile
    ]);

    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimeoutRef = useRef(null);

    // Fetch initial data from Firebase
    useEffect(() => {
        const fetchNotebookData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const docRef = doc(db, 'users', user.uid, 'notebook', 'data');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.pages) setPages(data.pages);
                    if (data.notes) setNotes(data.notes);
                }
            } catch (error) {
                console.error("Not defteri verileri çekilirken hata oluştu:", error);
            } finally {
                setIsLoaded(true);
            }
        };

        // Wait a slight bit to ensure auth is initialized if it's acting slowly, 
        // though normally auth listener in App handles this. We just check current user.
        fetchNotebookData();
    }, []);

    // Save to Firebase (Debounced)
    useEffect(() => {
        // Don't save if we haven't loaded the initial data yet, to prevent overwriting with defaults
        if (!isLoaded) return;

        const user = auth.currentUser;
        if (!user) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'notebook', 'data');
                await setDoc(docRef, {
                    pages: pages,
                    notes: notes,
                    updatedAt: new Date()
                }, { merge: true }); // Use merge just in case
                console.log("Notebook saved to Firebase.");
            } catch (error) {
                console.error("Not defteri kaydedilirken hata:", error);
            }
        }, 1000); // Wait 1 second after last change before saving

        return () => clearTimeout(saveTimeoutRef.current);
    }, [pages, notes, isLoaded]);

    const updatePage = (index, value) => {
        const newPages = [...pages];
        newPages[index] = value;
        setPages(newPages);
    };

    const updateNote = (id, updates) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const removeNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const addNote = () => {
        const newId = Date.now();
        // Spaawn slightly offset from the pile button
        setNotes([...notes, { id: newId, x: 800 + Math.random() * 20, y: 200 + Math.random() * 20, text: "" }]);
    };

    const nextPage = () => {
        if ((currentPage + 1) * 2 < pages.length) {
            setCurrentPage(currentPage + 1);
        } else {
            setPages([...pages, "", ""]);
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-40px)] flex items-center justify-center p-8 bg-transparent relative">
            <div className="relative w-[1040px] h-[660px] flex items-center justify-start">

                {/* Post-it pile on the right side */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10"
                        >
                            <div className="h-28 flex items-center justify-center mb-2">
                                <div className="text-sm font-semibold text-purple-700/80 rotate-90 tracking-widest whitespace-nowrap">
                                    KALP NOTLAR
                                </div>
                            </div>
                            <button
                                onClick={addNote}
                                className="relative w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(236,72,153,0.5)] hover:bg-pink-400 hover:scale-110 active:scale-95 transition-all cursor-pointer text-white overflow-visible"
                                title="Yeni Kalp Notu Ekle"
                            >
                                {/* Heart Icon Background */}
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 opacity-40 absolute">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <Plus size={24} className="z-10" strokeWidth={3} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notebook Container */}
                <div style={{ perspective: '2000px' }} className="w-[900px] h-[600px] relative">
                    <AnimatePresence mode="wait">
                        {!isOpen ? (
                            <motion.div
                                key="cover"
                                className="absolute inset-0 bg-gradient-to-br from-[#4c1d95] via-[#2e1065] to-[#0f172a] rounded-r-2xl rounded-l-md shadow-[20px_20px_40px_rgba(0,0,0,0.4)] cursor-pointer flex flex-col items-center justify-center text-white origin-left hover:brightness-110 transition-all border-l-[16px] border-[#3b0764] ring-1 ring-white/10"
                                onClick={() => setIsOpen(true)}
                                exit={{ rotateY: -100, opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
                                style={{ transformStyle: 'preserve-3d', zIndex: 40 }}
                            >
                                <div className="w-64 h-80 border-4 border-white/20 rounded-2xl flex items-center justify-center flex-col gap-8 bg-white/5 backdrop-blur-md shadow-inner">
                                    <span className="text-8xl drop-shadow-xl">📓</span>
                                    <div className="flex flex-col items-center">
                                        <h1 className="text-4xl font-extrabold tracking-widest mb-2 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-300">NOTLARIM</h1>
                                        <div className="h-1.5 w-16 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
                                    </div>
                                </div>
                                <motion.p
                                    className="mt-14 text-purple-200/60 text-sm tracking-widest uppercase font-medium"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Açmak için tıkla
                                </motion.p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pages"
                                className="absolute inset-0 flex bg-[#faf7f0] rounded-xl shadow-[10px_10px_30px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-300 ring-4 ring-white"
                                initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                {/* Left Page */}
                                <Page
                                    content={pages[currentPage * 2]}
                                    onChange={(e) => updatePage(currentPage * 2, e.target.value)}
                                    isLeft={true}
                                />

                                {/* Center Binding Ring Simulation */}
                                <div className="w-12 h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 shrink-0 shadow-inner z-20 flex flex-col justify-evenly items-center relative border-x border-gray-300">
                                    <div className="absolute inset-y-0 w-px bg-black/10 left-1/2 -translate-x-1/2 shadow-[1px_0_2px_rgba(255,255,255,0.8)]"></div>
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className="flex w-full px-1 items-center justify-between z-10">
                                            <div className="w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-500/30"></div>
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 shadow-sm rounded-sm"></div>
                                            <div className="w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-500/30"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Page */}
                                <Page
                                    content={pages[currentPage * 2 + 1]}
                                    onChange={(e) => updatePage(currentPage * 2 + 1, e.target.value)}
                                    isLeft={false}
                                />

                                {/* Page Controls Center Bottom */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 bg-white/90 px-6 py-2 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] backdrop-blur-md border border-gray-100">
                                    <button onClick={prevPage} disabled={currentPage === 0} className="p-1.5 rounded-full hover:bg-purple-100 text-purple-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                        <ChevronLeft size={20} strokeWidth={2.5} />
                                    </button>
                                    <span className="text-sm font-bold text-gray-500 tracking-widest whitespace-nowrap">
                                        {currentPage * 2 + 1} / {currentPage * 2 + 2}
                                    </span>
                                    <button onClick={nextPage} className="p-1.5 rounded-full hover:bg-purple-100 text-purple-600 transition-colors">
                                        <ChevronRight size={20} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Close Button Top Right */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2 z-30 transition-colors bg-white/50 rounded-full hover:bg-red-50 backdrop-blur-sm"
                                    title="Kapat"
                                >
                                    <X size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Draggable Sticky Notes */}
                    {isOpen && notes.map(note => (
                        <StickyHeart
                            key={note.id}
                            note={note}
                            updateNote={updateNote}
                            removeNote={removeNote}
                        />
                    ))}

                </div>
            </div>
        </div>
    );
}
