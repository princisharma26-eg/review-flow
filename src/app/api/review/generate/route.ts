import { NextResponse } from "next/server";
import OpenAI from "openai";

// Optional: Fallback response if no API key is provided during testing
const REVIEWS_1_STAR = [
  "Absolutely terrible experience. I will never return.",
  "Worst service I have ever received. Completely unprofessional.",
  "Save your money and go somewhere else. Extremely disappointed.",
  "I waited forever and the quality was awful.",
  "Do not recommend this place at all. A complete waste of time.",
  "The staff was rude and unhelpful. Horrible experience.",
  "I regret coming here. Nothing went right.",
  "Extremely poor quality. I expected much better.",
  "Terrible customer service. They completely ignored my requests.",
  "I wouldn't even give this one star if I had the choice.",
  "Disgusting behavior from the staff. Very unprofessional.",
  "Everything was a mess. I am never coming back.",
  "Complete disaster. I strongly advise against using their services.",
  "The worst business I have ever dealt with.",
  "They overcharged me for a very poor service.",
  "Unacceptable level of service. I am very angry.",
  "Nothing but problems from start to finish.",
  "A huge disappointment. Please avoid this place.",
  "Terrible communication and awful results.",
  "I am deeply unsatisfied with everything."
];

const REVIEWS_2_STAR = [
  "Below average experience. There is a lot of room for improvement.",
  "Not great. The service was slow and uncoordinated.",
  "It was okay, but I expected much more for the price.",
  "Somewhat disappointed. The quality just wasn't there.",
  "Needs significant improvement in customer handling.",
  "The service was mediocre at best. I might not return.",
  "I found the experience lacking in many areas.",
  "A bit let down. They promised more than they delivered.",
  "Only a few things went right. Mostly it was a hassle.",
  "Not worth the money. Very average service.",
  "I've had better experiences elsewhere. Disappointing.",
  "They need to work on their professionalism and speed.",
  "It wasn't terrible, but it certainly wasn't good.",
  "I left feeling unsatisfied. Needs a lot of work.",
  "Very lackluster. I wouldn't highly recommend them.",
  "Just barely acceptable. Definitely won't be my first choice.",
  "Some staff tried, but overall it was a poor visit.",
  "The quality has really gone down recently.",
  "Not terrible, but very forgettable and underwhelming.",
  "I expected better based on the hype. It fell short."
];

const REVIEWS_3_STAR = [
  "Decent service, but nothing special. Met my basic expectations.",
  "Average experience. It was fine, but I wouldn't go out of my way to return.",
  "Okay value for the money. The staff was polite.",
  "Fair experience overall. There were some good aspects and some bad.",
  "It was acceptable. Nothing to complain about, but nothing to praise.",
  "Just okay. The service was exactly what you'd expect.",
  "A middle-of-the-road experience. Nothing stood out.",
  "It got the job done, but it wasn't a memorable visit.",
  "Standard service. No major issues, but not amazing.",
  "Pretty average. I might come back if I have to.",
  "It was fine. Everything went mostly according to plan.",
  "Adequate service. Not bad, not great.",
  "An ordinary experience. It served its purpose.",
  "Nothing exceptional. Just a normal, everyday service.",
  "It was reasonably priced for an average experience.",
  "They met the minimum requirements. Nothing more.",
  "An okay visit. I have no strong feelings either way.",
  "Acceptable quality, but there is room for growth.",
  "A typical experience. Nothing to write home about.",
  "It was alright. I'm satisfied but not blown away."
];

const REVIEWS_4_STAR = [
  "Great experience! The service was very good and professional.",
  "Really enjoyed my visit. High quality and friendly staff.",
  "Very solid service. I would definitely recommend them.",
  "Almost perfect. I am very happy with the results.",
  "Great value and excellent customer support.",
  "Very impressed. They did a great job overall.",
  "A highly positive experience. Just a few minor hiccups.",
  "I really liked the attention to detail. Great work.",
  "Very good overall. I will likely be returning.",
  "Efficient and reliable. A great choice for sure.",
  "High quality service. They handled everything very well.",
  "I'm quite satisfied. The staff was very helpful.",
  "Very good experience. Worth the money.",
  "A wonderful visit. I felt well taken care of.",
  "Great business! They deliver on their promises.",
  "Very professional and quick. Highly recommended.",
  "An excellent service with just a little room for improvement.",
  "I was pleasantly surprised. Very good quality.",
  "Great job. I would confidently recommend their services.",
  "Very positive experience. I am a happy customer."
];

const REVIEWS_5_STAR = [
  "Absolutely fantastic! Flawless experience from start to finish.",
  "The best service I have ever received. Highly recommended!",
  "Incredible quality and outstanding customer care. 5 stars!",
  "They exceeded every single expectation I had. Perfect.",
  "An exceptional experience. I couldn't be happier.",
  "Phenomenal attention to detail and top-notch professionalism.",
  "A truly outstanding business. I will be a customer for life.",
  "Perfect execution and the friendliest staff ever.",
  "The highest quality I've seen. Absolutely brilliant.",
  "Beyond amazing. I cannot recommend them enough.",
  "Everything was absolutely perfect. Thank you so much!",
  "A masterpiece of customer service. Truly the best.",
  "Exquisite experience. They made me feel so valued.",
  "Top of the line service. Simply unbeatable.",
  "Five stars isn't enough! They deserve ten stars.",
  "The most seamless and perfect experience I've ever had.",
  "Unmatched quality and speed. Truly exceptional.",
  "Absolutely brilliant in every single way. Amazing job.",
  "I am completely blown away by their dedication.",
  "Perfection. I will be telling everyone about this place."
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
      let reviewList = REVIEWS_5_STAR;
      if (rating === 1) reviewList = REVIEWS_1_STAR;
      else if (rating === 2) reviewList = REVIEWS_2_STAR;
      else if (rating === 3) reviewList = REVIEWS_3_STAR;
      else if (rating === 4) reviewList = REVIEWS_4_STAR;

      const randomReview = reviewList[Math.floor(Math.random() * reviewList.length)];
      return NextResponse.json({ success: true, review: randomReview });
    }

    const openai = new OpenAI({ apiKey });

    // Determine tone based on rating
    let tone = "";
    if (rating === 1) tone = "highly critical, dissatisfied, pointing out severe issues and extremely bad service. Express extreme disappointment.";
    else if (rating === 2) tone = "mixed, pointing out some okay aspects but mostly highlighting significant flaws and disappointment.";
    else if (rating === 3) tone = "neutral, average, stating it met basic expectations but nothing special.";
    else if (rating === 4) tone = "very positive, highly satisfied, praising the good quality.";
    else tone = "highly positive, ecstatic, enthusiastic, and absolutely recommending the business.";
    
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
