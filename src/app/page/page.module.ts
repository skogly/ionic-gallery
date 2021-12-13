import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Page } from './page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { SwiperModule } from 'swiper/angular';
import { TabPageRoutingModule } from './page-routing.module';
import { NewFolderModalComponent } from '../modals/newFolderModal';
import { ImageModalComponent } from '../modals/imageModal';
import { DownloadModalComponent } from '../modals/downloadModal';
import { OptionsModalComponent } from '../modals/optionsModal';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SwiperModule,
    ExploreContainerComponentModule,
    TabPageRoutingModule,
  ],
  declarations: [
    Page,
    ImageModalComponent,
    NewFolderModalComponent,
    DownloadModalComponent,
    OptionsModalComponent,
  ],
})
export class PageModule {}
