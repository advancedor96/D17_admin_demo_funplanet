import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import dayjs from 'dayjs';

interface UploadResponse {
  message: string;
  filename: string;
  url: string;
  status: boolean;
}

interface TimeSlot {
  date: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-add-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule, InputTextModule, InputNumberModule, TextareaModule, DatePickerModule, SelectButtonModule, FileUploadModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './add-session.html',
  styleUrl: './add-session.scss',
})
export class AddSession {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // Form fields as signals
  name = signal('');
  type = signal('');
  year = signal(new Date().getFullYear()); // 預設指定現在的年份
  month = signal(new Date().getMonth() + 1); // 預設指定現在的月份
  image = signal('');
  description = signal('');
  min = signal(1);
  max = signal(2);
  maxStandby = signal(10);
  publish = signal(1);
  sortOrder = signal(0);

  timeList = signal<TimeSlot[]>([
    { date: '', time: '', text: '' }
  ]);

  // UI state
  isUploading = signal(false);
  isSubmitting = signal(false);
  selectedFile = signal<File | null>(null);
  uploadedImageUrl = signal('');





  onFileSelect(event: { files: File[] }): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.uploadImage();
    }
  }
  addTime(){
    this.timeList.update(list => [...list, { date: '', time: '', text: '' }]);
  }
  deleteThisTime(index: number): void {
    if (this.timeList().length > 1) {
      this.timeList.update(current => current.filter((_, i) => i !== index));
    } 
  }
  private uploadImage() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('sendimage', file);

    this.http.post<UploadResponse>('https://demoapi-funplanet.ddns.net/uploadImage', formData)
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.image.set(response.url);
            this.uploadedImageUrl.set(response.url);
            
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Upload Success', 
              detail: response.message || 'Image uploaded successfully',
              key: 'tl',
              life: 3000 
            });
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Upload Failed', 
              detail: response.message || 'Failed to upload image',
              key: 'tl',
              life: 3000 
            });
          }
          this.isUploading.set(false);
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Upload Failed', 
            detail: 'Failed to upload image',
            key: 'tl',
            life: 3000 
          });
          this.isUploading.set(false);
        }
      });
  }

  onSubmit(){
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    const invalidSlot = this.timeList().find((slot, index) => {
      if (!slot.date?.trim() || !dateRegex.test(slot.date)) {
        this.showError(`Time slot ${index + 1}: Invalid or missing date`);
        return true;
      }
      if (!slot.time?.trim() || !timeRegex.test(slot.time)) {
        this.showError(`Time slot ${index + 1}: Invalid or missing time`);
        return true;
      }
      if (!slot.text?.trim()) {
        this.showError(`Time slot ${index + 1}: Description is required`);
        return true;
      }
      return false;
    });

    if (invalidSlot) return;
    // 把 timeList 的 date, time 轉成 datetime 字串。例如: "2025-12-30 01:22:00"
    this.isSubmitting.set(true);
    
    // Format time_list for backend API
    
    const payload = {
      name: this.name().trim(),
      type: this.type(),
      year_month: dayjs(`${this.year()}-${this.month()}-01`).format('YYYY-MM-DD'), 
      image: this.image(),
      text: this.description(),
      min: this.min(),
      max: this.max(),
      max_standby: this.maxStandby(),
      publish: this.publish(),
      sort_order: this.sortOrder(),

    // 把 timeList 的 date, time 轉成 datetime 字串。例如: "2025-12-30 01:22:00"
      time_list: this.timeList().map(slot => ({
        datetime: dayjs(`${slot.date} ${slot.time}`).format('YYYY-MM-DD HH:mm:ss'),
        text: slot.text
      }))
    };

    console.log('Payload:', payload);

    this.http.post(`${myGlobal.apiUrl}/addSession`, payload)
      .subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Session created successfully',
            key: 'tl',
            life: 3000 
          });
          this.router.navigate(['/list']);
        },
        error: () => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Create Failed', 
            detail: 'Failed to create session',
            key: 'tl',
            life: 3000 
          });
          this.isSubmitting.set(false);
        }
      });
  }

  onCancel(){
    this.router.navigate(['/list']);
  }

  // 輔助方法顯示錯誤
  private showError(message: string): void {
    this.messageService.add({ 
      severity: 'warn', 
      summary: 'Validation Error', 
      detail: message,
      key: 'tl',
      life: 3000 
    });
  }
}
