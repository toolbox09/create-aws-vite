const { execSync } = require("child_process");

const PROJECT_NAME = "test-repo";
const REGION = "ap-northeast-1";
const TAG = process.argv[2] || "latest";

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: "utf8", stdio: "inherit" });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// Get ECR repository URI
const REPO = runCapture(
  `aws ecr describe-repositories --repository-names ${PROJECT_NAME} --query "repositories[0].repositoryUri" --output text --region ${REGION}`
);

// Login to ECR
const password = runCapture(`aws ecr get-login-password --region ${REGION}`);
execSync(`docker login --username AWS --password-stdin ${REPO}`, {
  input: password,
  stdio: ["pipe", "inherit", "inherit"],
});

// Tag and push
run(`docker tag ${PROJECT_NAME}:latest ${REPO}:${TAG}`);
run(`docker push ${REPO}:${TAG}`);
console.log(`Pushed ${REPO}:${TAG}`);

// Prod: trigger App Runner deployment
if (TAG === "prod") {
  const SERVICE_ARN = runCapture(
    `aws apprunner list-services --query "ServiceSummaryList[?ServiceName==\`${PROJECT_NAME}-prod\`].ServiceArn" --output text --region ${REGION}`
  );
  run(
    `aws apprunner start-deployment --service-arn ${SERVICE_ARN} --region ${REGION}`
  );
  console.log("Prod deployment triggered.");
}
