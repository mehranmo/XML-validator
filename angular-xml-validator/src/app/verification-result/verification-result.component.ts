import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-verification-result',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './verification-result.component.html',
  styleUrls: ['./verification-result.component.scss']
})
export class VerificationResultComponent implements OnChanges {
  @Input() verificationResult: any;
  issuerDetails: any = {};
  subjectDetails: any = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['verificationResult'] && this.verificationResult) {
      this.issuerDetails = this.parseCertificateInfo(this.verificationResult['Certificate Info']['Issuer']);
      this.subjectDetails = this.parseCertificateInfo(this.verificationResult['Certificate Info']['Subject']);
    }
  }

  parseCertificateInfo(info: string): any {
    const parts = info.split(', ');
    const infoDict: any = {};
    parts.forEach(part => {
      const [key, value] = part.split(' = ');
      infoDict[key] = value;
    });
    return infoDict;
  }

  isValid() {
    return this.verificationResult && this.verificationResult['Signature Validity'] === 'Valid' && this.verificationResult['Date Within Validity'] === 'Valid';
  }
}
