import { NextResponse } from "next/server";
import OpenAI from "openai";

// Optional: Fallback response if no API key is provided during testing
const DUMMY_REVIEWS = [
  "Fantastic experience from start to finish! Highly recommend their services to everyone.",
  "Very professional and efficient. I was extremely satisfied with how they handled everything.",
  "Outstanding quality and great customer support. I will definitely be coming back.",
];

export async function POST(req: Request) {
  try {
    const { businessName, rating } = await req.json();

    if (!businessName || !rating) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("No OPENAI_API_KEY provided. Returning dummy review.");
      const randomReview = DUMMY_REVIEWS[Math.floor(Math.random() * DUMMY_REVIEWS.length)];
      return NextResponse.json({ success: true, review: randomReview });
    }

    const openai = new OpenAI({ apiKey });

    // Determine tone based on rating
    const tone = rating >= 3 ? "positive and enthusiastic" : "constructive but polite";
    
    const prompt = `Write a short customer review for a business named "${businessName}". 
    The review should be 20 to 30 words long. 
    The tone should be ${tone}. 
    It must sound human-like, professional, and natural. 
    Do NOT use any emojis.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
      temperature: 0.9,
    });

    const review = response.choices[0].message?.content?.trim();

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Error generating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate review" },
      { status: 500 }
    );
  }
}
