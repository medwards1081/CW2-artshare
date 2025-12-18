import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-upload-form',
  standalone: true,
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class UploadFormComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: [''],
      tags: [''],
      file: [null, Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadForm.patchValue({ file: this.selectedFile });
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('title', this.uploadForm.value.title);
      formData.append('description', this.uploadForm.value.description);
      formData.append('category', this.uploadForm.value.category);
      formData.append('tags', this.uploadForm.value.tags);

      console.log('Upload payload:', formData);
      // Later: call your backend API or Azure Blob Storage here
    }
  }
}
