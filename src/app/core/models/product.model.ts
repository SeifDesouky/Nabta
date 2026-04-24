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
