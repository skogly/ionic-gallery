import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ImageService } from '../services/image.service';
import SwiperCore, { EffectFade, SwiperOptions, Zoom } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { OptionsModalComponent } from './optionsModal';

SwiperCore.use([EffectFade, Zoom]);

@Component({
  selector: 'app-image-modal',
  template: `
    <swiper
      class="swiper-container"
      [config]="config"
      (transitionEnd)="slideChanged($event)"
      (doubleTap)="slideZoomed($event)"
      #swiper
    >
      <ng-template swiperSlide class="swiper-slide">
        <div class="swiper-zoom-container">
          <img class="image" [src]="prevImage" /></div
      ></ng-template>
      <ng-template swiperSlide class="swiper-slide">
        <div class="swiper-zoom-container" id="mainSwiperContainer">
          <div class="spinner" *ngIf="isLoading">
            <ion-spinner name="lines" color="tertiary"></ion-spinner>
          </div>
          <img (contextmenu)="promptOptionsModal($event)" class="image" [src]="image" /></div
      ></ng-template>
      <ng-template swiperSlide class="swiper-slide"
        ><div class="swiper-zoom-container">
          <img class="image" [src]="nextImage" /></div
      ></ng-template>
    </swiper>
  `,
  styleUrls: ['modals.scss'],
})
export class ImageModalComponent implements OnInit {
  @Input() indexInActiveFolder: number;
  @Input() imageFiles: string[] = [];
  @Input() imagesInFolder: any[] = [];
  @Input() imageFilesByFolder: { [key: string]: string[] } = {};
  @Input() foldersByFolder: { [key: string]: string[] } = {};
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;
  prevPrevImage: any;
  prevImage: any;
  image: any;
  nextImage: any;
  nextNextImage: any;
  index = 0;
  activeSlideIndex = 1;
  config: SwiperOptions = {
    zoom: {
      maxRatio: 3,
    },
    centeredSlides: true,
    initialSlide: this.activeSlideIndex,
    fadeEffect: { crossFade: true },
    speed: 10,
    effect: 'fade',
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
  };
  platform: any;
  imageDownloaded = false;
  message = '';
  isLoading = false;

  constructor(
    private modalController: ModalController,
    private imageService: ImageService,
    private navParams: NavParams
  ) {
    this.index = this.navParams.get('indexInActiveFolder');
    this.imageFiles = this.navParams.get('imageFiles');

    // Download image clicked from view.
    // First show medium resolution image
    // until high resolution image has been downloaded
    console.log(this.imageFiles[this.index]);

    this.getImageFullRes(this.index);
    setTimeout(() => {
      this.imageService
        .getMobileResImage(this.imageFiles[this.index])
        .subscribe((response: any) => {
          this.createImageFromBlob(response, 0);
        });
    }, 15);
  }

  ngOnInit(): void {
    // Download prev and next images in the background
    this.getPrevImage();
    this.getNextImage();
    this.getPrevPrevImage();
    this.getNextNextImage();
  }

  slideChanged(event): void {
    console.log(event.swipeDirection);
    if (this.swiper.swiperRef !== undefined) {
      // If the image is changed, rearrange images and download missing images
      // so that we have two images ready in both directions (prev, prevPrev, next, nextNext)
      // These images are downloaded in medium resolution for a little speedup.
      if (this.swiper.swiperRef.activeIndex < this.activeSlideIndex) {
        if (this.index > 0) {
          this.index = this.index - 1;
          let tempImage = this.image;
          this.image = this.prevImage;
          this.nextImage = tempImage;
          tempImage = this.prevPrevImage;
          this.prevImage = tempImage;
          this.getPrevPrevImage();
          this.getNextNextImage();
          this.swiper.swiperRef.slideTo(1, 1, false);
        } else {
          this.swiper.swiperRef.slideTo(1, 1, false);
        }
      } else if (this.swiper.swiperRef.activeIndex > this.activeSlideIndex) {
        if (this.index < this.imageFiles.length - 1) {
          this.index = this.index + 1;
          let tempImage = this.image;
          this.image = this.nextImage;
          this.prevImage = tempImage;
          tempImage = this.nextNextImage;
          this.nextImage = tempImage;
          this.getNextNextImage();
          this.getPrevPrevImage();
          this.swiper.swiperRef.slideTo(1, 1, false);
        } else {
          this.swiper.swiperRef.slideTo(1, 1, false);
        }
      }
    }
  }

  // Zooming in and out in the image by double tap
  slideZoomed(event): void {
    if (this.swiper.swiperRef !== undefined) {
      if (this.swiper.swiperRef.zoom.scale === 3) {
        this.swiper.swiperRef.zoom.out;
      } else {
        this.swiper.swiperRef.zoom.in;
        // index != indexInActiveFolder means that the user has
        // clicked on an image and then swiped right/left before
        // double tapping another image. Download full resolution
        // image to get higher details.
        if (this.index !== this.navParams.get('indexInActiveFolder')) {
          this.getImageFullRes(this.index);
        }
      }
    }
  }

  getPrevPrevImage(): void {
    if (this.index > 1) {
      this.imageService
        .getMobileResImage(this.imageFiles[this.index - 2])
        .subscribe((response: any) => {
          this.createImageFromBlob(response, -2);
        });
    }
  }

  getPrevImage(): void {
    if (this.index > 0) {
      this.imageService
        .getMobileResImage(this.imageFiles[this.index - 1])
        .subscribe((response: any) => {
          this.createImageFromBlob(response, -1);
        });
    }
  }

  getImage(): void {
    this.imageService.getMobileResImage(this.imageFiles[this.index]).subscribe((response: any) => {
      this.createImageFromBlob(response, 0);
    });
  }

  getImageFullRes(index: number): void {
    this.imageService.getFullResImage(this.imageFiles[index]).subscribe((response: any) => {
      this.createHiResImageFromBlob(response, index);
    });
  }

  getNextImage(): void {
    if (this.index < this.imageFiles.length - 1) {
      this.imageService
        .getMobileResImage(this.imageFiles[this.index + 1])
        .subscribe((response: any) => {
          this.createImageFromBlob(response, 1);
        });
    }
  }

  getNextNextImage(): void {
    if (this.index < this.imageFiles.length - 2) {
      this.imageService
        .getMobileResImage(this.imageFiles[this.index + 2])
        .subscribe((response: any) => {
          this.createImageFromBlob(response, 2);
        });
    }
  }

  createImageFromBlob(image: Blob, index: number) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        if (index === -2) {
          this.prevPrevImage = reader.result;
        } else if (index === -1) {
          this.prevImage = reader.result;
        } else if (index === 0) {
          this.image = reader.result;
        } else if (index === 1) {
          this.nextImage = reader.result;
        } else if (index === 2) {
          this.nextNextImage = reader.result;
        }
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  createHiResImageFromBlob(image: Blob, index: number) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        if (index === this.index) {
          this.image = reader.result;
        }
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  promptOptionsModal(event) {
    this.createOptionsModal();
    return false;
  }

  async createOptionsModal() {
    console.log(this.imageFiles[this.index]);

    const modal = await this.modalController.create({
      component: OptionsModalComponent,
      componentProps: {
        path: this.imageFiles[this.index],
        image: this.image,
        imageFilesByFolder: this.imageFilesByFolder,
        foldersByFolder: this.foldersByFolder,
      },
      cssClass: 'image-options-modal-class',
      swipeToClose: true,
      mode: 'ios', // ios is nicer than md
      backdropDismiss: true,
    });
    return await modal.present();
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
