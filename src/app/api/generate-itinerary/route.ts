import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: any) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({
      success: true,
      data: text
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    return Response.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}
