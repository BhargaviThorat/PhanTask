import React from 'react';
import { Link } from 'react-router-dom';

const FeedbackSummaryCard = () => {
  // Example data for feedback form statuses
  const feedbackStatus = [
    { type: 'Submitted', count: 8 },
    { type: 'Pending', count: 2 },
  ];

  return (
    <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-4 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-md hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col">
      <span className='w-full h-full flex flex-col'>

        <h2 className="text-lg font-semibold text-[#522320] mb-4 text-center">
          Feedback Summary
        </h2>

        <main className='w-full h-full flex flex-col justify-center items-center'>
          <ul className="w-full space-y-3 flex-1">
            {feedbackStatus.map(({ type, count }) => (
              <li key={type} className="flex justify-between items-center text-[#522320] text-sm font-medium">
                <span>{type} Forms</span>
                <span className={`font-bold px-3 py-1.5 rounded-full text-sm ${type === 'Pending' ? 'bg-red-600 text-[#fff1f0]' : 'bg-green-600 text-white'
                  }`}>
                  {count}
                </span>
              </li>
            ))}
          </ul>

          <a className='w-full' target='_black' href="https://actsfeedback.cdac.in/feedbackSystem">
            <Link to={'/feedback'}>
              <button className="w-full text-center hover:rounded-xl text-[#42260b] text-sm font-medium mt-1 py-2 hover:bg-red-100">
                View Pending
              </button>
            </Link>
          </a>
        </main>
      </span>
    </div>
  );
};

export default FeedbackSummaryCard;