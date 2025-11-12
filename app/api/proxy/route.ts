import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // إعداد مهلة 5 دقائق (300 ثانية)
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

    const resultText = await response.text();

    // 🔹 نعيد الاستجابة مع تفعيل CORS
    return new NextResponse(resultText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Proxy error:", error.name, error.message);

    const status = error.name === "AbortError" ? 504 : 500;
    const message =
      error.name === "AbortError"
        ? "⏱️ انتهى الوقت دون استجابة من n8n (Timeout)"
        : "❌ فشل الاتصال بـ n8n.";

    return new NextResponse(JSON.stringify({ error: message }), {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

// ✅ ضروري لدعم طلب preflight من المتصفح (CORS OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
