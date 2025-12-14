import { Component , inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-list',
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
 

export class List implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);
  isLoading = false;
  items: any[] = [];

  errorMsg: string | null = null;
  obj:{ year: number; month: number } = {
    year: 0,
    month: 0
  }

  displayedColumns: string[] = ['event_type', "name",  'session_type','month',  'image', 'publish', "action", "order"];
  dataSource = new MatTableDataSource<any>();


  getMonthAndDate(){
    this.http.get(myGlobal.apiUrl + '/getSelectedYearMonth').subscribe((res:any)=>{
      console.log('res:', res);
      this.obj = res.data;
    });
  }
  ngOnInit() {
    this.getMonthAndDate();
    this.loadList();
    // Initialization logic here
  }
  loadList() {
    this.errorMsg = null;
    this.isLoading = true;
    const url = myGlobal.apiUrl + '/list';
    // console.log('List.loadList() called, token=', localStorage.getItem('token') ? 'present' : 'null');
    this.http.get(url).subscribe({
      next: (res: any) => {
        this.items = res?.data ?? res ?? [];
        console.log('items:', this.items);
        this.dataSource.data = this.items;
      },
      error: (err) => {
        this.errorMsg = err?.error?.msg || err?.message || '讀取清單失敗';
        console.error('loadList error:', err);
        if (err?.status === 401) {
          // token 過期或無效，清掉並導向登入
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
    });
  }

}
