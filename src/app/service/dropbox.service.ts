import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DropboxService {


  constructor(private http: HttpClient) {}

  public downloadFile(path: string, token: any): Observable<any> {
    let headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({ path: path })
      });
    const url = `https://content.dropboxapi.com/2/files/download`;
    return this.http.get(url, {
      headers,
      responseType: 'text',
    });
  }

  public updateFile(path: string, token: string, jsonData: any): Observable<any> {
    const url = `https://content.dropboxapi.com/2/files/upload`;
    const fileContent = JSON.stringify(jsonData);
    const header = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    const headers = header
      .set('Dropbox-API-Arg', `{"path": "${path}", "mode": "overwrite"}`)
      .set('Content-Type', 'application/octet-stream');
    return this.http.post(url, fileContent, { headers });
  }
}
