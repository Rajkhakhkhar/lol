export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a smart travel planner AI that optimizes itineraries, swaps days if needed, and suggests best timings.",
          },
          {
            role: "user",
            content: body.prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      throw new Error(data.error?.message || "API Error");
    }

    const text = data.choices?.[0]?.message?.content || "No response";

    return Response.json({
      success: true,
      data: text,
    });
  } catch (error: any) {
    console.error("FINAL API ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
