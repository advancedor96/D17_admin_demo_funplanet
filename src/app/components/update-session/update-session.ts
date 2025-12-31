import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
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
  time_id?: string;
  date: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-update-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule, InputTextModule, InputNumberModule, TextareaModule, DatePickerModule, SelectButtonModule, FileUploadModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './update-session.html',
  styleUrl: './update-session.scss',
})
export class UpdateSession implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  // Session ID from route
  sessionId = signal<string>('');

  // Form fields as signals
  name = signal('');
  type = signal('');
  year = signal(new Date().getFullYear());
  month = signal(new Date().getMonth() + 1);
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
  isLoading = signal(false);
  isUploading = signal(false);
  isSubmitting = signal(false);
  selectedFile = signal<File | null>(null);
  uploadedImageUrl = signal('');

  ngOnInit() {
    // Get session ID from route params
    const id = this.route.snapshot.paramMap.get('s_id');
    if (id) {
      this.sessionId.set(id);
      this.loadSessionData();
    }
  }

  private async loadSessionData() {
    this.isLoading.set(true);
    
    try {
      const response = await this.http.post<any>(`${myGlobal.apiUrl}/getSessionDetailById`, {
        session_id: this.sessionId()
      }).toPromise();

      const data = response.data;

      // 填入表單資料
      this.name.set(data.name);
      this.year.set(parseInt(dayjs(data.year_month).format('YYYY')));
      this.month.set(parseInt(dayjs(data.year_month).format('MM')));
      this.type.set(data.type);
      this.image.set(data.image);
      this.uploadedImageUrl.set(`${myGlobal.apiUrl}/upload/${data.image}`);
      this.description.set(data.text);
      this.min.set(data.min);
      this.max.set(data.max);
      this.maxStandby.set(data.max_standby);
      this.publish.set(data.publish);

      // 處理時間清單
      this.timeList.set(data.time_list.map((e: any) => ({
        time_id: e.time_id,
        date: dayjs(e.datetime).format('YYYY-MM-DD'),
        time: dayjs(e.datetime).format('HH:mm'),
        text: e.text
      })));

    } catch (error) {
      console.error('Load session error:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Load Failed', 
        detail: 'Failed to load session data',
        key: 'tl',
        life: 3000 
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  onFileSelect(event: { files: File[] }): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.uploadImage();
    }
  }

  addTime() {
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

    this.http.post<UploadResponse>(`${myGlobal.apiUrl}/uploadImage`, formData)
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.image.set(response.filename);
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

  onSubmit() {
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

    this.isSubmitting.set(true);
    
    const payload = {
      session_id: this.sessionId(),
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
      time_list: this.timeList().map(slot => ({
        time_id: slot.time_id || undefined,
        datetime: dayjs(`${slot.date} ${slot.time}`).format('YYYY-MM-DD HH:mm:ss'),
        text: slot.text
      }))
    };

    console.log('Update Payload:', payload);

    this.http.post(`${myGlobal.apiUrl}/updateSession`, payload)
      .subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Session updated successfully',
            key: 'tl',
            life: 3000 
          });
          this.router.navigate(['/list']);
        },
        error: (error) => {
          console.error('Update session error:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Update Failed', 
            detail: error?.error?.message || 'Failed to update session',
            key: 'tl',
            life: 3000 
          });
          this.isSubmitting.set(false);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/list']);
  }

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