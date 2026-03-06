import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apprunner from "aws-cdk-lib/aws-apprunner";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface AppRunnerProps {
  readonly projectName: string;
  readonly environment: string;
  readonly vpc: ec2.IVpc;
  readonly repository: ecr.Repository;
  readonly databaseInstance: rds.DatabaseInstance;
  readonly databaseSecurityGroup: ec2.SecurityGroup;
  readonly storageBucket: s3.Bucket;
  readonly cpu?: string;
  readonly memory?: string;
  readonly minSize?: number;
  readonly maxSize?: number;
}

export class AppRunner extends Construct {
  public readonly serviceUrl: string;

  constructor(scope: Construct, id: string, props: AppRunnerProps) {
    super(scope, id);

    const isProd = props.environment === "prod";

    // IAM role for App Runner instances
    const instanceRole = new iam.Role(this, "AppRunnerInstanceRole", {
      roleName: `${props.projectName}-${props.environment}-apprunner-instance`,
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });

    // Grant S3 access
    props.storageBucket.grantReadWrite(instanceRole);

    // Grant Secrets Manager access for DB credentials
    if (props.databaseInstance.secret) {
      props.databaseInstance.secret.grantRead(instanceRole);
    }

    // IAM role for App Runner ECR access
    const accessRole = new iam.Role(this, "AppRunnerAccessRole", {
      roleName: `${props.projectName}-${props.environment}-apprunner-access`,
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });

    accessRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSAppRunnerServicePolicyForECRAccess"
      )
    );
    props.repository.grantPull(accessRole);

    // VPC Connector for RDS access
    const vpcConnectorSg = new ec2.SecurityGroup(this, "VpcConnectorSg", {
      vpc: props.vpc,
      securityGroupName: `${props.projectName}-${props.environment}-vpc-connector-sg`,
      description: "Security group for App Runner VPC connector",
    });

    // Allow VPC connector to access RDS
    props.databaseSecurityGroup.addIngressRule(
      vpcConnectorSg,
      ec2.Port.tcp(5432),
      "Allow App Runner VPC connector to access RDS"
    );

    const vpcConnector = new apprunner.CfnVpcConnector(
      this,
      "VpcConnector",
      {
        vpcConnectorName: `${props.projectName}-${props.environment}-connector`,
        subnets: props.vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }).subnetIds,
        securityGroups: [vpcConnectorSg.securityGroupId],
      }
    );

    // App Runner Service
    const service = new apprunner.CfnService(this, "AppRunnerService", {
      serviceName: `${props.projectName}-${props.environment}`,
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        imageRepository: {
          imageRepositoryType: "ECR",
          imageIdentifier: `${props.repository.repositoryUri}:${isProd ? "prod" : "latest"}`,
          imageConfiguration: {
            port: "3000",
            runtimeEnvironmentVariables: [
              {
                name: "RUST_LOG",
                value: props.environment === "prod" ? "info" : "debug",
              },
              {
                name: "SERVER_HOST",
                value: "0.0.0.0",
              },
              {
                name: "SERVER_PORT",
                value: "3000",
              },
              {
                name: "DATABASE_HOST",
                value: props.databaseInstance.dbInstanceEndpointAddress,
              },
              {
                name: "DATABASE_PORT",
                value: props.databaseInstance.dbInstanceEndpointPort,
              },
              {
                name: "DATABASE_NAME",
                value: props.projectName.replace(/-/g, "_"),
              },
              {
                name: "DATABASE_SECRET_ARN",
                value: props.databaseInstance.secret?.secretArn ?? "",
              },
              {
                name: "S3_BUCKET",
                value: props.storageBucket.bucketName,
              },
              {
                name: "S3_REGION",
                value: "ap-northeast-1",
              },
            ],
          },
        },
        autoDeploymentsEnabled: !isProd,
      },
      instanceConfiguration: {
        cpu: props.cpu ?? (isProd ? "1 vCPU" : "0.25 vCPU"),
        memory: props.memory ?? (isProd ? "2 GB" : "0.5 GB"),
        instanceRoleArn: instanceRole.roleArn,
      },
      autoScalingConfigurationArn: new apprunner.CfnAutoScalingConfiguration(
        this,
        "AutoScalingConfig",
        {
          autoScalingConfigurationName: `${props.projectName}-${props.environment}-scaling`,
          minSize: props.minSize ?? (isProd ? 2 : 1),
          maxSize: props.maxSize ?? (isProd ? 10 : 3),
          maxConcurrency: isProd ? 100 : 50,
        }
      ).attrAutoScalingConfigurationArn,
      networkConfiguration: {
        egressConfiguration: {
          egressType: "VPC",
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
      healthCheckConfiguration: {
        protocol: "HTTP",
        path: "/api/health",
        interval: isProd ? 10 : 20,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: isProd ? 3 : 5,
      },
    });

    this.serviceUrl = service.attrServiceUrl;

    new cdk.CfnOutput(scope, "AppRunnerServiceUrl", {
      value: `https://${service.attrServiceUrl}`,
      description: "App Runner service URL",
    });

    new cdk.CfnOutput(scope, "AppRunnerServiceArn", {
      value: service.attrServiceArn,
      description: "App Runner service ARN",
    });
  }
}
