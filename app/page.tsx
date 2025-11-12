"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "../components/MessageBubble";
import InputForm from "../components/InputForm";
import TypingIndicator from "../components/TypingIndicator";
import { Message } from "../types/chat";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const generateRandomId = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const sendMessage = async (url: string, description: string): Promise<void> => {
    if (!url.trim() && !description.trim()) return;

    setIsLoading(true);

    // Save the URL locally
    if (url.trim()) {
      localStorage.setItem("url", url.trim());
    }

    const finalUrl = url.trim() || localStorage.getItem("url") || "";

    const userText = finalUrl
      ? `🔗 URL:\n${finalUrl}\n\n📝 Description:\n${description || "—"}`
      : description;

    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);

    const makeRequest = async () => {
      // Send request to local API (which proxies to n8n)
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalUrl,
          description,
          sessionId: localStorage.getItem("sessionId"),
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    };

    try {
      // Keep the same sessionId for the current session
      let sessionId = localStorage.getItem("sessionId");
      if (url) {
        sessionId = generateRandomId();
        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("url", url);
      }

      let json;
      try {
        json = await makeRequest();
      } catch (firstError) {
        console.warn("⚠️ First request failed, retrying once...");
        json = await makeRequest(); // 🔁 retry once automatically
      }

      let data: any;
      try {
        data = JSON.parse(json.result);
      } catch {
        data = json;
      }

      console.log("📩 Response from n8n:", data);

      let aiText = "Sorry, I didn’t receive a clear response from the AI.";

      // Handle data returned from n8n
      if (Array.isArray(data.questions)) {
        aiText = data.questions.map((q: string) => `${q}`).join("\n\n");
      } else if (typeof data.questions === "string") {
        aiText = data.questions;
      }

      if (typeof data.raw === "string") {
        aiText = data.raw;
      }

      // Format steps with title + description
      if (Array.isArray(data.steps)) {
        aiText = data.steps
          .map(
            (step: { title?: string; description?: string }, i: number) => {
              const title = step.title ? `📘 ${step.title}\n` : "";
              const desc = step.description ? `${step.description}` : "";
              return `${i + 1}. ${title}${desc}`;
            }
          )
          .join("\n\n");
      }

      setMessages((prev) => [...prev, { text: aiText, sender: "ai" }]);
    } catch (err) {
      
      console.error("❌ N8N Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          text:
            "⚠️ An error occurred while connecting to n8n, and retrying also failed.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-white shadow-md border-b">
        <h1 className="text-xl font-bold text-center text-blue-600">
          🤖 AI Chat with n8n
        </h1>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Start by sending a description or a link!
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
