import React from 'react';
import { Chart } from 'react-google-charts';

const AttendanceCard = ({ attendancePercentage }) => {

    const getHoverBorderColor = () => {
        if (attendancePercentage >= 85) return 'border-green-500 shadow-green-300/30 hover:shadow-green-400/40';
        if (attendancePercentage >= 75) return 'border-yellow-500 shadow-yellow-300/30 hover:shadow-yellow-400/40';
        return 'border-red-500 shadow-red-300/30 hover:shadow-red-400/40';
    };

    const data = [
        ['Status', 'Percentage'],
        ['Present', attendancePercentage],
        ['Absent', 100 - attendancePercentage],
    ];

    const getPieSliceColor = () => {
        if (attendancePercentage >= 85) return '#4CAF50'; // green
        if (attendancePercentage >= 75) return '#FFD600'; // yellow
        return '#D32F2F'; // red
    };

    const options = {
        pieHole: 0.75,
        pieSliceText: 'none',
        legend: 'none',
        tooltip: { trigger: 'none' },
        slices: {
            0: { color: getPieSliceColor() },
            1: { color: '#E6F4EA' }, // Cream absent slice
        },
        chartArea: {
            width: '100%',
            height: '100%',
        },
        pieStartAngle: 0,
        backgroundColor: 'transparent',
    };

    const getTextColor = () => {
        if (attendancePercentage >= 85) return 'text-green-700';
        if (attendancePercentage >= 75) return 'text-yellow-500';
        return 'text-red-700';
    };

    return (
        <div
            className={`w-full h-full rounded-xl border-2 border-[#522320] bg-[#ffffff] p-4 shadow-md shadow-[#522320]/20 flex flex-col items-center justify-center transition-all duration-300 hover:border-2 hover:${getHoverBorderColor()} hover:shadow-md hover:-translate-y-0.5`}
        >
            <span className='w-full h-full flex flex-col justify-between items-center'>

                <h2 className="text-lg text-center font-semibold text-[#522320] mb-4 tracking-tight">
                    Attendance
                </h2>

                <div className="relative w-40 h-40 mb-3">
                    <Chart
                        chartType="PieChart"
                        data={data}
                        options={options}
                        width="100%"
                        height="100%"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${getTextColor()}`}>
                            {attendancePercentage}%
                        </span>
                    </div>
                </div>

                <p
                    className={`text-xs font-medium text-center ${attendancePercentage >= 85
                        ? 'text-green-700'
                        : attendancePercentage >= 75
                            ? 'text-yellow-500'
                            : 'text-red-700'
                        }`}
                >
                    {attendancePercentage >= 85
                        ? 'Great! Your attendance is above 85%'
                        : attendancePercentage >= 75
                            ? 'Warning: Attendance between 75% and 85%'
                            : 'Alert: Your attendance is below 75%'}
                </p>
            </span>
        </div>
    );
};

export default AttendanceCard;