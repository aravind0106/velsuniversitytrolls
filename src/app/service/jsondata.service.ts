import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Replace with your actual Dropbox access token

// The path to your JSON file in Dropbox
const jsonFilePath = '/documents/vut.json';

@Injectable({
    providedIn: 'root'
})
export class JsonDataService {
    jsonData: any;

    constructor(private http: HttpClient,
        private snackBar: MatSnackBar) {
    }

    // Function to fetch the JSON data from Dropbox
    async fetchJsonData(filePath: string, token: any): Promise<any> {
        let jsonDta;
        const accessToken = token;
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({ path: filePath })
        });
        try {
            const response: any = await this.http.post('https://content.dropboxapi.com/2/files/download', null, {
                headers,
                responseType: 'text'
            }).toPromise();
            if (response) {
                jsonDta = JSON.parse(response);
                this.jsonData = jsonDta
            } else {
                this.snackBar.open('Data Not Fetched', 'Close', {
                    duration: 2000
                });
            }
        } catch {
            console.error('Token Expired')
        }
        return jsonDta;
    }

    // Function to upload the JSON data to Dropbox
    uploadJsonData(accessToken: any) {
        const url = `https://content.dropboxapi.com/2/files/upload`;
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({ path: jsonFilePath, mode: 'overwrite' })
        });
        const data = JSON.stringify(this.jsonData, null, 2);
        this.http.post(url, data, { headers })
            .pipe(
                catchError(error => {
                    console.error(error);
                    return throwError('Error uploading JSON data to Dropbox');
                })
            )
            .subscribe(() => {
                console.log('JSON data uploaded to Dropbox');
            });
    }

    // Function to add an object to the JSON data
    addObject(object: any, accessToken: any, jsonData: any) {
        this.jsonData = jsonData;
        this.jsonData.objects.push(object);
        this.uploadJsonData(accessToken);
    }

    // Function to delete an object from the JSON data
    deleteObject(objectId: number, accessToken: any, jsonData: any) {
        this.jsonData = jsonData;
        const objectIndex = this.jsonData.objects.findIndex((obj: any) => obj.id === objectId);
        if (objectIndex !== -1) {
            this.jsonData.objects.splice(objectIndex, 1);
            this.uploadJsonData(accessToken);
        }
    }

    // Function to update an object in the JSON data
    updateObject(object: any, accessToken: any, jsonData: any): void {
        this.jsonData = jsonData;
        const objectIndex = this.jsonData.objects.findIndex((obj: any) => obj.id === object.id);
        if (objectIndex !== -1) {
            this.jsonData.objects[objectIndex] = object;
            this.uploadJsonData(accessToken);
        }
    }
}
