import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface StorageProps {
  readonly projectName: string;
  readonly environment: string;
  readonly protectData?: boolean;
}

export class Storage extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageProps) {
    super(scope, id);

    const isProd = props.environment === "prod";
    const protectData = props.protectData ?? isProd;

    this.bucket = new s3.Bucket(this, "StorageBucket", {
      bucketName: `${props.projectName}-${props.environment}-storage`,
      versioned: protectData,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: protectData
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !protectData,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3600,
        },
      ],
      lifecycleRules: isProd
        ? [
            {
              id: "transition-to-ia",
              transitions: [
                {
                  storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                  transitionAfter: cdk.Duration.days(90),
                },
                {
                  storageClass: s3.StorageClass.GLACIER,
                  transitionAfter: cdk.Duration.days(365),
                },
              ],
            },
            {
              id: "abort-incomplete-uploads",
              abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
            },
          ]
        : [
            {
              id: "abort-incomplete-uploads",
              abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
            },
          ],
    });

    new cdk.CfnOutput(scope, "StorageBucketName", {
      value: this.bucket.bucketName,
      description: "S3 bucket name",
    });
  }
}
