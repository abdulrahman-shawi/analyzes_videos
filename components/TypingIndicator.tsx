// components/TypingIndicator.tsx
import React from 'react';

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
  </div>
);

export default TypingIndicator;