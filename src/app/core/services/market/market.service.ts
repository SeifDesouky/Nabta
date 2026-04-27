import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../API/api-service.service';
import { ICreateProduct, IGetProductsResponse, IProduct } from '../../models/product.model';

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
}
