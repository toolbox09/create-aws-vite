import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export interface WebProps {
  readonly projectName: string;
  readonly environment: string;
  readonly apiServiceUrl: string;
  readonly protectData?: boolean;
}

export class Web extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id);

    const isProd = props.environment === "prod";
    const protectData = props.protectData ?? isProd;

    // S3 bucket for static web assets
    this.bucket = new s3.Bucket(this, "WebBucket", {
      bucketName: `${props.projectName}-${props.environment}-web`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: protectData
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !protectData,
    });

    // CloudFront OAI for S3 access
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OAI",
      {
        comment: `${props.projectName}-${props.environment} web OAI`,
      },
    );
    this.bucket.grantRead(originAccessIdentity);

    // App Runner origin for /api/*
    const apiOrigin = new origins.HttpOrigin(props.apiServiceUrl, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    });

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: `${props.projectName}-${props.environment}`,
      defaultRootObject: "index.html",

      // Default: S3 (static files)
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(this.bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },

      // /api/* → App Runner
      additionalBehaviors: {
        "/api/*": {
          origin: apiOrigin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },

      // SPA: 404 → index.html
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],

      priceClass: isProd
        ? cloudfront.PriceClass.PRICE_CLASS_200
        : cloudfront.PriceClass.PRICE_CLASS_100,
    });

    new cdk.CfnOutput(scope, "DistributionUrl", {
      value: `https://${this.distribution.distributionDomainName}`,
      description: "CloudFront distribution URL",
    });

    new cdk.CfnOutput(scope, "DistributionId", {
      value: this.distribution.distributionId,
      description: "CloudFront distribution ID",
    });

    new cdk.CfnOutput(scope, "WebBucketName", {
      value: this.bucket.bucketName,
      description: "Web S3 bucket name",
    });
  }
}
