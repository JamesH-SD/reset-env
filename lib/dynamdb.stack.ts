import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Env } from "./types";

export type ResetEnvLogsStackOpts = {
  env: Env;
};

export class ResetEnvLogsStack extends cdk.Stack {
  readonly tableName: string;
  readonly logsTableArn: string;
  constructor(
    scope: Construct,
    id: string,
    opts: ResetEnvLogsStackOpts,
    props?: cdk.StageProps
  ) {
    super(scope, id, props);

    this.tableName = `reset-env.logs.${opts.env}`;
    const resetEnvLogs = new dynamodb.TableV2(this, "Reset-Env-Logs", {
      tableName: this.tableName,
      partitionKey: {
        name: "StartedDateTime",
        type: dynamodb.AttributeType.STRING,
      },
      encryption: dynamodb.TableEncryptionV2.dynamoOwnedKey(),
      tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    this.logsTableArn = 'logsTableArn'
        new cdk.CfnOutput(this, this.logsTableArn, {
            value: resetEnvLogs.tableArn,
            exportName: this.logsTableArn,
        })
    
    cdk.Tags.of(resetEnvLogs).add("env", opts.env);
  }
}
