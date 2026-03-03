import React from 'react';

export default function Page({ content, onChange, isLeft }) {
    return (
        <div className={`w-1/2 h-full bg-[#faf7f0] relative flex flex-col overflow-hidden ${isLeft ? 'rounded-l-xl' : 'rounded-r-xl'}`}>
            {/* Lined paper pattern (starts from top 0) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)',
                    backgroundSize: '100% 32px',
                    marginTop: '32px' // offset from top exactly by 32px
                }}
            ></div>

            {/* Classic double red margin line */}
            <div className={`absolute top-0 bottom-0 ${isLeft ? 'left-12' : 'left-10'} w-px bg-red-400 opacity-40 pointer-events-none`}></div>
            <div className={`absolute top-0 bottom-0 ${isLeft ? 'left-14' : 'left-12'} w-px bg-red-400 opacity-40 pointer-events-none`}></div>

            {/* The textarea for writing */}
            <div className={`h-full absolute inset-0 pt-[32px] pb-[32px] ${isLeft ? 'pl-[4.5rem] pr-6' : 'pl-[4rem] pr-8'} z-10 font-[cursive] text-lg text-slate-700`}>
                <textarea
                    value={content}
                    onChange={onChange}
                    className="w-full h-full bg-transparent outline-none resize-none leading-[32px] scrollbar-thin scrollbar-thumb-slate-300"
                    placeholder="Buraya notlarını yazabilirsin..."
                    spellCheck="false"
                    style={{ paddingTop: '5px' }} // Tiny visual adjustment so baseline hits the blue line perfectly
                />
            </div>
        </div>
    );
}
