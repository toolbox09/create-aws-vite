import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface VpcProps {
  readonly projectName: string;
  readonly environment: string;
}

export class Vpc extends Construct {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: `${props.projectName}-${props.environment}-vpc`,
      maxAzs: 2,
      natGateways: props.environment === "prod" ? 2 : 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    new cdk.CfnOutput(scope, "VpcId", {
      value: this.vpc.vpcId,
      description: "VPC ID",
    });
  }
}
