import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { ImageService } from '../services/image.service';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-download-modal',
  template: `
    <ion-content>
      <div class="download-modal-container">
        <div style="text-align: center">
          <h2 style="color: white" i18n="Downloading file or folder@@downloading">Downloading</h2>
        </div>
        <ion-progress-bar
          style="height: 50%; margin: auto; border-radius: 10px;"
          [value]="progress"
        ></ion-progress-bar>
        <ion-button
          block
          color="danger"
          (click)="cancelDownload()"
          class="modal-button"
          i18n="Cancel@@cancel"
          >Cancel</ion-button
        >
      </div>
    </ion-content>
  `,
  styleUrls: ['modals.scss'],
})
export class DownloadModalComponent implements OnInit {
  @Input() pathToDownload: string;
  @Input() image: any;
  @Input() imageFilesByFolder: { [key: string]: string[] } = {};
  @Input() foldersByFolder: { [key: string]: string[] } = {};
  folder: string;
  isFolder = false;
  progress = 0.0;
  totalImages = 1;
  downloadedImages = 0;
  downloadCancelled = false;

  constructor(
    private modalController: ModalController,
    private imageService: ImageService,
    private navParams: NavParams,
    private alertController: AlertController
  ) {
    this.pathToDownload = this.navParams.get('pathToDownload');
    this.image = this.navParams.get('image');
    this.imageFilesByFolder = this.navParams.get('imageFilesByFolder');
    this.foldersByFolder = this.navParams.get('foldersByFolder');
    this.isFolder = this.image == null;

    if (this.isFolder) {
      this.folder = this.pathToDownload;
      let numImages = 0;

      if (this.imageFilesByFolder[this.folder]) {
        numImages += this.imageFilesByFolder[this.folder].length;
      }

      if (this.foldersByFolder[this.folder]) {
        this.foldersByFolder[this.folder].forEach((subFolder) => {
          if (this.imageFilesByFolder[subFolder]) {
            numImages += this.imageFilesByFolder[subFolder].length;
          }
        });
      }
      this.totalImages = numImages;
    }
  }

  async ngOnInit() {
    await this.download();
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: message,
      mode: 'ios', // ios is nicer than md
      buttons: [
        {
          text: $localize`:Ok@@ok:OK`,
          handler: () => {
            this.dismiss();
          },
        },
      ],
    });
    await alert.present();
  }

  async download() {
    const imagesForDownload = [];
    if (this.isFolder) {
      if (this.imageFilesByFolder[this.folder]) {
        this.imageFilesByFolder[this.folder].forEach((image) => {
          imagesForDownload.push(image);
        });
      }
      if (this.foldersByFolder[this.folder]) {
        this.foldersByFolder[this.folder].forEach((folder) => {
          this.imageFilesByFolder[folder].forEach((image) => {
            imagesForDownload.push(image);
          });
          if (this.foldersByFolder[folder]) {
            this.foldersByFolder[folder].forEach((subFolder) => {
              this.imageFilesByFolder[subFolder].forEach((image) => {
                imagesForDownload.push(image);
              });
            });
          }
        });
      }
    } else {
      imagesForDownload.push(this.pathToDownload);
    }
    const interval = 800;
    let index = 0;
    for (const image of imagesForDownload) {
      index += 1;
      this.getImageForDownload(image, interval * index);
    }
  }

  getImageForDownload(imagePath: string, timeout: number) {
    setTimeout(() => {
      if (!this.downloadCancelled) {
        this.imageService.getFullResImage(imagePath).subscribe((response: any) => {
          if (!this.downloadCancelled) {
            const imagePathArray = imagePath.split('/');
            this.downloadImageFromBlob(response, imagePathArray[imagePathArray.length - 1]);
          }
        });
      }
    }, timeout);
  }

  downloadImageFromBlob(image: Blob, fileName: string) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        const base64data = reader.result.toString();
        Filesystem.writeFile({
          data: base64data,
          path: 'DCIM/Galleri/' + fileName,
          directory: Directory.ExternalStorage,
        })
          .then((onfulfilled?) => {
            this.downloadedImages += 1;
            this.progress = this.downloadedImages / this.totalImages;
            if (this.progress === 1.0) {
              let message = '';
              if (this.isFolder) {
                message = $localize`:Folder saved to gallery@@folderSavedToGallery:Folder saved to Gallery`;
              } else {
                message = $localize`:Picture saved to gallery@@imageSavedToGallery:Image saved to Gallery`;
              }
              this.showAlert(message);
            }
          })
          .catch((onrejected?) => {
            const message = $localize`:Not able to save image@@couldNotSaveImage:Could not save image`;
            this.showAlert(message);
          });
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  cancelDownload() {
    this.downloadCancelled = true;
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
