import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const feedbacks = await db.feedback.findMany({
      include: {
        business: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
