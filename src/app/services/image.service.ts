import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HubConnection } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  public readonly slash = environment.slash;

  // Image objects arranged by folder
  private imagesByFolder$ = new BehaviorSubject({});
  // Image file strings arranged by folder
  private imageFilesByFolder$ = new BehaviorSubject({});
  // Folders arranged by folder
  private foldersByFolder$ = new BehaviorSubject({});

  private isLoading$ = new BehaviorSubject(true);
  private update$ = new BehaviorSubject(false);
  private status$ = new BehaviorSubject(false);
  private imagesByFolderDict: { [key: string]: any[] } = { root: [] };
  private imageFilesByFolderDict: { [key: string]: string[] } = {};
  private foldersByFolderDict: { [key: string]: string[] } = { root: [] };
  private allImages: string[] = [];
  private numImagesFromServer = 0;
  private hubConnection: HubConnection | undefined;

  private apiUrl = environment.imageServerUrl;
  private imageListUrl = this.apiUrl + '/images';
  private imageThumbnailUrl = this.apiUrl + '/thumbnail';
  private imageMobileResUrl = this.apiUrl + '/mobile';
  private imageFullResUrl = this.apiUrl + '/image';
  private deleteUrl = this.apiUrl + '/delete';
  private uploadImageUrl = this.apiUrl + '/upload';

  constructor(private httpClient: HttpClient) {
    this.getImageFiles();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl + '/imagehub')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.start().catch((err) => {
      this.status$.next(false);
    });

    this.hubConnection.onreconnecting(() => {
      this.isLoading$.next(true);
      this.status$.next(false);
    });

    this.hubConnection.onreconnected(() => {
      this.isLoading$.next(false);
      this.status$.next(true);
    });

    this.hubConnection.on('Notify', (data: any) => {
      const received = data;
      console.log('Received: ', received);
      // If notified of deleted images, clear data and download all images again
      if (received === 'deletedImages') {
        this.clearAllImages();
      }
      this.getImageFiles();
    });
  }

  get isLoading(): Observable<boolean> {
    return this.isLoading$;
  }

  get update(): Observable<boolean> {
    return this.update$;
  }

  get status(): Observable<boolean> {
    return this.status$;
  }

  get imagesByFolder(): Observable<{}> {
    return this.imagesByFolder$;
  }

  get imageFilesByFolder(): Observable<{}> {
    return this.imageFilesByFolder$;
  }

  get foldersByFolder(): Observable<{}> {
    return this.foldersByFolder$;
  }

  getImageFiles(): void {
    this.isLoading$.next(true);
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    this.httpClient.get(this.imageListUrl, { headers }).subscribe(
      (res: string[]) => {
        this.numImagesFromServer = res.length;

        const newImages = res.filter((server) => !this.allImages.some((local) => local === server));
        if (newImages.length > 0) {
          newImages.forEach((im: string) => {
            this.getThumbnailImage(im).subscribe((response: any) => {
              this.createImageFromBlob(response, im);
            });
          });
        } else {
          this.isLoading$.next(false);
        }
        this.status$.next(true);
      },
      (error: any) => {
        this.status$.next(false);
        setTimeout(() => {
          this.getImageFiles();
        }, 3000);
      }
    );
  }

  getThumbnailImage(path: string): Observable<Blob> {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    path = this.trimPath(path);
    return this.httpClient.post(
      this.imageThumbnailUrl,
      { path },
      { headers, responseType: 'blob' }
    );
  }

  getMobileResImage(path: string): Observable<Blob> {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    path = this.trimPath(path);
    return this.httpClient.post(
      this.imageMobileResUrl,
      { path },
      { headers, responseType: 'blob' }
    );
  }

  getFullResImage(path: string): Observable<Blob> {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    path = this.trimPath(path);
    return this.httpClient.post(this.imageFullResUrl, { path }, { headers, responseType: 'blob' });
  }

  updateImages() {
    this.clearAllImages();
    this.getImageFiles();
  }

  uploadImage(formData: FormData): void {
    this.httpClient.post(this.uploadImageUrl, formData).subscribe(() => {});
  }

  deleteFromServer(path: string): void {
    const headers = {
      'Content-Type': 'application/json',
    };
    path = this.trimPath(path);
    this.httpClient.post(this.deleteUrl, { path }, { headers }).subscribe(() => {});
  }

  private createImageFromBlob(image: Blob, path: string): void {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        const pathArray = path.split(this.slash);
        // Add 'root' as root folder
        pathArray.unshift('root');
        // Arrange image structure
        this.createImageStructure(pathArray, path, reader.result);
        // Arrange folder structure
        this.createFolderStructure(pathArray);
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  private createImageStructure(pathArray: string[], path: string, image: string | ArrayBuffer) {
    const parentFolderForImage = pathArray.slice(0, pathArray.length - 1).join(this.slash);

    if (!this.allImages.includes(path)) {
      if (parentFolderForImage in this.imageFilesByFolderDict) {
        this.imagesByFolderDict[parentFolderForImage].push(image);
        this.imageFilesByFolderDict[parentFolderForImage].push(path);
      } else {
        this.imagesByFolderDict[parentFolderForImage] = [image];
        this.imageFilesByFolderDict[parentFolderForImage] = [path];
      }
      this.imagesByFolder$.next(this.imagesByFolderDict);
      this.imageFilesByFolder$.next(this.imageFilesByFolderDict);
      this.allImages.push(path);
    }

    if (this.allImages.length === this.numImagesFromServer) {
      this.update$.next(true);
      this.isLoading$.next(false);
    }
  }

  private createFolderStructure(pathArray: string[]) {
    // We do not need the file, folders only
    pathArray.pop();

    while (pathArray.length > 1) {
      const parentElement = pathArray.slice(0, pathArray.length - 1).join(this.slash);
      const childElement = pathArray[pathArray.length - 1];
      if (this.foldersByFolderDict[parentElement]) {
        if (
          !this.foldersByFolderDict[parentElement].includes(
            parentElement + this.slash + childElement
          )
        ) {
          this.foldersByFolderDict[parentElement].push(parentElement + this.slash + childElement);
        }
      } else {
        this.foldersByFolderDict[parentElement] = [parentElement + this.slash + childElement];
      }
      pathArray.pop();
    }

    this.foldersByFolder$.next(this.foldersByFolderDict);
  }

  private trimPath(path: string) {
    // Make sure we remove 'root' if present
    const pathArray = path.split(this.slash);
    if (pathArray.includes('root')) {
      pathArray.shift();
    }
    return pathArray.join(this.slash);
  }

  private clearAllImages() {
    this.imagesByFolderDict = { root: [] };
    this.imageFilesByFolderDict = {};
    this.foldersByFolderDict = { root: [] };
    this.allImages = [];
  }
}
