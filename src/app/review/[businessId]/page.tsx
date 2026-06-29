import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ReviewUI from './ReviewUI';

export default async function ReviewPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  
  const business = await db.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    notFound();
  }

  return <ReviewUI business={business} />;
}
