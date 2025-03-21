import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api-diyalumafallsinn.sensze.com/api/ProductList';

  constructor(private http: HttpClient) { }

  getPosts(): Observable<any> {
    return this.http.post(this.baseUrl, {}); // POST request එකක් යවනවා. body එකක් අවශ්‍ය නම් මෙතන දෙන්න.
  }
}