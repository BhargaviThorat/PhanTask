import React from 'react';

const notices = [
  { id: 1, date: '25 Oct', message: 'Library will be closed this Friday.' },
  { id: 2, date: '25 Oct', message: 'Lost & Found: Blue backpack at reception.' },
  { id: 3, date: '24 Oct', message: 'Annual Sports registrations open now!' },
  { id: 4, date: '24 Oct', message: 'Annual Sports registrations open now!' },
  { id: 5, date: '24 Oct', message: 'Annual Sports registrations open now!' },
  { id: 6, date: '24 Oct', message: 'Annual Sports registrations open now!' },
];

const NoticeBoardCard = () => {
  return (
    <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col">
      <span className='w-full h-full flex flex-col'>

        <h2 className="w-full text-lg font-semibold text-[#522320] mb-3 text-center">
          Notice Board
        </h2>

        <main className='w-full overflow-y-auto'>
          <ul className="w-full flex flex-col gap-2">
            {notices.map(notice => (
              <li key={notice.id} className="flex items-center">
                <span className="text-sm text-[#73462a] font-medium w-20 text-center flex-shrink-0">{notice.date}</span>
                <span className="ml-3 text-sm text-[#522320]">{notice.message}</span>
              </li>
            ))}
          </ul>
        </main>
      </span>
    </div>
  );
};

export default NoticeBoardCard;