import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;
  private publicUrlBase: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.publicUrlBase = process.env.S3_PUBLIC_URL_BASE!;

    this.client = new S3Client({
      region: process.env.S3_REGION ?? 'ru-central1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(key: string, body: Buffer, mime: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mime,
      }),
    );

    return `${this.publicUrlBase}/${key}`;
  }
}
