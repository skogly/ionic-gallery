import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ImageService } from '../services/image.service';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { ImageModalComponent } from '../modals/imageModal';
import { NewFolderModalComponent } from '../modals/newFolderModal';
import { OptionsModalComponent } from '../modals/optionsModal';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-page',
  templateUrl: 'page.html',
  styleUrls: ['page.scss'],
})
export class Page implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  // Image objects arranged by folder from image service
  imagesByFolder: { [key: string]: any[] } = {};
  // Image file strings arranged by folder from image service
  imageFilesByFolder: { [key: string]: string[] } = {};
  // Folders arranged by folder from image service
  foldersByFolder: { [key: string]: string[] } = {};
  // Initial folder
  activeFolder = 'root';
  // Contains previous and next folders for swiping back and forth
  prevFolders = [];
  nextFolders = [];

  isLoading: boolean;
  serverStatus: boolean;

  config: SwiperOptions = {
    zoom: true,
    centeredSlides: true,
    initialSlide: 0,
    fadeEffect: { crossFade: true },
    speed: 10,
    effect: 'fade',
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
  };

  constructor(
    public imageService: ImageService,
    private modalController: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private changeRef: ChangeDetectorRef,
    private platform: Platform
  ) {}

  async ngOnInit() {
    this.imageService.imagesByFolder.subscribe((val) => {
      this.imagesByFolder = val;
    });
    this.imageService.imageFilesByFolder.subscribe((val) => {
      this.imageFilesByFolder = val;
    });
    this.imageService.foldersByFolder.subscribe((val) => {
      this.foldersByFolder = val;
    });
    this.imageService.update.subscribe((doUpdate) => {
      // Wait one second to make sure that the folder structure in image service is finished
      setTimeout(() => {
        if (doUpdate === true) {
          let folderStillExists = false;
          try {
            for (const key in this.foldersByFolder) {
              if (this.foldersByFolder[key].includes(this.activeFolder)) {
                folderStillExists = true;
              }
            }
            if (this.activeFolder === 'root') {
              folderStillExists = true;
            }
          } catch (error) {
            folderStillExists = false;
          }

          if (folderStillExists === false) {
            this.activeFolder = this.prevFolders.pop();
          } else {
            this.nextFolders.pop();
          }
          this.changeRef.detectChanges();
        }
      }, 1000);
    });
    this.imageService.isLoading.subscribe((loading) => {
      this.isLoading = loading;
    });
    this.imageService.status.subscribe((status) => {
      this.serverStatus = status;
    });
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack();
    });
  }

  goBack(): void {
    if (this.prevFolders.length > 0) {
      this.nextFolders.push(this.activeFolder);
      this.activeFolder = this.prevFolders.pop();
      this.changeRef.detectChanges();
    }
  }

  goForward(): void {
    if (this.nextFolders.length > 0) {
      this.prevFolders.push(this.activeFolder);
      this.activeFolder = this.nextFolders.pop();
      this.changeRef.detectChanges();
    }
  }

  touchEnd(event): void {
    if (this.swiper.swiperRef !== undefined) {
      if (event.swipeDirection === 'prev') {
        this.goBack();
      } else if (event.swipeDirection === 'next') {
        this.goForward();
      }
    }
  }

  showFolder(folder: number) {
    this.prevFolders.push(this.activeFolder);
    this.nextFolders = [];
    this.activeFolder = this.foldersByFolder[this.activeFolder][folder];
    this.changeRef.detectChanges();
  }

  async openImage(index: number) {
    const path = this.imageFilesByFolder[this.activeFolder][index];
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      componentProps: {
        imagePath: path,
        imageFiles: this.imageFilesByFolder[this.activeFolder],
        indexInActiveFolder: index,
      },
      cssClass: 'image-modal',
      swipeToClose: true,
      mode: 'ios', // ios is nicer than md
      backdropDismiss: true,
    });
    return await modal.present();
  }

  async createNewFolder() {
    const modal = await this.modalController.create({
      component: NewFolderModalComponent,
      componentProps: {
        foldersByFolder: this.foldersByFolder,
        activeFolder: this.activeFolder,
      },
      cssClass: 'new-folder-modal',
      swipeToClose: true,
      mode: 'ios', // ios is nicer than md
      backdropDismiss: true,
    });
    return await modal.present();
  }

  promptFolderOptionsModal(index) {
    const folderPath = this.foldersByFolder[this.activeFolder][index];
    this.createOptionsModal(this.foldersByFolder[this.activeFolder][index], null);
    return false;
  }

  promptImageOptionsModal(index) {
    const imagePath = this.imageFilesByFolder[this.activeFolder][index];
    this.createOptionsModal(imagePath, this.imagesByFolder[this.activeFolder][index]);
    return false;
  }

  async createOptionsModal(path: string, image: any) {
    const modal = await this.modalController.create({
      component: OptionsModalComponent,
      componentProps: {
        path,
        image,
        imageFilesByFolder: this.imageFilesByFolder,
        foldersByFolder: this.foldersByFolder,
      },
      cssClass: image == null ? 'options-modal-class' : 'image-options-modal-class',
      swipeToClose: true,
      mode: 'ios', // ios is nicer than md
      backdropDismiss: true,
    });
    return await modal.present();
  }

  async selectImageSource() {
    const buttons = [
      {
        text: $localize`:Choose file@@chooseFile:Choose file`,
        icon: 'attach',
        handler: () => {
          this.fileInput.nativeElement.click();
        },
      },
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: $localize`:Upload images@@uploadImages:Upload image(s)`,
      buttons,
    });
    await actionSheet.present();
  }

  onFileSelect() {
    const fileArray: Array<File> = this.fileInput.nativeElement.files;
    const pathArray = this.activeFolder.split(this.imageService.slash);

    // Remove 'root' before sending path to image server
    if (pathArray.includes('root')) {
      pathArray.shift();
    }
    const path = pathArray.join(this.imageService.slash);

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('FilePath', path + this.imageService.slash + file.name);
      formData.append('ImageFile', file, file.name);
      this.imageService.uploadImage(formData);
    }
  }

  updateImages(event) {
    this.imageService.updateImages();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
