export interface Review {
  objectId: string;
  user: { objectId: string; name: string };
  pg: { objectId: string };
  rating: number;
  comment: string;
  createdAt: string;
}
