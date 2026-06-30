import { NextResponse } from "next/server";
import OpenAI from "openai";

// Optional: Fallback response if no API key is provided during testing
const DUMMY_REVIEWS_1_STAR = [
  "Terrible experience. The service was incredibly slow and unprofessional.",
  "Very disappointed. I would not recommend this place to anyone.",
  "Awful customer service. They completely ignored my requests.",
  "Worst experience I've ever had. I will never be coming back.",
  "Completely unacceptable. Save your money and go somewhere else."
];

const DUMMY_REVIEWS_2_STAR = [
  "Below average experience. There's a lot of room for improvement.",
  "Not great, but not the worst. The service could be much better.",
  "It was okay, but I expected much more based on the reviews.",
  "Somewhat disappointed. The quality just wasn't there this time.",
  "Needs significant improvement in customer handling and speed."
];

const DUMMY_REVIEWS_3_STAR = [
  "Decent service, but nothing special. It met my basic expectations.",
  "Average experience. It was fine, but I wouldn't go out of my way to return.",
  "Okay value for the money. The staff was polite but quite slow.",
  "Fair experience overall. There were some good aspects and some bad ones.",
  "It was acceptable. Nothing to complain about, but nothing to praise either."
];

const DUMMY_REVIEWS_4_5_STAR = [
  "Fantastic experience from start to finish! Highly recommend their services.",
  "Very professional and efficient. I was extremely satisfied with everything.",
  "Outstanding quality and great customer support. Will definitely be coming back.",
  "The staff was incredibly welcoming and helpful. I would give six stars!",
  "A truly wonderful experience. They went above and beyond my expectations.",
  "Great value for the price. The attention to detail is just phenomenal.",
  "Fast, reliable, and friendly. What more could you ask for? Highly recommended.",
  "I'm very impressed with the quality of service. Absolutely top-notch!",
  "An absolute pleasure to deal with. Professionalism at its finest.",
  "Exceeded all my expectations. They truly care about their customers."
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
      
      let reviewList = DUMMY_REVIEWS_4_5_STAR;
      if (rating === 1) reviewList = DUMMY_REVIEWS_1_STAR;
      else if (rating === 2) reviewList = DUMMY_REVIEWS_2_STAR;
      else if (rating === 3) reviewList = DUMMY_REVIEWS_3_STAR;

      const randomReview = reviewList[Math.floor(Math.random() * reviewList.length)];
      return NextResponse.json({ success: true, review: randomReview });
    }

    const openai = new OpenAI({ apiKey });

    // Determine tone based on rating
    let tone = "";
    if (rating === 1) {
      tone = "highly critical, dissatisfied, and pointing out severe issues";
    } else if (rating === 2) {
      tone = "mixed, pointing out some okay aspects but mostly highlighting significant flaws and disappointment";
    } else if (rating === 3) {
      tone = "neutral, average, stating it met basic expectations but nothing special";
    } else {
      tone = "highly positive, enthusiastic, praising the business and highly recommending it";
    }
    
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
