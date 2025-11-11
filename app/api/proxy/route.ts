import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔹 إعداد المهلة الزمنية (هنا 60 ثانية)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000);

    const response = await fetch(
      "https://kyzendev.app.n8n.cloud/webhook/c9501d26-a9e9-4151-aad3-9e031433ed46",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const result = await response.text();
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Proxy error:", error.name, error.message);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "⏱️ انتهى الوقت دون استجابة من n8n (Timeout)" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "❌ فشل الاتصال بـ n8n." },
      { status: 500 }
    );
  }
}
