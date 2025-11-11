// components/MessageBubble.tsx
import React from 'react';
import { Message } from '../types/chat';

// تعريف Prop Types للمكون
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-xl shadow-md 
        ${isUser 
          ? 'bg-blue-500 text-white rounded-bl-xl rounded-br-none' // رسالة المستخدم (يمين)
          : 'bg-white text-gray-800 rounded-br-xl rounded-tl-none' // رسالة الذكاء الاصطناعي (يسار)
        }
      `}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;