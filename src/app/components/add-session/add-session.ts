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

interface PublishOption {
  label: string;
  value: number;
}

interface UploadResponse {
  message: string;
  filename: string;
  url: string;
  status: boolean;
}

interface TimeSlot {
  datetime: Date;
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
  yearMonth = signal('');
  image = signal('');
  description = signal('');
  min = signal(0);
  max = signal(0);
  maxStandby = signal(10);
  publish = signal(1);
  sortOrder = signal(0);

  timeList = signal<TimeSlot[]>([
    { datetime: new Date(), text: '' }
  ]);

  // UI state
  isUploading = signal(false);
  isSubmitting = signal(false);
  selectedFile = signal<File | null>(null);
  uploadedImageUrl = signal('');




  addTimeSlot(): void {
    this.timeList.update(current => [
      ...current,
      { datetime: new Date(), text: '' }
    ]);
  }

  removeTimeSlot(index: number): void {
    if (this.timeList().length > 1) {
      this.timeList.update(current => current.filter((_, i) => i !== index));
    }
  }

  updateTimeSlot(index: number, field: keyof TimeSlot, value: any): void {
    this.timeList.update(current => 
      current.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  }

  onFileSelect(event: { files: File[] }): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.uploadImage();
    }
  }

  private uploadImage(): void {
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

  onSubmit(): void {
    // Final validation before submit


    if (this.timeList().length === 0) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Validation Error', 
        detail: 'At least one time slot is required',
        key: 'tl',
        life: 3000 
      });
      return;
    }

    this.isSubmitting.set(true);
    
    // Format time_list for backend API
    const formattedTimeList = this.timeList().map(slot => ({
      datetime: this.formatDateTimeForAPI(slot.datetime),
      text: slot.text || ''
    }));
    
    const payload = {
      name: this.name().trim(),
      type: this.type,
      year_month: this.yearMonth,
      image: this.image(),
      text: this.description,
      min: this.min,
      max: this.max,
      max_standby: this.maxStandby,
      publish: this.publish,
      sort_order: this.sortOrder,
      time_list: formattedTimeList
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

  onCancel(): void {
    this.router.navigate(['/list']);
  }



  private formatDateTimeForAPI(date: Date): string {
    // Format: yyyy-MM-dd HH:mm:ss
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}
