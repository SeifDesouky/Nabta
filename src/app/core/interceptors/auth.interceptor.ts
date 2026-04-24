import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return next(req);
  }
  const modifiedReq = req.clone({
    setHeaders: {
      Authorization:`Bearer ${token}`
    }
  })
  return next(modifiedReq);
};
