import { Injectable, inject } from '@angular/core';
import { createImage, type DesourceImage } from '@desource/image-core';
import { DS_IMAGE_CONFIG } from './config.js';

@Injectable({
  providedIn: 'root'
})
export class DsImageService {
  private readonly config = inject(DS_IMAGE_CONFIG);

  create(): DesourceImage {
    return createImage(this.config);
  }
}
