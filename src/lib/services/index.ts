import { localProductService } from "./local/product.service";
import { localReviewService } from "./local/review.service";

export const productService = localProductService;
export const reviewService = localReviewService;
