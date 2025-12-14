import React from 'react';

const LoadingSkeleton = ({
    titleHeight = "h-10",
    rows = 3,
    rowHeight = "h-10",
    hasButton = true,
    className = ""
}) => {
    return (
        <div className={`w-full h-full rounded-xl bg-[#ffffff] p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col animate-pulse ${className}`}>
            <span className='w-full h-full flex flex-col justify-between'>
                {/* Title skeleton */}
                <div className={`${titleHeight} bg-[#f3f4f6] rounded mb-4`}></div>

                {/* Rows skeleton */}
                <main className='w-full overflow-y-auto space-y-3 flex-1'>
                    {Array.from({ length: rows }).map((_, idx) => (
                        <div key={idx} className={`${rowHeight} bg-[#f3f4f6] rounded`}></div>
                    ))}
                </main>

                {/* Button skeleton */}
                {hasButton && <div className="h-10 bg-[#f3f4f6] rounded mt-1"></div>}
            </span>
        </div>
    );
};

export default LoadingSkeleton;
