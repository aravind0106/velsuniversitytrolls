import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Info } from '../class/info';
import { ListFolderResult } from '../interface/list-folder';
import { DropboxService } from '../service/dropbox.service';
import { JsonDataService } from '../service/jsondata.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit {
  private readonly APP_KEY = '';
  private readonly REDIRECT_URI = 'https://velsuniversitytrolls.in/semester-result'; // replace with your own redirect URI

  private USERNAME = 'vutadmin@gmail.com';
  private PASSWORD = 'S3cur3@123';
  private ACCESS_TOKEN: any;
  animationDuration!: number;
  stringLength!: number;
  newUpdates!: string;
  
  imagePath: any[] = [];
  imageTemporaryLink: any[] = [];
  imageTemporaryDate: any[] = [];
  now: number = 0;
  isSorted: boolean;
  infoDetails: any;
  username!: string;
  password!: string;
  displayAdminsMenu: boolean = false;
  showLoginErr: boolean = false;
  infoMessage!: string;
  isSaving: boolean = false;

  constructor(private http: HttpClient,
    private dropboxService: DropboxService,
    private jsonDataServie: JsonDataService,
    private snackBar: MatSnackBar) {
      setInterval(() => {
        this.now = Date.now();
      }, 1);
      this.isSorted = false;

  }
  ngAfterViewInit(): void {
      window.removeEventListener("resize", this.setAnimationDuration.bind(this));
  }

  onSubmit(form: NgForm) {

    if ((form.value.username === this.USERNAME.toLowerCase()) && (form.value.password === this.PASSWORD)) {
      this.showLoginErr = false;
      this.displayAdminsMenu = true;
    } else {
      this.displayAdminsMenu = false;
      this.showLoginErr = true;
    }
  }

  fetchToken() {
    this.http.get<any>('/assets/token.json').subscribe((data) => {
      this.ACCESS_TOKEN = data['dropbox'];
      if (data['dropbox']) {
      this.getImage();
     // this.loadJsonData();
      // this.setAnimationDuration();
      }
    });
  }

  ngOnInit() {
    this.fetchToken();
    this.fetchImportantUpdates();
  }
  fetchImportantUpdates() {
    this.http.get<any>('/assets/info.json').subscribe((data) => {
      if (data) {
        this.infoDetails = data;
        this.setInfoMessageAnimation(data);
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("resize", this.setAnimationDuration.bind(this));
  }

  setAnimationDuration() {
    const viewportWidth = window.innerWidth;
    if(this.stringLength !== undefined) {
      this.animationDuration = (((this.stringLength + 86) / 10) + (viewportWidth / 100));
    } else {
      this.animationDuration = ((86 / 10) + (viewportWidth / 100));
    }
  }

  loadAll() {
    
  }

  async loadJsonData() {
    const infoPath = '/documents/info.json';
    const info = await this.jsonDataServie.fetchJsonData(infoPath, this.ACCESS_TOKEN);
    if (info) {
      this.infoDetails = info;
      this.setInfoMessageAnimation(info);
    } else {
      console.log(`File ${infoPath} not fetched`)
    }
  }

  setInfoMessageAnimation(message: any[]) {
    let myString:  any;
    if(message) {
      myString = ""
      message.forEach(m => {
        myString += m.message + "  -  ";
      })
    }
    this.newUpdates = myString;
    this.stringLength = myString.length;
    this.setAnimationDuration();
    window.addEventListener("resize", this.setAnimationDuration.bind(this));
  }

  updateJsonData(message: string) {
    this.isSaving = true;
    const filePath = '/documents/info.json';
    // Download the file
    this.dropboxService.downloadFile(filePath, this.ACCESS_TOKEN).subscribe((fileContent: string) => {
      let jsonData: any[] = [];
      jsonData = JSON.parse(fileContent);

      // Create a new record and set its ID
      let data = new Info();
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // format: YYYYMMDD
      const timePart = now.toISOString().slice(11, 19).replace(/:/g, ''); // format: HHMMSS
      const timestampString = datePart + timePart;
      
      const newRecord = {
        "id": parseInt(timestampString, 10),
        "message": message,
        "createdDate": new Date(),
        "updatedDate": new Date()
      };
      data = newRecord;

      // Add the new record to the array of records
      jsonData.push(data);

      // Upload the updated file
      this.dropboxService.updateFile(filePath, this.ACCESS_TOKEN, jsonData).subscribe((response) => {
        console.log('File updated successfully!' + response);
        this.infoDetails = jsonData;
        this.setInfoMessageAnimation(jsonData);
        this.isSaving = false;
        this.infoMessage = '';
        this.snackBar.open('Saved Successfully', 'Close', {
          duration: 2000
        });
      });
    });
  }

  deleteJsonData(element: any) {
    const filePath = '/documents/info.json';
    // Download the file
    this.dropboxService.downloadFile(filePath, this.ACCESS_TOKEN).subscribe((fileContent: string) => {
      let jsonData: any[] = [];
      jsonData = JSON.parse(fileContent);

      const objectIndex = jsonData.findIndex((obj: any) => obj.id === element.id);
      if (objectIndex !== -1) {
          jsonData.splice(objectIndex, 1);
          this.dropboxService.updateFile(filePath, this.ACCESS_TOKEN, jsonData).subscribe((response) => {
            console.log('File updated successfully!' + response);
            this.infoDetails = jsonData;
            this.setInfoMessageAnimation(jsonData);
            this.snackBar.open('Deleted Successfully', 'Close', {
              duration: 2000
            });
          });
      } else {
        this.snackBar.open('No such Id', 'Close', {
          duration: 2000
        });
      }
    });
  }

  getImageByPath(path: string) {
    
    let temporaryLink: any;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ` + this.ACCESS_TOKEN,
      'Content-Type': 'application/json'
    });
    
    const requestBody = {
      "path": path
    };
    
    const url = "https://api.dropboxapi.com/2/files/get_temporary_link";
    
    try {
      this.http.post<any>(url, requestBody, { headers }).subscribe(data => {
        this.isSorted = false;
        temporaryLink = data['link'];
        this.imageTemporaryLink.push(temporaryLink);
        this.imageTemporaryDate.push(data);

        if(this.imageTemporaryDate && this.imageTemporaryDate.length > 0) {
          this.imageTemporaryDate.sort((a, b) => {
            return new Date(b.metadata.client_modified).getTime() - new Date(a.metadata.client_modified).getTime();
          });
          this.isSorted = true;
        }
      });
    } catch {
      this.snackBar.open('Token Expired', 'Close', {
        duration: 2000
      });
      
    }
  }

  async getImagePath() {
    const pathUrl = "https://api.dropboxapi.com/2/files/list_folder";
    const headers = new HttpHeaders({
      "Authorization": `Bearer ` + this.ACCESS_TOKEN,
      "Content-Type": "application/json"
    });
    const body = {
      path: "/images",
    };
    let result: any;
    try {
      result = await this.http.post<ListFolderResult>(pathUrl, body, { headers }).toPromise();
    }
    catch {
      this.snackBar.open('Token Expired', 'Close', {
        duration: 2000
      });
    }
    if (result && result.entries.length > 0) {
      this.imagePath = result.entries;
      if (this.imagePath) {
        this.imageTemporaryLink = [];
        this.imageTemporaryDate = [];
        this.imagePath.sort((a, b) => {
          return new Date(b.client_modified).getTime() - new Date(a.client_modified).getTime();
        });
        this.imagePath.forEach(m => {
          this.getImageByPath(m.path_lower);
        })
      }
    }
  }
  
   getImage() {
    this.getImagePath();
  } 
  public authorize(): void {
  
      // Generate a random state value to prevent CSRF attacks
      const state = Math.random().toString(36).substring(7);
  
      // Save the state value in local storage
      localStorage.setItem('dropbox-state', state);
  
      // Redirect to Dropbox authorization page
      const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${this.APP_KEY}&redirect_uri=${this.REDIRECT_URI}&state=${state}`;
      window.location.href = authUrl;
  }
}
