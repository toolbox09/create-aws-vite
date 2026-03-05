const { execSync } = require("child_process");
const path = require("path");

const PROJECT_NAME = "test-repo";
const REGION = "ap-northeast-1";
const ENV = process.argv[2] || "dev";
const STACK_NAME = `${PROJECT_NAME}-${ENV}`;

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: "utf8", stdio: "inherit", ...opts });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// Build web
const webDir = path.resolve(__dirname, "../../../web");
run("pnpm build", { cwd: webDir });

// Get bucket name
const BUCKET = runCapture(
  `aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?contains(OutputKey,'WebBucketName')].OutputValue" --output text --region ${REGION}`
);

// Get CloudFront distribution ID
const DIST_ID = runCapture(
  `aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?contains(OutputKey,'DistributionId')].OutputValue" --output text --region ${REGION}`
);

// Sync to S3
const distDir = path.resolve(webDir, "dist");
run(`aws s3 sync "${distDir}" s3://${BUCKET} --delete`);

// Invalidate CloudFront cache
run(
  `aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths "/*"`
);

console.log(`Web deployed to ${STACK_NAME} (bucket: ${BUCKET})`);
