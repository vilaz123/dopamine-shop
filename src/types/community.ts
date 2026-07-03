export type CommunityComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  title: string;
  body: string;
  topic: string;
  relatedProductSlugs: string[];
  savedAmount: number;
  likes: number;
  comments: CommunityComment[];
  createdAt: string;
};
