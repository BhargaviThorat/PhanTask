// src/components/PhanAI.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, X, Loader2 } from "lucide-react";
import mascot from "../assets/Mascot-Phantask.png";
import { useAuth } from "../context/AuthContext";

const PhanAI = () => {
    const { user } = useAuth();

    const [messages, setMessages] = useState([
        {
            id: 1,
            text:
                "Hi! 👋 I'm your PhanAI (PhanTask assistant) for your personalised organisation management.\n\nI can help you with:\n• Schedule & meetings\n• Tasks & workloads\n• Attendance & activity\n• Notices & updates\n\nWhat would you like to do?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setIsOpen(false);
        }, 200);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isLoading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isLoading]);

    const formatTimeIST = (date) =>
        date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        }); // [web:42][web:53]

    const getIntelligentResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        if (
            lowerMessage.includes("schedule") ||
            lowerMessage.includes("timetable") ||
            lowerMessage.includes("meeting") ||
            lowerMessage.includes("calendar")
        ) {
            return `📅 Schedule

Use the Schedule module to see upcoming classes, meetings or events for your organisation.

• Open Dashboard → Schedule
• Switch between day / week views
• Click any item to see timing, room and owner`;
        }

        if (
            lowerMessage.includes("task") ||
            lowerMessage.includes("assignment") ||
            lowerMessage.includes("work") ||
            lowerMessage.includes("todo")
        ) {
            return `✅ Tasks

Use the Tasks section to manage work items across your organisation.

• Dashboard → Assigned Tasks
• See title, priority and due date
• Mark items complete or update status
• Filter by project, owner or due date`;
        }

        if (
            lowerMessage.includes("attendance") ||
            lowerMessage.includes("present") ||
            lowerMessage.includes("absent")
        ) {
            return `📊 Attendance

The Attendance card gives a quick view of presence across days or sessions.

• Dashboard → Attendance
• See percentage and trend over time
• Drill down to dates or members if enabled by admin`;
        }

        if (
            lowerMessage.includes("notice") ||
            lowerMessage.includes("announcement") ||
            lowerMessage.includes("update")
        ) {
            return `📢 Notices

Use the Notice Board to broadcast and read organisation‑wide updates.

• Dashboard → Notice Board
• See latest important messages first
• Filter by category or team if available`;
        }

        return `PhanAI (PhanTask Assistant)

This assistant is designed for your personalized organisation management.

You can ask things like:
• “Show schedule options”
• “How do I track tasks?”
• “Explain attendance card”
• “Where can I see notices?”

What would you like help with?`;
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        await new Promise((resolve) =>
            setTimeout(resolve, 800 + Math.random() * 700)
        );

        const botMessage = {
            id: messages.length + 2,
            text: getIntelligentResponse(currentInput),
            sender: "bot",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);

        if (inputRef.current) inputRef.current.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { label: "Schedule", query: "Show schedule options" },
        { label: "Tasks", query: "Show my tasks" },
        { label: "Attendance", query: "Explain attendance card" },
        { label: "Notices", query: "Show latest notices" },
    ];

    const handleQuickAction = (query) => {
        setInput(query);
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <>
            {!isOpen && (
                <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-full shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-105 active:scale-95"
                        aria-label="Open assistant"
                    >
                        <Bot size={22} />
                    </button>
                </div>
            )}

            {isOpen && (
                <div className=" fixed bottom-2 right-2 left-2 md:left-auto md:bottom-6 md:right-6 z-50 flex justify-end">
                    <div
                        className={`w-full max-w-xl h-[95vh] md:h-[95vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-900 flex flex-col overflow-hidden origin-bottom-right transform transition-all duration-300 ease-out ${isClosing
                                ? "animate-[chat-close_0.2s_ease-in_forwards]"
                                : "animate-[chat-open_0.3s_ease-out]"
                            }`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-5 py-4 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/30 p-2.5 rounded-2xl">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">PhanAI (PhanTask Assistant)</h3>
                                    <p className="text-xs opacity-90">
                                        For personalized organisation management
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="hover:bg-red-900 p-2 rounded-xl transition-all "
                                aria-label="Close assistant"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Quick actions */}
                        {messages.length === 1 && (
                            <div className="px-5 py-3 bg-gradient-to-b from-amber-50 to-orange-50 border-b border-amber-100">
                                <p className="text-xs md:text-sm font-semibold text-center text-amber-800 mb-2">
                                    Quick actions
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickAction(action.query)}
                                            className="text-xs md:text-sm bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-orange-50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                        }`}
                                >
                                    <div
                                        className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center shadow-md ${msg.sender === "bot"
                                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                            }`}
                                    >
                                        {msg.sender === "bot" ? (
                                            <Bot size={16} />
                                        ) : (
                                            <img
                                                src={user?.profilePic || mascot}
                                                alt="User avatar"
                                                className="w-full h-full rounded-2xl object-cover"
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm ${msg.sender === "bot"
                                                ? "bg-white/95 border border-amber-100 text-gray-800"
                                                : "bg-gradient-to-r from-orange-500 to-red-500 text-white border border-orange-400/60"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                        <p
                                            className={`text-[10px] mt-1 ${msg.sender === "bot"
                                                    ? "text-amber-600"
                                                    : "text-orange-100/90"
                                                }`}
                                        >
                                            {formatTimeIST(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white/95 border border-amber-100 rounded-2xl px-3 py-2.5 shadow-sm">
                                        <Loader2
                                            size={18}
                                            className="animate-spin text-amber-500 mx-auto"
                                        />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 bg-white/95 border-t border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about schedule, tasks, attendance..."
                                    disabled={isLoading}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] text-amber-600 mt-1 text-center">
                                PhanTask organisation assistant
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PhanAI;
