import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageProcessorService {
  private readonly maxFileSize = 10 * 1024 * 1024;
  private readonly maxDimension = 960;
  private readonly imageQuality = 0.72;

  async process(file: File): Promise<string> {
    this.validateFile(file);

    const source = await this.readFile(file);
    const image = await this.loadImage(source);

    const scale = Math.min(1, this.maxDimension / Math.max(image.width, image.height));

    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Не удалось обработать изображение.');
    }

    context.fillStyle = '#fffaf4';
    context.fillRect(0, 0, width, height);

    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', this.imageQuality);
  }

  private validateFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      throw new Error('Выбранный файл не является изображением.');
    }

    if (file.size > this.maxFileSize) {
      throw new Error('Размер изображения не должен превышать 10 МБ.');
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Не удалось прочитать изображение.'));

          return;
        }

        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error('Не удалось прочитать изображение.'));
      };

      reader.readAsDataURL(file);
    });
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () => {
        reject(new Error('Файл изображения повреждён.'));
      };

      image.src = source;
    });
  }
}
