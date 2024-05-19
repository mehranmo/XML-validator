import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FileVerificationService } from '../services/file-verification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() verificationResult = new EventEmitter<any>();
  @Output() xmlContent = new EventEmitter<string>();
  form: FormGroup;
  fileName: string = '';

  constructor(private fb: FormBuilder, private fileVerificationService: FileVerificationService) {
    this.form = this.fb.group({
      file: [null]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.form.patchValue({
        file: file
      });
      const reader = new FileReader();
      reader.onload = () => {
        this.xmlContent.emit(reader.result as string);
      };
      reader.readAsText(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  submit() {
    const formData = new FormData();
    const fileControl = this.form.get('file');
    if (fileControl && fileControl.value) {
      formData.append('file', fileControl.value);
    }

    this.fileVerificationService.uploadFile(formData).subscribe({
      next: result => {
        console.log('Received result from Flask server:', result);
        this.verificationResult.emit(result);  // Emit the result to the parent component
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error uploading file:', error.message);
        console.error('Full error object:', error);
      }
    });
  }
}
