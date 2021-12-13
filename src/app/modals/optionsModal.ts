import { Component, Input } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { ImageService } from '../services/image.service';
import { DownloadModalComponent } from './downloadModal';

@Component({
  selector: 'app-options-modal',
  template: `
    <ion-content>
      <div class="options-modal-container">
        <img *ngIf="image" class="image" style="height: 120px; margin: auto" [src]="image" />
        <ion-button
          block
          color="danger"
          (click)="promptDeleteDialog()"
          class="modal-button"
          i18n="Delete@@delete"
          >Delete</ion-button
        >
        <div *ngIf="!image" style="text-align: center; margin: auto; color: white">
          {{ fileName }}
        </div>
        <ion-button
          block
          color="success"
          (click)="promptDownloadModal()"
          class="modal-button"
          i18n="Download@@download"
          >Download</ion-button
        >
        <ion-button
          block
          color="primary"
          (click)="dismiss()"
          class="modal-button"
          i18n="Cancel@@cancel"
          >Cancel</ion-button
        >
      </div>
    </ion-content>
  `,
  styleUrls: ['modals.scss'],
})
export class OptionsModalComponent {
  @Input() path: string;
  @Input() image: any;
  @Input() imageFilesByFolder: any;
  @Input() foldersByFolder: any;
  objectToDelete: string;
  fileName = '';
  isFolder = false;

  constructor(
    private modalController: ModalController,
    private imageService: ImageService,
    private navParams: NavParams,
    private alertController: AlertController
  ) {
    this.path = this.navParams.get('path');
    console.log(this.path);

    this.image = this.navParams.get('image');
    this.imageFilesByFolder = this.navParams.get('imageFilesByFolder');
    this.foldersByFolder = this.navParams.get('foldersByFolder');
    const pathArray = this.path.split(this.imageService.slash);
    this.isFolder = !pathArray[pathArray.length - 1].includes('.');
    if (this.isFolder) {
      this.fileName = pathArray[pathArray.length - 1];
    }
    console.log('options modal', this.path);
  }

  promptDeleteDialog() {
    this.showDeleteAlert();
  }

  promptDownloadModal() {
    this.download();
    this.dismiss();
    return false;
  }

  async download() {
    const modal = await this.modalController.create({
      component: DownloadModalComponent,
      componentProps: {
        pathToDownload: this.path,
        image: this.image,
        imageFilesByFolder: this.imageFilesByFolder == null ? null : this.imageFilesByFolder,
        foldersByFolder: this.foldersByFolder,
      },
      cssClass: 'download-modal-class',
      swipeToClose: false,
      mode: 'ios', // ios is nicer than md
      backdropDismiss: true,
    });
    return await modal.present();
  }

  async showDeleteAlert() {
    const message = $localize`:Delete confirmation@@deleteConfirmation:Are you sure you want to delete `;
    const alert = await this.alertController.create({
      header: this.isFolder
        ? message + $localize`:This folder@@thisFolder:this folder` + '?'
        : message + $localize`:This image@@thisImage:this image` + '?',
      mode: 'ios', // ios is nicer than md
      cssClass: 'delete-alert-class',
      buttons: [
        { text: $localize`:No@@no:No`, role: 'cancel' },
        {
          text: $localize`:Yes@@yes:Yes`,
          handler: () => {
            this.deleteObject();
          },
        },
      ],
    });

    await alert.present();
  }

  deleteObject() {
    const pathArray = this.path.split(this.imageService.slash);
    this.path = pathArray.join(this.imageService.slash);
    this.imageService.deleteFromServer(this.path);
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
