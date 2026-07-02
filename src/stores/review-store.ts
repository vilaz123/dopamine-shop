"use client";

import { create } from "zustand";
import type { Review } from "@/types/review";

type ReviewState = {
  submitted: Review[];
  addSubmitted: (review: Review) => void;
};

export const useReviewStore = create<ReviewState>((set) => ({
  submitted: [],
  addSubmitted: (review) => set((state) => ({ submitted: [review, ...state.submitted] })),
}));
