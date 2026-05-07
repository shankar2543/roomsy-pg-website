import Parse from "@/lib/parseConfig";

export interface ServiceReview {
  objectId: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export async function submitReview(params: {
  bookingId: string;
  stars: number;
  comment?: string;
}): Promise<{ rating: number; reviewId: string }> {
  return await Parse.Cloud.run("submitReview", params);
}

export async function getReviewForBooking(bookingId: string): Promise<ServiceReview | null> {
  const res = (await Parse.Cloud.run("getReviewForBooking", { bookingId })) as
    | { objectId: string; stars: number; comment: string; createdAt: string }
    | null;
  if (!res) return null;
  return {
    objectId: res.objectId,
    stars: res.stars,
    comment: res.comment,
    createdAt: typeof res.createdAt === "string" ? res.createdAt : new Date(res.createdAt).toISOString(),
  };
}
