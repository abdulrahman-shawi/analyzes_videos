import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Set a 5-minute timeout (300 seconds)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000);

    // Forward the request to the n8n webhook
    const response = await fetch(
      "https://kyzendev.app.n8n.cloud/webhook-test/c9501d26-a9e9-4151-aad3-9e031433ed46",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const resultText = await response.text();

    // 🔹 Return the response with CORS enabled
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
        ? "⏱️ Request to n8n timed out."
        : "❌ Failed to connect to n8n.";

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

// ✅ Required to handle browser preflight requests (CORS OPTIONS)
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
