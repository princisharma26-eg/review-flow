import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, googleReviewLink } = await req.json();

    if (!name || !googleReviewLink) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const business = await db.business.create({
      data: {
        name,
        googleReviewLink,
      },
    });

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
