import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class StorageService {
  private readonly bucket: string;
  private readonly s3: S3Client;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>("S3_BUCKET");

    this.s3 = new S3Client({
      endpoint: config.get<string>("AWS_ENDPOINT_URL_S3"),
      region: config.get<string>("AWS_REGION") ?? "us-east-1",
      credentials: {
        accessKeyId: config.getOrThrow<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: config.getOrThrow<string>("AWS_SECRET_ACCESS_KEY"),
      },
      forcePathStyle: true, // Neon (and MinIO) use path-style addressing
    });
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async get(key: string): Promise<{ body: Buffer; contentType: string }> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error(`Failed to read object "${key}"`);
    }

    return {
      body: Buffer.from(bytes),
      contentType: response.ContentType ?? "application/octet-stream",
    };
  }
}
