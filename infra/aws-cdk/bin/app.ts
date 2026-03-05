#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { EcrStack } from "../lib/shared/ecr-stack";
import { DevStack } from "../lib/dev-stack";
import { ProdStack } from "../lib/prod-stack";

const app = new cdk.App();

const projectName = "test-repo";

const env: cdk.Environment = {
  region: "ap-northeast-1",
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const ecrStack = new EcrStack(app, `${projectName}-ecr`, {
  env,
  projectName,
  description: `${projectName} ECR repository (shared)`,
});

const devStack = new DevStack(app, `${projectName}-dev`, {
  env,
  projectName,
  repository: ecrStack.repository,
  description: `${projectName} development environment`,
});
devStack.addDependency(ecrStack);

const prodStack = new ProdStack(app, `${projectName}-prod`, {
  env,
  projectName,
  repository: ecrStack.repository,
  description: `${projectName} production environment`,
});
prodStack.addDependency(ecrStack);

app.synth();
