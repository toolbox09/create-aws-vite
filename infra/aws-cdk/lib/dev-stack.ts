import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";
import { Vpc } from "./shared/vpc-stack";
import { Database } from "./shared/database-stack";
import { Storage } from "./shared/storage-stack";
import { AppRunner } from "./shared/apprunner-stack";
import { Web } from "./shared/web-stack";

export interface DevStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly repository: ecr.Repository;
}

export class DevStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DevStackProps) {
    super(scope, id, props);

    const projectName = props.projectName;
    const environment = "dev";

    const vpc = new Vpc(this, "Vpc", {
      projectName,
      environment,
    });

    const database = new Database(this, "Database", {
      projectName,
      environment,
      vpc: vpc.vpc,
    });

    const storage = new Storage(this, "Storage", {
      projectName,
      environment,
    });

    const appRunner = new AppRunner(this, "AppRunner", {
      projectName,
      environment,
      vpc: vpc.vpc,
      repository: props.repository,
      databaseInstance: database.instance,
      databaseSecurityGroup: database.securityGroup,
      storageBucket: storage.bucket,
      cpu: "0.25 vCPU",
      memory: "0.5 GB",
      minSize: 1,
      maxSize: 3,
    });

    new Web(this, "Web", {
      projectName,
      environment,
      apiServiceUrl: appRunner.serviceUrl,
    });
  }
}
