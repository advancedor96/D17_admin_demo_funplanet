import { Component , inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
 const ELEMENT_DATA = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-list',
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
 

export class List implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);

  items: any[] = [];
  errorMsg: string | null = null;
  obj:{ year: number; month: number } = {
    year: 0,
    month: 0
  }

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;


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
    const url = myGlobal.apiUrl + '/list';
    // console.log('List.loadList() called, token=', localStorage.getItem('token') ? 'present' : 'null');
    this.http.get(url).subscribe({
      next: (res: any) => {
        this.items = res?.data ?? res ?? [];
        console.log('items:', this.items);
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
