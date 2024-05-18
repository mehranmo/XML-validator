import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { VerificationResultComponent } from './verification-result/verification-result.component';
import { TestComponent } from './test/test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FileUploadComponent,
    VerificationResultComponent,
    TestComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  verificationResult: any;

  handleVerificationResult(result: any) {
    console.log('Handling verification result in AppComponent:', result);
    this.verificationResult = result;
  }
}
