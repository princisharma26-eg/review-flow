import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST to save new feedback
export async function POST(req: Request) {
  try {
    const { businessId, rating, aiReview } = await req.json();

    if (!businessId || !rating || !aiReview) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const feedback = await db.feedback.create({
      data: {
        businessId,
        rating,
        aiReview,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE to remove feedback
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    await db.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
