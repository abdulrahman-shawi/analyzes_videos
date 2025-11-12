// components/InputForm.tsx
'use client'
import React, { useState } from 'react';

// تعريف Prop Types لدالة الإرسال
interface InputFormProps {
  sendMessage: (url: string, description: string) => Promise<void>;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ sendMessage, isLoading }) => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // التحقق من حالة التحميل أو عدم وجود أي إدخال
    if (isLoading || (!description.trim())) return; 
    
    // إرسال البيانات
    sendMessage(url.trim(), description.trim());
    
    // مسح الحقول بعد الإرسال
    setUrl(''); 
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="أدخل الرابط هنا (اختياري)"
        className="p-2 border rounded-lg focus:outline-none text-gray-500 focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="أدخل الوصف/السؤال هنا (إلزامي)"
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
        {isLoading ? 'جاري التحميل...' : 'إرسال'}
      </button>
    </form>
  );
};

export default InputForm;