#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ResetEnvPipelineStack } from "../lib/pipeline-stack";
// import { MypokketResetTrainStack } from "../lib/mypokket-reset-train-stack";

const jamesSandbox = { account: '986437037830', region: 'us-east-1' };

const app = new cdk.App();
new ResetEnvPipelineStack(app, "JamesResetEnvPipelineStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  env: jamesSandbox,
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});



// new MypokketResetTrainStack(app, "MypokketResetTrainStack", {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */
//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },
//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
