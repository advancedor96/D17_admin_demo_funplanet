import { Component , inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { ImageModule } from 'primeng/image';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';

interface Session {
  s_or_t_id: string
  event_type: string
  name: string
  type: string
  year_month: string
  image: string
  publish: number
  sort_order: number
}

@Component({
  selector: 'app-list',
  imports: [CommonModule,  ButtonModule, TableModule, SelectModule, FormsModule, TagModule, ImageModule, RouterModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);

  isLoading = signal(false);
  sessionList = signal<Session[]>([]);
  errorMsg= signal<string | null>(null);
  selected_year = signal<number>(0);
  selected_month = signal<number>(0);

  year_list = signal<number[]>([2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]);

  private monthChange$ = new Subject<{year: number, month: number}>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.monthChange$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$) // 使用 takeUntil 來自動取消訂閱
    ).subscribe(({year, month}) => {
      this.setYearAndMonth(year, month);
    });

    this.getMonthAndDate();
    this.loadList();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  goPreviousMonth(){
    let newYear = this.selected_year();
    let newMonth = this.selected_month() - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    this.selected_month.set(newMonth);
    this.selected_year.set(newYear);
    if (newYear >= 2022) {
      this.monthChange$.next({year: newYear, month: newMonth});
    }
  }
  goNextMonth(){
    let newYear = this.selected_year();
    let newMonth = this.selected_month() + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    this.selected_month.set(newMonth);
    this.selected_year.set(newYear);
    if (newYear <= 2030) {
      this.monthChange$.next({year: newYear, month: newMonth});
    }
  }
  changeYear(event: SelectChangeEvent){
    this.selected_year.set(event.value);
    this.setYearAndMonth(this.selected_year(), this.selected_month());
  }
  changeMonth(event: SelectChangeEvent){
    this.selected_month.set(event.value);
    this.setYearAndMonth(this.selected_year(), this.selected_month());}
  getMonthAndDate(){
    this.http.get<{ data: { year: number; month: number } }>(
      myGlobal.apiUrl + '/getSelectedYearMonth'
    ).subscribe((res)=>{
      this.selected_year.set(res.data.year);
      this.selected_month.set(res.data.month);
    });
  }
  setYearAndMonth(year: number, month: number){
    this.isLoading.set(true);
    console.log('設定為', year, month);
    this.http.post(myGlobal.apiUrl + '/setSelectedYearMonth',  { year: year,  month: month } )
    .subscribe({
      next: (res:any)=>{
        this.loadList();
      },
      error: (err)=>{
        console.error('setYearAndMonth error:', err);
      }
    })
  }
  loadList() {
    this.errorMsg.set(null);
    this.isLoading.set(true);
    const url = myGlobal.apiUrl + '/list';

    this.http.get<{ data: Session[] }>(url).subscribe({
      next: (res) => {
        const tmpData = (res?.data ?? []).map(item => ({
          ...item,
          year_month: item.year_month.substring(0, 7)
        }));
        this.sessionList.set(tmpData);
        // this.dataSource.data = this.items;
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.msg || err?.message || '讀取清單失敗');
        console.error('loadList error:', err);
        if (err?.status === 401) {
          // token 過期或無效，清掉並導向登入
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      },
      complete: ()=>{
        this.isLoading.set(false);
      }
    });
  }

}
