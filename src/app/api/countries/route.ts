import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return Response.json({
      result: response.text()
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
