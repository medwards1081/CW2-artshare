import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../../upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  title = '';
  description = '';
  selectedFile: File | null = null;
  fileBase64: string | null = null;
  fileType: string | null = null;
  fileName: string | null = null;

  isUploading = false;
  uploadError: string | null = null;
  uploadSuccess: string | null = null;

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.fileBase64 = null;
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;
    this.fileType = file.type;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.fileBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim() || !this.fileBase64) {
      this.uploadError = 'Please fill in all fields and select a file.';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = null;

    this.uploadService
      .uploadArtwork({
        title: this.title.trim(),
        description: this.description.trim(),
        fileBase64: this.fileBase64,
        fileType: this.fileType,
        fileName: this.fileName
      })
      .subscribe({
        next: () => {
          this.isUploading = false;
          this.uploadSuccess = 'File uploaded successfully.';
        },
        error: () => {
          this.isUploading = false;
          this.uploadError = 'Upload failed. Please try again.';
        }
      });
  }
}
