// components/InputForm.tsx
'use client'
import React, { useState } from 'react';

// Define Prop Types for the submit function
interface InputFormProps {
  sendMessage: (url: string, description: string) => Promise<void>;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ sendMessage, isLoading }) => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent submission if loading or no input provided
    if (isLoading || (!description.trim())) return;

    // Send the data
    sendMessage(url.trim(), description.trim());

    // Clear input fields after submission
    setUrl('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL here (optional)"
        className="p-2 border rounded-lg focus:outline-none text-gray-500 focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description/question here (required)"
        rows={3}
        className="p-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-500 focus:ring-blue-500 resize-none"
        disabled={isLoading}
        required
      />
      <button
        type="submit"
        className={`p-2 rounded-lg text-white font-semibold transition duration-300 
          ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`
        }
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};

export default InputForm;
