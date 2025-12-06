import React from 'react'

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2 } from 'lucide-react';

const function SocialHub() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm your student app assistant. I can help you with:\n\n📅 Class Schedule\n✅ Task Manager\n🍽️ Canteen & Mess Payments\n📞 Helpline\n\nWhat would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getIntelligentResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Schedule related queries
    if (lowerMessage.includes('schedule') || lowerMessage.includes('timetable') || lowerMessage.includes('class') || lowerMessage.includes('timing') || lowerMessage.includes('when')) {
      return `📅 **Class Schedule Feature**

To view your schedule:
1. Tap on the "Schedule" tab from the home screen
2. You'll see your daily timetable with:
   - Class timings
   - Subject names
   - Room numbers
   - Faculty names
   - Class duration

**Features:**
✅ Weekly view - See entire week at a glance
✅ Daily view - Focus on today's classes
✅ Color-coded subjects for easy identification
✅ Notifications 15 minutes before each class
✅ Offline access - View even without internet

**Tips:**
- Swipe left/right to change days
- Tap on any class for detailed information
- Set custom reminders for important classes

Your schedule is automatically synced from the college system. Need help finding a specific class?`;
    }
    
    // Task manager queries
    if (lowerMessage.includes('task') || lowerMessage.includes('assignment') || lowerMessage.includes('homework') || lowerMessage.includes('todo') || lowerMessage.includes('submit') || lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
      return `✅ **Task Manager**

To manage your tasks:
1. Go to "Task Manager" from the main menu
2. View all your tasks with:
   - Subject name
   - Task title
   - Due date & time
   - Completion status
   - Priority level (High/Medium/Low)

**Track Your Progress:**
📌 Pending - Tasks not yet started
⏳ In Progress - Currently working on
✅ Completed - Finished tasks
⚠️ Overdue - Missed deadline

**Features:**
- Add new tasks manually
- Upload task submissions directly through the app
- Get reminders 24 hours before deadline
- View submission history
- Check teacher feedback and grades
- Filter by subject or date
- Set personal deadlines

**Quick Actions:**
- Mark task as complete
- Set custom reminders
- Add notes and attachments
- Create subtasks for complex assignments

Need help managing a task or checking deadlines?`;
    }
    
    // Canteen and mess payment queries
    if (lowerMessage.includes('canteen') || lowerMessage.includes('mess') || lowerMessage.includes('food') || lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('bill') || lowerMessage.includes('charges') || lowerMessage.includes('fee')) {
      return `🍽️ **Canteen & Mess Payment**

Managing your food payments is easy!

**View Your Mess Bill:**
1. Tap on "Canteen/Mess" section
2. See your current month's charges:
   - Daily meal charges
   - Total amount due
   - Payment due date
   - Previous payments history

**Payment Methods:**
💳 Credit/Debit Card
📱 UPI (Google Pay, PhonePe, Paytm)
🏦 Net Banking
💰 Wallet (if enabled)

**How to Pay:**
1. Go to "Mess Payments"
2. Review your bill
3. Select payment method
4. Confirm and pay
5. Get instant payment receipt via email/SMS

**Mess Menu:**
- View daily menu
- Check meal timings
- See nutritional information
- Rate your meal experience

**Features:**
✅ Auto-calculated monthly charges
✅ Meal-wise breakdown
✅ Payment reminders before due date
✅ Digital receipts for all transactions
✅ Payment history with download option

Your mess charges are updated daily. Current balance will be shown on the home screen. Need help with a payment or have a billing query?`;
    }
    
    // Helpline queries
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('issue') || lowerMessage.includes('problem') || lowerMessage.includes('complaint') || lowerMessage.includes('concern') || lowerMessage.includes('query') || lowerMessage.includes('contact') || lowerMessage.includes('raise') || lowerMessage.includes('ticket')) {
      return `📞 **Helpline**

Need help? We're here for you!

**Raise a Concern:**
1. Tap on "Helpline" or "Help Center"
2. Select category:
   - 📱 Technical Issues (App problems, login issues)
   - 📚 Academic Support (Class, tasks, faculty)
   - 🍽️ Mess/Canteen (Food quality, billing)
   - 🏠 Hostel Issues (Room, facilities)
   - 💰 Payment Problems (Failed transactions, refunds)
   - 📋 General Queries

3. Describe your concern in detail
4. Attach screenshots if needed
5. Submit and get a ticket number

**Track Your Request:**
- View all your raised tickets
- Check resolution status
- Get real-time updates
- Chat with support team
- Rate the support received

**Response Time:**
🔴 Critical issues: Within 2 hours
🟡 Medium priority: 24 hours
🟢 General queries: 48 hours

**Direct Contact:**
📧 Email: support@college.edu
📱 Phone: +91-1234-567-890
⏰ Hours: Monday-Saturday, 9 AM - 6 PM

**Emergency Helpline:** +91-1234-567-999 (24/7)

Your satisfaction is our priority! Have a specific issue you'd like to report?`;
    }
    
    // Navigation and general app usage
    if (lowerMessage.includes('how to use') || lowerMessage.includes('navigate') || lowerMessage.includes('feature') || lowerMessage.includes('where is') || lowerMessage.includes('find')) {
      return `📱 **Using Your Student App**

**Main Features:**

1️⃣ **Schedule** - View your daily/weekly timetable
2️⃣ **Task Manager** - Manage and submit tasks/assignments
3️⃣ **Mess Payments** - Pay canteen and mess bills
4️⃣ **Helpline** - Raise concerns and get help

**Navigation Tips:**
- Use the bottom navigation bar for quick access
- Dashboard shows today's overview
- Swipe for more options in each section
- Use search icon to find specific information

**Notifications:**
🔔 Class reminders
✅ Task due dates
💰 Payment reminders
📢 Important announcements

**Settings:**
- Update profile information
- Change notification preferences
- Set custom reminders
- Manage payment methods

Which specific feature would you like to explore?`;
    }
    
    // Login and account queries
    if (lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('forgot') || lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      return `🔐 **Account & Login Help**

**Login Issues:**
- Use your Student ID as username
- Default password is your date of birth (DDMMYYYY)
- Change password after first login

**Forgot Password?**
1. Click "Forgot Password" on login screen
2. Enter your Student ID
3. Verify with registered email/phone
4. Set new password

**Update Profile:**
- Go to Settings → Profile
- Update contact details
- Add emergency contact
- Upload profile picture

**Security Tips:**
✅ Change default password immediately
✅ Don't share credentials
✅ Logout from shared devices
✅ Enable fingerprint/face ID

Need help accessing your account?`;
    }
    
    // Notification queries
    if (lowerMessage.includes('notification') || lowerMessage.includes('reminder') || lowerMessage.includes('alert')) {
      return `🔔 **Notifications & Reminders**

**You receive notifications for:**
📅 Classes starting in 15 minutes
✅ Task deadlines (24 hours before)
💰 Mess payment due dates
📢 Important college announcements
✅ Task submission confirmations
💳 Payment successful alerts

**Manage Notifications:**
1. Go to Settings → Notifications
2. Toggle on/off for each type
3. Set custom reminder times
4. Choose notification sound

**Custom Reminders:**
- Set for specific classes
- Create task reminders
- Payment deadline alerts

All notifications appear on your dashboard and in the notification center. You can also enable email notifications from settings.`;
    }
    
    // Payment related issues
    if (lowerMessage.includes('failed') || lowerMessage.includes('refund') || lowerMessage.includes('transaction') || lowerMessage.includes('money')) {
      return `💰 **Payment Issues**

**Payment Failed?**
Don't worry! Here's what to do:

1. Check if money was deducted from your account
2. Go to "Payment History" to verify
3. If deducted but not reflected:
   - Wait 30 minutes for auto-update
   - Still not updated? Raise a helpline ticket

**Refund Process:**
- Refunds processed within 5-7 business days
- Track refund status in "Transactions"
- Get notification when refund is processed

**Payment Issues:**
- Keep transaction ID/screenshot
- Note exact time of payment
- Raise ticket under "Payment Problems"
- Include all details for faster resolution

**Safe Payment Tips:**
✅ Check amount before confirming
✅ Use secure internet connection
✅ Save payment receipts
✅ Report suspicious activity immediately

Need help with a specific payment issue?`;
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 😊 I'm your student app assistant. I can help you with your schedule, tasks, mess payments, and any concerns you want to raise. What would you like help with today?";
    }
    
    if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return "You're very welcome! 😊 If you need any more help with the app, feel free to ask. I'm always here to assist you!";
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing great, thank you for asking! 😊 More importantly, how can I help you with your student app today?";
    }
    
    // Menu/food related
    if (lowerMessage.includes('menu') || lowerMessage.includes('meal') || lowerMessage.includes('breakfast') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) {
      return `🍽️ **Mess Menu Information**

To check today's menu:
1. Go to "Canteen/Mess" section
2. Tap on "Today's Menu"
3. View meals for:
   - Breakfast (7:00 AM - 9:00 AM)
   - Lunch (12:30 PM - 2:30 PM)
   - Snacks (5:00 PM - 6:00 PM)
   - Dinner (8:00 PM - 10:00 PM)

**Features:**
- See entire week's menu in advance
- View nutritional information
- Special dietary options highlighted
- Rate your meal experience
- Suggest menu improvements

**Meal Timings:**
You can check meal timings and menu for any day of the week. Menu is updated weekly every Sunday.

Want to see today's menu or give feedback about the food?`;
    }

    // Default response
    return `I'm here to help you with your student app! 🎓

**I can assist you with:**

📅 **Schedule** - View your timetable, class timings, and room details

✅ **Task Manager** - Track deadlines, submit work, check grades

🍽️ **Mess Payments** - Pay canteen bills, view charges, check menu

📞 **Helpline** - Raise concerns, track tickets, get support

**Just ask me:**
- "Show me my schedule"
- "How do I submit a task?"
- "How to pay mess bill?"
- "I want to raise a complaint"

What would you like to know more about?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking time for realistic demo
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const botMessage = {
      id: messages.length + 2,
      text: getIntelligentResponse(currentInput),
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "📅 My Schedule", query: "Show me my class schedule" },
    { label: "✅ My Tasks", query: "What are my pending tasks?" },
    { label: "🍽️ Pay Mess Bill", query: "How do I pay my mess charges?" },
    { label: "📞 Raise Concern", query: "I want to raise a support ticket" }
  ];

  const handleQuickAction = (query) => {
    setInput(query);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">SocialHub Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-1 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
          <p className="text-xs text-gray-600 mb-2 font-medium">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.query)}
                className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all text-left font-medium"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.sender === 'bot' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                msg.sender === 'bot'
                  ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === 'bot' ? 'text-gray-400' : 'text-blue-100'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <Bot size={18} />
            </div>
            <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-3 shadow-sm">
              <Loader2 size={18} className="animate-spin text-blue-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">💡 Free Demo Mode - Powered by Smart AI</p>
      </div>
    </div>
  );
}

export default SocialHub