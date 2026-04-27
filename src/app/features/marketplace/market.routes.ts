import { Routes } from '@angular/router';

export const marketplaceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products/products.component')
        .then(m => m.ProductsComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-details/product-details.component')
        .then(m => m.ProductDetailsComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component')
        .then(m => m.CartComponent)
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders.component')
        .then(m => m.OrdersComponent)
  },
  {
  path: 'payment-result',
  loadComponent: () =>
    import('./pages/payment-result/payment-result.component')
    .then(m => m.PaymentResultComponent)
  },
  {
  path: 'my-orders',
  loadComponent: () =>
    import('./pages/my-orders/my-orders.component')
      .then(m => m.MyOrdersComponent)
}
];
