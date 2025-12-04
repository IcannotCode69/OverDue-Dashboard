#!/usr/bin/env node
/* eslint-disable no-console */

const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  if (!bucket) {
    console.error(
      "ERROR: AWS_S3_BUCKET_NAME is not set. Set it before running `npm run deploy`."
    );
    console.error(
      '   Example (PowerShell):  $env:AWS_S3_BUCKET_NAME = "overdue-dashboard-aki"'
    );
    process.exit(1);
  }

  try {
    console.log("Building OverDue Dashboard...");
    run("npm run build");

    console.log(`\nDeploying to s3://${bucket} ...`);
    run(`aws s3 sync build/ s3://${bucket} --delete`);

    console.log("\nDeploy complete.");
    console.log("   Use the bucket's static website endpoint to view the app.");
  } catch (err) {
    console.error("\nDeploy failed.");
    if (err && err.message) {
      console.error(err.message);
    }
    process.exit(1);
  }
}

main();
