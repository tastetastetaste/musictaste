import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import { IReleaseCover, IUserImage } from 'shared';
import sharp from 'sharp';

export type Upload = { buffer: Buffer; mimetype: string };

interface ResizedImage {
  buffer: Buffer;
  suffix: string;
  extension: string;
}

interface Size {
  suffix: string;
  width?: number;
  height?: number;
  quality?: number;
}

@Injectable()
export class ImagesService {
  private s3: S3Client;
  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get('AWS_REGION'),
      endpoint: this.configService.get('AWS_ENDPOINT'),
    });
  }

  private releaseSizes: Size[] = [
    { suffix: 'original', quality: 100 },
    { suffix: 'lg', width: 600 },
    { suffix: 'md', width: 350 },
    { suffix: 'sm', width: 150 },
  ];

  private userSizes: Size[] = [
    { suffix: 'original', quality: 100 },
    { suffix: 'md', width: 300, height: 300 },
    { suffix: 'sm', width: 100, height: 100 },
  ];

  async storeUpload(
    { buffer }: Upload,
    imageFor: 'release' | 'user',
    allowGif?: boolean,
  ) {
    const container =
      this.configService.get('NODE_ENV') === 'production'
        ? imageFor === 'user'
          ? 'u'
          : 'r'
        : imageFor === 'user'
          ? 'u-dev'
          : 'r-dev';

    const id = nanoid(11);
    const sizes = imageFor === 'user' ? this.userSizes : this.releaseSizes;

    const { resizedImages, isAnimated } = await this.resizeImages(
      buffer,
      sizes,
      allowGif,
    );

    await this.uploadImagesToS3(resizedImages, container, id);

    return {
      path: `${container}/${id}.${isAnimated ? 'animated.webp' : 'webp'}`,
    };
  }

  async storeUploadFromUrl(url: string, imageFor: 'release' | 'user') {
    const container =
      this.configService.get('NODE_ENV') === 'production'
        ? imageFor === 'user'
          ? 'u'
          : 'r'
        : imageFor === 'user'
          ? 'u-dev'
          : 'r-dev';

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const id = nanoid(11);
      const sizes = imageFor === 'user' ? this.userSizes : this.releaseSizes;

      const { resizedImages, isAnimated } = await this.resizeImages(
        buffer,
        sizes,
        false,
      );

      await this.uploadImagesToS3(resizedImages, container, id);

      return {
        path: `${container}/${id}.${isAnimated ? 'animated.webp' : 'webp'}`,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      console.error('url', url);
      console.error('imageFor', imageFor);
      return null;
    }
  }

  private async resizeImages(
    buffer: Buffer,
    sizes: Size[],
    allowAnimated = false, // Store additional animated version of each size if the picture is animated
  ): Promise<{ resizedImages: ResizedImage[]; isAnimated: boolean }> {
    const resizedImages: ResizedImage[] = [];

    const metadata = await sharp(buffer).metadata();
    const isAnimated = !!allowAnimated && metadata.pages > 1;

    // Resize and convert to webp
    const processImage = async (size: Size, animate: boolean) => {
      let pipeline = sharp(buffer, { animated: animate });
      if (size.width || size.height) {
        pipeline = pipeline.resize({
          width: size.width,
          height: size.height,
        });
      }
      return pipeline.webp(animate ? {} : { quality: size.quality }).toBuffer();
    };

    for (const size of sizes) {
      if (size.suffix === 'original') {
        const staticBuffer = await processImage(size, false);
        resizedImages.push({
          buffer: staticBuffer,
          suffix: 'original',
          extension: 'webp',
        });

        if (isAnimated) {
          const animatedBuffer = await processImage(size, true);
          resizedImages.push({
            buffer: animatedBuffer,
            suffix: 'original',
            extension: 'animated.webp',
          });
        }
      } else {
        const staticBuffer = await processImage(size, false);
        resizedImages.push({
          buffer: staticBuffer,
          suffix: size.suffix,
          extension: 'webp',
        });

        if (isAnimated) {
          const animatedBuffer = await processImage(size, true);
          resizedImages.push({
            buffer: animatedBuffer,
            suffix: size.suffix,
            extension: 'animated.webp',
          });
        }
      }
    }

    return { resizedImages, isAnimated };
  }

  private async uploadImagesToS3(
    resizedImages: ResizedImage[],
    container: string,
    id: string,
  ) {
    await Promise.all(
      resizedImages.map((resizedImage) =>
        this.s3.send(
          new PutObjectCommand({
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key:
              resizedImage.suffix === 'original'
                ? `${container}/${id}.${resizedImage.extension}`
                : `${container}/${resizedImage.suffix}/${id}.${resizedImage.extension}`,
            Body: resizedImage.buffer,
            ContentType: 'image/webp',
          }),
        ),
      ),
    );
  }

  async deleteImage(path: string, imageFor: 'release' | 'user') {
    try {
      const parts = path.split('/');
      if (parts.length < 2) return;
      const container = parts[0];
      const filename = parts[1];
      const extension = filename.includes('.')
        ? filename.split('.').slice(1).join('.')
        : '';
      const id = filename.split('.')[0];

      const sizes = imageFor === 'user' ? this.userSizes : this.releaseSizes;
      const keysToDelete: string[] = [];

      for (const size of sizes) {
        const basePath =
          size.suffix === 'original'
            ? container
            : `${container}/${size.suffix}`;

        // Delete the main file
        keysToDelete.push(`${basePath}/${id}.${extension}`);

        // Delete static fallback if animated
        if (extension === 'animated.webp') {
          keysToDelete.push(`${basePath}/${id}.webp`);
        }
      }

      await Promise.all(
        keysToDelete.map((key) =>
          this.s3.send(
            new DeleteObjectCommand({
              Bucket: this.configService.get('AWS_BUCKET_NAME'),
              Key: key,
            }),
          ),
        ),
      );
    } catch (error) {
      console.error('Failed to delete image from S3', error);
    }
  }

  getImageUrl(path?: string) {
    return !path ? null : `${this.configService.get('CDN_URL')}${path}`;
  }

  getUserImage(imageUrl?: string, allowAnimated: boolean = false): IUserImage {
    if (!imageUrl) return null;

    const parts = imageUrl.split('/');
    if (parts.length < 2) return null;
    const container = parts[0];
    let filename = parts[1];

    if (!allowAnimated && filename.endsWith('.animated.webp')) {
      filename = filename.replace('.animated.webp', '.webp');
    }

    return {
      md: this.getImageUrl(`${container}/md/${filename}`),
      sm: this.getImageUrl(`${container}/sm/${filename}`),
      original: this.getImageUrl(`${container}/${filename}`),
    };
  }

  getReleaseCover(imageUrl?: string): IReleaseCover {
    if (!imageUrl) return null;

    const container = imageUrl.split('/')[0];

    const name = imageUrl.split('/')[1];

    return {
      lg: this.getImageUrl(`${container}/lg/${name}`),
      md: this.getImageUrl(`${container}/md/${name}`),
      sm: this.getImageUrl(`${container}/sm/${name}`),
      original: this.getImageUrl(`${container}/${name}`),
    };
  }
}
