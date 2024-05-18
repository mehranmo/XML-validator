import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileVerificationService {
  private apiUrl = 'http://localhost:5000/upload';  // Adjust the URL as needed

  constructor(private http: HttpClient) {}

  uploadFile(fileData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, fileData);
  }
}
