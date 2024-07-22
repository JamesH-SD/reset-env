import * as cdk from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { Env } from "./types";

export type ParameterStackOpts = {
  env: Env;
  bucketName: string;
  tableName: string;
};
export class ParameterStack extends cdk.Stack {
  readonly bucketName: string;
  readonly logsTableName: string;
  readonly awsKeyName: string;
  readonly dbConnDetails: string;
  readonly spOnboardTable: string;
  readonly surveysTable: string;
  readonly cognitoDetails: string;
  constructor(
    scope: Construct,
    id: string,
    opts: ParameterStackOpts,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.bucketName = `/reset_env/${opts.env}/sql-bucketName`;

    const bucketName = new ssm.StringParameter(this, "SQLBucketNameParameter", {
      allowedPattern: ".*",
      description: "reset_test",
      parameterName: this.bucketName,
      stringValue: opts.bucketName,
      tier: ssm.ParameterTier.STANDARD,
    });

    bucketName.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(bucketName).add("env", opts.env);


    this.logsTableName = `/reset_env/${opts.env}/dynamodb-tableName`;

    const logsTableName = new ssm.StringParameter(this, "ResetEnvLogsParameter", {
      allowedPattern: ".*",
      description: "reset env dynamodb table",
      parameterName: this.logsTableName,
      stringValue: opts.tableName,
      tier: ssm.ParameterTier.STANDARD,
    });

    logsTableName.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(logsTableName).add("env", opts.env);

    this.awsKeyName = `/reset_env/${opts.env}/aws-key-name`
    const awsKeyName = new ssm.StringListParameter(this, "AWSKeyMultitenantParameter", {
      allowedPattern: ".*",
      description: "AWS Multitenant Keys ",
      parameterName: this.awsKeyName,
      stringListValue: ['AWS_KEY', 'AWS_SECRET'],
      tier: ssm.ParameterTier.STANDARD,
    });

    awsKeyName.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(awsKeyName).add("env", opts.env)

    this.dbConnDetails = `/reset_env/${opts.env}/db-conn-details`
    const dbConnDetails = new ssm.StringListParameter(this, "DBConnectionParameter", {
      allowedPattern: ".*",
      description: "DB Connection Details for RDS  ",
      parameterName: this.dbConnDetails,
      stringListValue: ['DB_HOST', 'DB_PORT', 'DB_CLUSTER', 'DB_ENGINE'],
      tier: ssm.ParameterTier.STANDARD,
    });

    dbConnDetails.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(dbConnDetails).add("env", opts.env)

    this.spOnboardTable = `/reset_env/${opts.env}/sp-onboard-table`
    const spOnboardTable = new ssm.StringParameter(this, "SPOnboardTableParameter", {
      allowedPattern: ".*",
      description: `Service Provider Onboard Table for ${opts.env.toLocaleUpperCase}`,
      parameterName: this.spOnboardTable,
      stringValue: 'mypokket-sp-onboarding-train',
      tier: ssm.ParameterTier.STANDARD,
    });

    spOnboardTable.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(spOnboardTable).add("env", opts.env)

    this.surveysTable = `/reset_env/${opts.env}/surveys-table`
    const surveysTable = new ssm.StringParameter(this, "SurveysTableParameter", {
      allowedPattern: ".*",
      description: `Survey Response Table for ${opts.env.toLocaleUpperCase}`,
      parameterName: this.surveysTable,
      stringValue: 'mypokket-survey-response-train',
      tier: ssm.ParameterTier.STANDARD,
    });

    surveysTable.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(surveysTable).add("env", opts.env)

    this.cognitoDetails = `/reset_env/${opts.env}/cognito-details`
    const cognitoDetails = new ssm.StringListParameter(this, "CognitoDetailsParameter", {
      allowedPattern: ".*",
      description: `Cognito Details for ${opts.env.toLocaleUpperCase}`,
      parameterName: this.cognitoDetails,
      stringListValue: ['COGNITO_ID', 'COGNITO_URL'],
      tier: ssm.ParameterTier.STANDARD,
    });

    cognitoDetails.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    cdk.Tags.of(cognitoDetails).add("env", opts.env)
  }
}
