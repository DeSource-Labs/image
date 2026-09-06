import { Injectable, inject } from '@angular/core';
import { createImage, type DsImage } from '@desource/image';
import { DS_IMAGE_CONFIG } from './config.js';

@Injectable({
  providedIn: 'root'
})
export class DsImageService {
  private readonly config = inject(DS_IMAGE_CONFIG);
  private readonly image = createImage(this.config);

  create(): DsImage {
    return this.image;
  }
}
