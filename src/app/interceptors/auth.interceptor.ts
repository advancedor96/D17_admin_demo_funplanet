import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // 準備要送出的請求
    let finalRequest: HttpRequest<any>;
    
    if (!token) {
      finalRequest = req;
    } else {
      // 有 token，複製請求並加上 Authorization header
      finalRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 發送請求並處理回應
    const httpCall = next.handle(finalRequest);
    
    // 加上錯誤處理
    const httpCallWithErrorHandling = httpCall.pipe(
      catchError((error: HttpErrorResponse) => {
        // 檢查是否為 401 未授權錯誤
        if (error.status === 401) {
          // 清除無效的 token
          localStorage.removeItem('token');
          // 導向登入頁面
          this.router.navigate(['/login']);
        }
        
        // 重新拋出錯誤讓其他地方也能處理
        return throwError(() => error);
      })
    );

    return httpCallWithErrorHandling;
  }
}