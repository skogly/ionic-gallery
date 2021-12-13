import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-newfolder-modal',
  template: `
    <ion-content>
      <div class="new-folder-modal">
        <ion-label
          style="color: white; margin: auto"
          class="ion-text-center"
          i18n="Specify name for new folder@@specifyFolderName"
          >Specify name for new folder</ion-label
        >
        <ion-item class="new-folder-input">
          <ion-input [(ngModel)]="folderName" required placeholder=""></ion-input>
        </ion-item>
        <div class="bottom-buttons">
          <ion-button
            block
            color="primary"
            (click)="dismiss()"
            style="width: 90px"
            i18n="Cancel@@cancel"
            >Cancel</ion-button
          >
          <ion-button
            block
            color="success"
            (click)="createFolder()"
            style="width: 90px"
            i18n="Ok@@ok"
            >OK</ion-button
          >
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['modals.scss'],
})
export class NewFolderModalComponent {
  @Input() foldersByFolder: { [key: string]: string[] } = {};
  @Input() activeFolder = 'root';
  folderName: string;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private imageService: ImageService
  ) {
    this.foldersByFolder = this.navParams.get('foldersByFolder');
    console.log('first foldersbyfolder', this.foldersByFolder);
    this.activeFolder = this.navParams.get('activeFolder');
  }

  createFolder() {
    this.folderName = [this.activeFolder, this.folderName].join(this.imageService.slash);

    // Check if folder name already exists. If so, skip.
    if (this.foldersByFolder[this.activeFolder]?.includes(this.folderName)) {
      console.log('Already exists');
      return;
    }
    if (this.foldersByFolder[this.activeFolder]?.includes(this.folderName) === false) {
      console.log('New folder');
      this.foldersByFolder[this.activeFolder].push(this.folderName);
    } else {
      this.foldersByFolder[this.activeFolder] = [this.folderName];
    }

    /*
    if (this.foldersByFolder[this.activeFolder]) {
      console.log(
        'active folder in foldersbyfolder',
        this.foldersByFolder[this.activeFolder]
      );
      if (!this.foldersByFolder[this.activeFolder].includes(this.folderName)) {
        console.log('active folder does not include foldername');
        this.foldersByFolder[this.activeFolder].push(this.folderName);
      }
    } else {
      console.log('first folder in active folder');
      this.foldersByFolder[this.activeFolder] = [
        this.activeFolder + this.imageService.slash + this.folderName,
      ];
    }
    */
    console.log(this.foldersByFolder);
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
