import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-semester-result',
  templateUrl: './semester-result.component.html',
  styleUrls: ['./semester-result.component.scss']
})
export class SemesterResultComponent implements OnInit {
  token!: string;

  private readonly APP_KEY = '';
  private readonly APP_SECRET = '';
  private readonly REDIRECT_URI = 'https://velsuniversitytrolls.in/semester-result'; // replace with your own redirect URI

  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    // Get the authorization code and state from the query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const code: any = queryParams.get('code');
    const state = queryParams.get('state');

    // Check the state value to prevent CSRF attacks
    if (localStorage.getItem('dropbox-state') !== state) {
      console.error('Invalid state value');
      return;
    }

    // Exchange the authorization code for an access token
    const url = 'https://api.dropbox.com/oauth2/token';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${this.APP_KEY}:${this.APP_SECRET}`)}`,
    });
    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.REDIRECT_URI);
    this.http.post(url, params, { headers })
      .subscribe((response: any) => {
        const accessToken = response.access_token;
        this.token = accessToken;
        // Use the access token to make API calls
      });
  }
}
