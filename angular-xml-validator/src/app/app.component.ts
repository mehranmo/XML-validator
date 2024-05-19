import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { VerificationResultComponent } from './verification-result/verification-result.component';
import { XmlDisplayComponent } from './xml-display/xml-display.component';
import { TestComponent } from './test/test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FileUploadComponent,
    VerificationResultComponent,
    XmlDisplayComponent,
    TestComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  verificationResult: any;
  xmlContent: string = '';

  handleVerificationResult(result: any) {
    console.log('Handling verification result in AppComponent:', result);
    this.verificationResult = result;
  }

  handleXmlContent(content: string) {
    this.xmlContent = content;
  }
}
