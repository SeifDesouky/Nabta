import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../API/api-service.service';
import { CreateReviewRequest, ICreateProduct, IGetProductsResponse, IProduct, IReview } from '../../models/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  constructor(private router: Router, private api: ApiServiceService) { }

  getAllProducts(params:any) {
    return this.api.get<IGetProductsResponse>('product/all_products', params );
  }

  addProduct(data: ICreateProduct) {
    const formData = new FormData();

    formData.append('productName', data.productName);
    formData.append('price', data.price.toString());
    formData.append('img', data.img);
    formData.append('stock', data.stock.toString());

    if (data.bulkAvailable) {
      formData.append('bulkAvailable', "true");
      formData.append('bulkQuantity', data.bulkQuantity?.toString() || '');
      formData.append('bulkPrice', data.bulkPrice?.toString() || '');
    }

    return this.api.post<IProduct>('product', formData);
  }

  handleAddProduct(res:IProduct) {
    return this.router.navigate(['/marketplace'])    // بعد الإضافة مثلاً نرجع للمنتجات
  }

  getProductBySlug(slug:string) {
    return this.api.get(`product/product/${slug}`);
  }
  getMyProducts() {
    return this.api.get<IGetProductsResponse>('product/my_products');
  }

  // POST /review (token)
  createReview(payload: CreateReviewRequest): Observable<IReview> {
    return this.api.post<IReview>(`/review`, payload);
  }

  // DELETE /review/:id (token)
  deleteReview(id: string): Observable<string> {
    return this.api.delete<string>(`/review/${id}`);
  }
  getRelatedProducts(slug: string) {
  return this.api.get<IGetProductsResponse>(`product/related_products/${slug}`);
}
}
