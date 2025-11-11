"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "../components/MessageBubble";
import InputForm from "../components/InputForm";
import TypingIndicator from "../components/TypingIndicator";
import { Message } from "../types/chat";

const N8N_WEBHOOK_URL =
  "https://kyzendev.app.n8n.cloud/webhook/c9501d26-a9e9-4151-aad3-9e031433ed46";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const generateRandomId = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const sendMessage = async (
    url: string,
    description: string
  ): Promise<void> => {
    if (!url.trim() && !description.trim()) return;

    setIsLoading(true);

    // إذا أُدخل URL نحفظه في localStorage
    if (url.trim()) {
      localStorage.setItem("url", url.trim());
    }

    // نحصل على URL من localStorage إن لم يُدخل المستخدم واحدًا جديدًا
    const finalUrl = url.trim() || localStorage.getItem("url") || "";

    // رسالة المستخدم المعروضة
    const userText = finalUrl
      ? `🔗 الرابط:\n${finalUrl}\n\n📝 الوصف:\n${description || "—"}`
      : description;

    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);

    try {
      // sessionId ثابت خلال الجلسة
      let sessionId = localStorage.getItem("sessionId");
      if (url) {
        sessionId = generateRandomId();
        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("url", url);
      }

      // 🔹 الإرسال إلى n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalUrl,
          description,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      console.log("📩 Response from n8n:", data);

      let aiText = "عذرًا، لم أتلق ردًا واضحًا من الذكاء الاصطناعي.";

      // 🔹 إذا كانت الأسئلة مصفوفة، نحولها إلى نص منسق
      if (Array.isArray(data.questions)) {
        aiText = data.questions
          .map((q: string, i: number) => `${q}`)
          .join("\n\n");
      }
      // 🔹 أو إذا كانت مجرد نص عادي
      else if (typeof data.questions === "string") {
        aiText = data.questions;
      }

      if (Array.isArray(data.steps)) {
        aiText = data.steps
          .map((q: Map<string , string>, i: number) => `${q.description}`)
          .join("\n\n");
      }
      // 🔹 أو إذا كانت مجرد نص عادي
      else if (typeof data.questions === "string") {
        aiText = data.questions;
      }

      setMessages((prev) => [...prev, { text: aiText, sender: "ai" }]);
    } catch (err) {
      console.error("N8N Error:", err);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ حدث خطأ أثناء الاتصال بـ n8n.", sender: "ai" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-white shadow-md border-b">
        <h1 className="text-xl font-bold text-center text-blue-600">
          🤖 شات الذكاء الاصطناعي و n8n
        </h1>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            ابدأ بإرسال وصف أو رابط!
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-xl shadow max-w-xs rounded-tl-none">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t bg-white shadow-lg">
        <InputForm sendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPage;
