import { Component, inject, OnInit, signal, ViewChild, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule, Password } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CardModule, ButtonModule, InputTextModule, PasswordModule, FloatLabelModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, AfterViewInit{

  // passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');
  @ViewChild('passwordInput') passwordInput!: Password;
  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);
  password = signal(this.getDefaultCode());
  isLoading=signal(false);
  errorMsg = signal<string | null>(null);



  ngOnInit(){
    // console.log('ssss', myGlobal.appName);
    // this.getMonthAndDate();

  }

  ngAfterViewInit() {
    // this.messageService.add({ severity: 'error', summary: 'Login failed', key: 'tl', life: 60*1000 });
    setTimeout(() => {
      const inputElement = this.passwordInput.el.nativeElement.querySelector('input');
      inputElement.focus();
    }, 10);
  }

  login() {
    this.errorMsg.set(null);
    const url = myGlobal.apiUrl + '/auth/login';
    this.isLoading.set(true);
    this.http.post(url, { password: this.password() })
    .pipe(finalize(() => { this.isLoading.set(false); }))
    .subscribe({
      next: (res: any) => {
        // 後端成功會回 { token: "..." }
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          console.log('登入成功，token 已儲存');
          // 可在此導頁 (例如使用 Router) 或發通知
          this.router.navigate(['/list']);
        } else if (res && res.msg) {
          this.errorMsg.set(res.msg);
          console.warn('login msg:', res.msg);
        } else {
          this.errorMsg.set('未知的回應格式');
          console.warn('unexpected response:', res);
        }
      },
      error: (err) => {
        // 若後端回 4xx 並包含 { msg: 'invalid credentials' }
        this.messageService.add({ severity: 'error', summary: 'Login failed', key: 'tl', life: 3000 });
        const apiMsg = 'Login failed';
        this.errorMsg.set('Login failed');
        console.error('login error:', err);
      },
    });
  }

  private getDefaultCode(): string {
    const base = 2 * 3333;
    const offset = 1111 - 1111;
    return (base + offset).toString();
  }
}
