import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ResetEnvStack } from "./reset-env.stack";
import { Env } from "./types";

export type ResetEnvStageOpts = {
  awsKeyName: string;
  sqlBucketName: string;
  logsTableName: string;
  dbConnDetails: string;
  spOnboardTable: string;
  surveysTable: string;
  cognitoDetails: string;
  env: Env;
};

export class ResetEnvStage extends cdk.Stage {
  readonly resetLambda: any;
  constructor(
    scope: Construct,
    id: string,
    opts: ResetEnvStageOpts,
    props?: cdk.StageProps
  ) {
    super(scope, id, props);

    const resetEnvStack = new ResetEnvStack(this, "ResetEnvStack", {
      awsKeyName: opts.awsKeyName,
      sqlBucketName: opts.sqlBucketName,
      logsTableName: opts.logsTableName,
      dbConnDetails: opts.dbConnDetails,
      spOnboardTable: opts.spOnboardTable,
      surveysTable: opts.surveysTable,
      cognitoDetails: opts.cognitoDetails,
      env: opts.env,
    });

    this.resetLambda = resetEnvStack.resetLambda;
  }
}
