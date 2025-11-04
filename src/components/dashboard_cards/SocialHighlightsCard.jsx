import React from 'react';

const SocialHighlightsCard = () => {
    return (
        <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-4 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-[#522320] mb-3 text-center">
                Social Highlights
            </h2>
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center text-[#522320] text-sm font-medium">
                    <span className="mr-2">You got</span>
                    <span className="font-bold text-base mx-1">3</span>
                    <span className="mx-1" role="img" aria-label="likes">❤️</span>
                    <span>and</span>
                    <span className="font-bold text-base mx-1">1</span>
                    <span className="mx-1" role="img" aria-label="comment">💬</span>
                </div>
                <div className="text-[#7b3f1c] text-xs font-semibold text-center">
                    on your <span className="font-semibold">Shayari</span> post
                </div>
            </div>
        </div>
    );
};

export default SocialHighlightsCard;