import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { IReleaseCover, IUserImage } from 'shared';
import sharp from 'sharp';

export type Upload = { buffer: Buffer; mimetype: string };

interface ResizedImage {
  buffer: Buffer;
  suffix: string;
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

  private releaseSizes: {
    suffix: string;
    size?: number;
    quality?: number;
  }[] = [
    { suffix: 'original' },
    { suffix: 'lg', size: 600 },
    { suffix: 'md', size: 350 },
    { suffix: 'sm', size: 150 },
  ];

  private userSizes: {
    suffix: string;
    size?: number;
    quality?: number;
  }[] = [
    { suffix: 'original' },
    { suffix: 'md', size: 300 },
    { suffix: 'sm', size: 100 },
  ];

  async storeUpload({ buffer }: Upload, imageFor: 'release' | 'user') {
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

    const resizedImages = await this.resizeImages(buffer, sizes, imageFor);

    await this.uploadImagesToS3(resizedImages, container, id);

    return { path: `${container}/${id}.jpeg` };
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

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const id = nanoid(11);
    const sizes = imageFor === 'user' ? this.userSizes : this.releaseSizes;

    const resizedImages = await this.resizeImages(buffer, sizes, imageFor);

    await this.uploadImagesToS3(resizedImages, container, id);

    return { path: `${container}/${id}.jpeg` };
  }

  private async resizeImages(
    buffer: Buffer,
    sizes: { suffix: string; size?: number; quality?: number }[],
    imageFor: 'release' | 'user',
  ): Promise<ResizedImage[]> {
    return Promise.all(
      sizes.map(async (size) => {
        const resizedImage =
          size.suffix === 'original'
            ? await sharp(buffer).jpeg({ quality: 100 }).toBuffer()
            : await sharp(buffer)
                .resize(
                  imageFor === 'release'
                    ? { width: size.size }
                    : { width: size.size, height: size.size },
                )
                .jpeg({ quality: size.quality })
                .toBuffer();
        return { buffer: resizedImage, suffix: size.suffix };
      }),
    );
  }

  private async uploadImagesToS3(
    resizedImages: ResizedImage[],
    container: string,
    id: string,
  ) {
    for (const resizedImage of resizedImages) {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key:
          resizedImage.suffix === 'original'
            ? `${container}/${id}.jpeg`
            : `${container}/${resizedImage.suffix}/${id}.jpeg`,
        Body: resizedImage.buffer,
        ContentType: 'image/jpeg',
      });

      await this.s3.send(command);
    }
  }

  getImageUrl(path?: string) {
    return !path ? null : `${this.configService.get('CDN_URL')}${path}`;
  }

  getUserImage(imageUrl?: string): IUserImage {
    if (!imageUrl) return null;

    const container = imageUrl.split('/')[0];
    const name = imageUrl.split('/')[1];

    return {
      md: this.getImageUrl(`${container}/md/${name}`),
      sm: this.getImageUrl(`${container}/sm/${name}`),
      original: this.getImageUrl(`${container}/${name}`),
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
