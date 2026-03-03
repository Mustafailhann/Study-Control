import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function StickyHeart({ note, updateNote, removeNote }) {
    const [text, setText] = useState(note.text);

    const handleTextChange = (e) => {
        setText(e.target.value);
        updateNote(note.id, { text: e.target.value });
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: note.x, y: note.y }}
            onDragEnd={(e, info) => {
                // We accumulate the drag offset to maintain position relative to Notebook space
                updateNote(note.id, {
                    x: note.x + info.offset.x,
                    y: note.y + info.offset.y
                });
            }}
            className="absolute top-0 left-0 z-50 flex items-center justify-center cursor-grab active:cursor-grabbing hover:z-[60]"
            style={{
                width: '180px',
                height: '180px',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="relative w-full h-full text-pink-400 drop-shadow-2xl transition-all flex items-center justify-center filter hover:brightness-110 group">
                <svg viewBox="0 0 24 24" fill="currentColor" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Not..."
                    className="relative z-10 w-28 h-24 bg-transparent text-white placeholder-white/80 text-center text-base leading-tight outline-none resize-none font-semibold overflow-hidden font-sans"
                    style={{ marginTop: '-16px' }} // Visually center inside the heart paths
                    spellCheck="false"
                />
                <button
                    onClick={(e) => { e.stopPropagation(); removeNote(note.id); }}
                    className="absolute top-4 right-4 z-20 text-white/50 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Bu notu sil"
                >
                    <X size={14} strokeWidth={3} />
                </button>
            </div>
        </motion.div>
    );
}
