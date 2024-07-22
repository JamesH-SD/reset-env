import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { MypokketResetTrainStack } from "./mypokket-reset-train-stack";
import { ParameterStack } from "./parameters.stack";
// import { SecretsStack } from "./secrets.stack";
import { SqlBucketStack } from "./sqlbucket.stack";
import { ResetEnvLogsStack } from "./dynamdb.stack";
import { TempAcivilateStack } from "./cognito.stack";
import { Env } from "./types";
import { string } from "yargs";

export type ArtifactStageOpts = {
  env: Env;
};
export class ArtifactStage extends cdk.Stage {
  readonly bucketNameParameter: string;
  readonly logsTableNameParameter: string;
  readonly awsKeyNameParameter: string;
  readonly dbConnDetailsParameter: string;
  readonly spOnboardTableParameter: string;
  readonly surveysTableParameter: string;
  readonly cognitoDetailsParameter: string;
  constructor(
    scope: Construct,
    id: string,
    opts: ArtifactStageOpts,
    props?: cdk.StageProps
  ) {
    super(scope, id, props);

    // Sql Bucket for scripts
    const s3SqlBucket = new SqlBucketStack(this, "SqlBucketStack", {
      env: opts.env,
    });

    // ResetEnv DynamoDB Table stack
    const resetEnvLogs = new ResetEnvLogsStack(this, "ResetEnvLogsStack", {
      env: opts.env,
    });

    // Paramete Store stacK
    const artifactsNameParameterStore = new ParameterStack(
      this,
      "ParameterStack",
      {
        env: opts.env,
        bucketName: s3SqlBucket.bucketName,
        tableName: resetEnvLogs.tableName,
      }
    );


    this.awsKeyNameParameter = artifactsNameParameterStore.awsKeyName;
    this.bucketNameParameter = artifactsNameParameterStore.bucketName;
    this.logsTableNameParameter = artifactsNameParameterStore.logsTableName;
    this.dbConnDetailsParameter = artifactsNameParameterStore.dbConnDetails;
    this.spOnboardTableParameter = artifactsNameParameterStore.spOnboardTable;
    this.surveysTableParameter = artifactsNameParameterStore.spOnboardTable;
    this.cognitoDetailsParameter = artifactsNameParameterStore.cognitoDetails;
    // New Secrets Manager Stack
    // new SecretsStack(this, "SecretsStack");

    //Cognito Pool for Legacy Noc
    new TempAcivilateStack(this, "TempAcivilateStack");
  }
}
