
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, User, Truck, Phone, MapPin } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface Message {
  id: string;
  sender: 'user' | 'courier';
  content: string;
  timestamp: Date;
  type?: 'text' | 'status' | 'location';
}

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'courier',
      content: 'Hello! I am David, your delivery courier. Your order is being prepared and will be on the way soon.',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: '2',
      sender: 'courier',
      content: 'Order picked up from supplier. Currently en route to your location.',
      timestamp: new Date(Date.now() - 180000),
      type: 'status'
    },
    {
      id: '3',
      sender: 'user',
      content: 'Great! What time should I expect delivery?',
      timestamp: new Date(Date.now() - 120000),
      type: 'text'
    },
    {
      id: '4',
      sender: 'courier',
      content: 'I should be at your location around 2:00 PM. I will call when I arrive at your building.',
      timestamp: new Date(Date.now() - 60000),
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);
    
    // Simulate courier typing and response
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        'Thank you for your message. I will update you shortly on the delivery status.',
        'Received! I am currently 5 minutes away from your location.',
        'I understand. I will be there as soon as possible.',
        'Got it! I will call you when I arrive.',
        'Thanks for letting me know. I will handle this accordingly.'
      ];
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'courier',
        content: randomReply,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, reply]);
    }, 1500 + Math.random() * 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Truck size={16} />
          </div>
          <div>
            <h3 className="font-semibold">David M.</h3>
            <p className="text-xs opacity-90 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Online • Your courier
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <Phone size={16} />
          </button>
          <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <MapPin size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs flex items-start space-x-2 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {message.sender === 'user' ? <User size={12} /> : <Truck size={12} />}
              </div>
              <div>
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  message.type === 'status'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.content}
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                <Truck size={12} />
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isTyping}
          />
          <EdumallButton
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-teal-500 px-3"
          >
            <Send size={16} />
          </EdumallButton>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </motion.div>
  );
};
