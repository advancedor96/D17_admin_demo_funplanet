import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit{
  http = inject(HttpClient);
  router = inject(Router);
  password: string = '';
  isLoading: boolean = false;
  errorMsg: string | null = null; // 用來顯示錯誤訊息（可選）



  ngOnInit(){
    console.log('ssss', myGlobal.appName);
    // this.getMonthAndDate();

  }


  login() {
    this.errorMsg = null;
    const url = myGlobal.apiUrl + '/auth/login';
    this.isLoading = true;
    this.http.post(url, { password: this.password })
    .pipe(finalize(() => { this.isLoading = false; }))
    .subscribe({
      next: (res: any) => {
        // 後端成功會回 { token: "..." }
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          console.log('登入成功，token 已儲存');
          // 可在此導頁 (例如使用 Router) 或發通知
          this.router.navigate(['/list']);
        } else if (res && res.msg) {
          this.errorMsg = res.msg;
          console.warn('login msg:', res.msg);
        } else {
          this.errorMsg = '未知的回應格式';
          console.warn('unexpected response:', res);
        }
      },
      error: (err) => {
        // 若後端回 4xx 並包含 { msg: 'invalid credentials' }
        const apiMsg = err?.error?.msg || err?.message || '登入失敗';
        this.errorMsg = apiMsg;
        console.error('login error:', err);
      },
    });
  }

}
