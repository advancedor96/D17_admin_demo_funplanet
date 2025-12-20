import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ImageModule } from 'primeng/image';
import { finalize } from 'rxjs';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import dayjs from 'dayjs';

@Component({
  selector: 'app-session-detail',
  imports: [ImageModule, BlockUIModule, ProgressSpinnerModule, AccordionModule, ChipModule, CommonModule, TableModule, ButtonModule],
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.scss',
})
export class SessionDetail implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private http = inject(HttpClient); // 加上這行

  session_id = signal('');
  name = signal('');
  type = signal('');
  year_month = signal('');
  image = signal('');
  text = signal('');
  min = signal(0);
  max = signal(0);
  max_standby = signal(0);
  publish = signal(1);
  timeList = signal<any[]>([]);
  isLoading = signal(true);
  
  ngOnInit(){
    this.activatedRoute.params.subscribe((params) => {
      this.session_id.set(params['s_id']);
      this.loadData();
    });
  }
  loadData() {
    this.http.post(`${myGlobal.apiUrl}/getSessionDetailById`, { session_id: this.session_id() })
    .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
    .subscribe({
      next: (res: any) => {
        console.log('res', res.data);
        this.name.set(res.data.name);
        this.type.set(res.data.type);
        this.year_month.set(res.data.year_month);
        this.image.set(res.data.image);
        this.text.set(res.data.text);
        this.min.set(res.data.min);
        this.max.set(res.data.max);
        this.max_standby.set(res.data.max_standby);
        this.publish.set(res.data.publish);
        this.timeList.set(res.data.time_list.map((e: any)=>{
          const obj = dayjs(e.datetime)
          return {
            ...e,
            datetime: `${obj.format('MM/DD(ddd) HH:mm')}`,
            orderList: []
          }

        }));

        for(let i = 0; i < this.timeList().length; i++){
          this.setOrderByTimeId(this.timeList()[i].time_id, i);
        }


      },
      error: (err:any) => {
        this.messageService.add({ severity: 'error', summary: err, key: 'tl', life: 3000 });
        console.error('Load session detail error:', err);
      }
    });
  } // loadData
  setOrderByTimeId(time_id: string, idx: number) {
    this.http.post(`${myGlobal.apiUrl}/getOrderByTimeId`, {
      time_id: time_id
    }).subscribe({
      next: (res: any) => {
        const orderList = res.data.map((e: any) => {
          let myOnlinePayment = '';
          if (e.online_payment === 'single_pay') myOnlinePayment = '單次匯款';
          if (e.online_payment === 'discount_card') myOnlinePayment = '扣儲值';
          
          return {
            ...e,
            online_payment: myOnlinePayment,
            time_id: time_id,
            createdAt: dayjs(e.createdAt).format('YYYY-MM-DD HH:mm:ss')
          };
        });

        this.timeList.update(currentList => {
          const newList = [...currentList];
          newList[idx].orderList = orderList;
          return newList;
        })
      },
      error: (err) => {
        console.error('setOrderByTimeId error:', err);
        this.messageService.add({ 
          severity: 'warn', 
          summary: '設定時段失敗', 
          key: 'tl', 
          life: 3000 
        });
      }
    });


  }
}
