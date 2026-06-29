import { NextResponse } from "next/server";
import OpenAI from "openai";

// Optional: Fallback response if no API key is provided during testing
const DUMMY_REVIEWS = [
  "Fantastic experience from start to finish! Highly recommend their services to everyone.",
  "Very professional and efficient. I was extremely satisfied with how they handled everything.",
  "Outstanding quality and great customer support. I will definitely be coming back.",
  "The staff was incredibly welcoming and helpful. I would give them six stars if I could!",
  "A truly wonderful experience. They went above and beyond my expectations.",
  "Great value for the price. The attention to detail is just phenomenal.",
  "Fast, reliable, and friendly. What more could you ask for? Highly recommended.",
  "I'm very impressed with the quality of service. They handled my request perfectly.",
  "Absolutely top-notch! The communication was clear and the result was amazing.",
  "An absolute pleasure to deal with. Professionalism at its finest.",
  "Exceeded all my expectations. They truly care about their customers.",
  "I've been a loyal customer for years, and they never disappoint. Fantastic as always.",
  "Prompt service and very knowledgeable staff. Will definitely use them again.",
  "The best in the business! The entire process was seamless and stress-free.",
  "Very polite and accommodating. They made sure I was completely satisfied.",
  "Incredible attention to detail. You can tell they take pride in their work.",
  "Quick response times and excellent results. 10/10 would recommend.",
  "Amazing experience! They solved my issue in no time at all.",
  "Everything was perfect. It's rare to find such dedicated service nowadays.",
  "I am beyond thrilled with the outcome. Thank you so much for your hard work!"
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
      { success: false, error: error instanceof Error ? error.message : "Failed to generate review" },
      { status: 500 }
    );
  }
}
