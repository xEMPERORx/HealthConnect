import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatWidgetProps {
  webhookUrl: string;
}

export default function ChatWidget({ webhookUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hi 👋, how can we help?', isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isWebhookActive, setIsWebhookActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if webhook is active when chat widget opens
    if (isOpen) {
      checkWebhookStatus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChatId = () => {
    let chatId = sessionStorage.getItem('chatId');
    if (!chatId) {
      chatId = `chat_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chatId', chatId);
    }
    return chatId;
  };

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: getChatId(),
          message: 'ping',
          route: 'general'
        })
      });
      
      setIsWebhookActive(response.ok);
    } catch (error) {
      setIsWebhookActive(false);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const fallbackResponses = {
      default: "I apologize, but our chat service is currently unavailable. Please try again later or contact us through email at support@healthconnect.com",
      greeting: "I apologize, but our chat service is currently offline. For immediate assistance, please email us at support@healthconnect.com",
      help: "While our chat service is offline, you can find help in our FAQ section or email support@healthconnect.com",
      appointment: "Our chat service is currently unavailable. To schedule an appointment, please use our booking system in the Consultations section.",
      emergency: "If this is a medical emergency, please call emergency services immediately. Our chat service is currently unavailable."
    };

    // Check message content for keywords and return appropriate response
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return fallbackResponses.emergency;
    }
    if (lowerMessage.includes('appointment') || lowerMessage.includes('booking')) {
      return fallbackResponses.appointment;
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
      return fallbackResponses.greeting;
    }
    if (lowerMessage.includes('help')) {
      return fallbackResponses.help;
    }
    
    return fallbackResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { text: inputMessage, isUser: true };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    if (!isWebhookActive) {
      const fallbackResponse = getFallbackResponse(inputMessage);
      setMessages(prev => [...prev, {
        text: fallbackResponse,
        isUser: false
      }]);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: getChatId(),
          message: inputMessage,
          route: 'general'
        })
      });

      if (!response.ok) {
        throw new Error('Webhook unavailable');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        text: data.output || getFallbackResponse(inputMessage),
        isUser: false
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsWebhookActive(false);
      setMessages(prev => [...prev, {
        text: getFallbackResponse(inputMessage),
        isUser: false
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors z-50 ${
          isOpen ? 'hidden' : ''
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div
        className={`fixed bottom-6 right-6 w-[350px] bg-white rounded-xl shadow-xl z-50 flex flex-col transition-all transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{ height: '500px' }}
      >
        <div className="flex items-center justify-between bg-rose-600 text-white px-4 py-3 rounded-t-xl">
          <span className="font-semibold">Chat with HealthConnect</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-rose-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}