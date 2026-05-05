export interface IProduct {
  _id: string;
  productName: string;
  price: number;
  stock: number;

  farmer: {
    _id: string;
    name: string;
  };

  imageUrl: string;
  slug: string;

  bulkAvailable: boolean;
  bulkQuantity?: number;
  bulkPrice?: number;

  avgRating: number;
  ratingCount: number;
  description?: string;
  category?: string;
  features?: string[];

  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProduct {
  productName: string;
  price: number;
  stock: number;

  img: File;

  bulkAvailable?: boolean;
  bulkQuantity?: number;
  bulkPrice?: number;
}

export type IGetProductsResponse = IProduct[];

export type IGetProductResponse = IProduct;

export interface IReview {
  _id: string;
  user: { _id: string; name: string };
  product: string;
  comment?: string;
  rating: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  product: string;
  rating: number;
  comment?: string;
}