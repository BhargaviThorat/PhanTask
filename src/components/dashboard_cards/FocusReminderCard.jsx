import React from 'react';

const FocusReminderCard = () => {
    return (
        <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-4 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-md hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-[#522320] mb-2 text-center">
                Focus Reminder
            </h2>
            <p className="text-[#522320] text-sm text-center mb-4">
                Let's boost your productivity! Start a focus session now.
            </p>
            <button className="bg-[#801e1e] text-[#fff1f0] px-5 py-2 rounded-lg shadow-md shadow-[#801e1e]/20 hover:bg-[#662924] hover:shadow-lg hover:shadow-[#801e1e]/30 active:bg-[#522320] font-semibold text-sm transition-all duration-200">
                Start Focus Session
            </button>
        </div>
    );
};

export default FocusReminderCard;