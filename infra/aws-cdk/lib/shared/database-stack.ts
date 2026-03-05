import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

export interface DatabaseProps {
  readonly projectName: string;
  readonly environment: string;
  readonly vpc: ec2.IVpc;
  readonly protectData?: boolean;
}

export class Database extends Construct {
  public readonly instance: rds.DatabaseInstance;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    const isProd = props.environment === "prod";
    const protectData = props.protectData ?? isProd;

    this.securityGroup = new ec2.SecurityGroup(this, "DatabaseSg", {
      vpc: props.vpc,
      securityGroupName: `${props.projectName}-${props.environment}-db-sg`,
      description: "Security group for RDS PostgreSQL",
      allowAllOutbound: false,
    });

    const instanceType = isProd
      ? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM)
      : ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO);

    this.instance = new rds.DatabaseInstance(this, "PostgresInstance", {
      instanceIdentifier: `${props.projectName}-${props.environment}-db`,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [this.securityGroup],
      databaseName: props.projectName.replace(/-/g, "_"),
      credentials: rds.Credentials.fromGeneratedSecret("postgres", {
        secretName: `${props.projectName}-${props.environment}-db-credentials`,
      }),
      multiAz: isProd,
      allocatedStorage: isProd ? 100 : 20,
      maxAllocatedStorage: isProd ? 500 : 50,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(isProd ? 30 : 7),
      deletionProtection: protectData,
      removalPolicy: protectData
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      monitoringInterval: isProd ? cdk.Duration.seconds(60) : undefined,
    });

    new cdk.CfnOutput(scope, "DatabaseEndpoint", {
      value: this.instance.dbInstanceEndpointAddress,
      description: "Database endpoint address",
    });

    new cdk.CfnOutput(scope, "DatabaseSecretArn", {
      value: this.instance.secret?.secretArn ?? "N/A",
      description: "Database credentials secret ARN",
    });
  }
}
