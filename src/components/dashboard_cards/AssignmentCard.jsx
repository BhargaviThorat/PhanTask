import React from 'react'
import { Link } from 'react-router-dom';

const AssignmentCard = () => {

    const assignments = [
        { date: '02 Jul', subject: 'Biology' },
        { date: '03 Jul', subject: 'Physics' },
        { date: '04 Jul', subject: 'Chemistry' },
    ];

    return (
        <div className="w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-3 shadow-md shadow-[#522320]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#522320]/30 hover:-translate-y-0.5 flex flex-col">
            <span className='w-full h-full flex flex-col justify-between'>
                <h2 className="h-10 text-lg font-semibold py-1 text-[#522320] text-center">Pending Assignments</h2>

                {(assignments.length != 0) ?
                    <main className='w-full overflow-y-auto'>
                        <table className="w-full border-collapse text-[#522320]">
                            <thead>
                                <tr className="border-b border-[#c8a07e]">
                                    <th className="py-2 text-center text-sm">Date</th>
                                    <th className="py-2 text-center text-sm">Subject</th>
                                    <th className="py-2 text-center text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(({ date, subject }, idx) => (
                                    <tr key={idx} className={`${idx !== assignments.length - 1 ? 'border-b border-[#c8a07e]' : ''}`}>
                                        <td className="text-sm font-medium text-center py-2">{date}</td>
                                        <td className="text-sm font-medium text-center py-2">{subject}</td>
                                        <td className="text-center py-2">
                                            <button className="bg-[#801e1e] text-[#fff1f0] px-3 py-1 rounded-lg text-xs shadow-md shadow-[#801e1e]/30 hover:bg-[#662924] hover:shadow-lg hover:shadow-[#801e1e]/40 active:bg-[#522320] transition-all duration-200">
                                                Submit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </main> :
                    <main className='w-full h-full flex items-center justify-center'>
                        😀You are all caught up! <br />
                        No Pending Assignments
                    </main>
                }

                {(assignments.length != 0) && <Link to={'/assignments'}>
                    <button className="w-full text-center hover:rounded-xl text-[#42260b] text-sm font-medium mt-1 py-2 hover:bg-red-100">
                        View all
                    </button>
                </Link>}
            </span>
        </div>
    )
}

export default AssignmentCard