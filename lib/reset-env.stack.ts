import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import path = require("path");
import { Env } from "./types";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { AccountRootPrincipal, AnyPrincipal, Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export type ResetEnvStackOpts = {
  sqlBucketName: string;
  logsTableName: string;
  awsKeyName: string;
  dbConnDetails: string;
  spOnboardTable: string;
  surveysTable: string;
  cognitoDetails: string;
  env: Env;
};
export class ResetEnvStack extends cdk.Stack {
  readonly resetLambda: any;
  constructor(
    scope: Construct,
    id: string,
    opts: ResetEnvStackOpts,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);


    // const resetLambdaRole = new Role(this, 'ResetLambdaRole', {
    //   assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    //   description: 'reset lambda policies for executuion'
    // });

    // resetLambdaRole.addToPolicy(new PolicyStatement({
    //   sid: 'ResetLambdaPolicyS3',
    //   effect: Effect.ALLOW,
    //   actions: ['s3:GetObject', 's3:ListBucket', 's3:PutObject',],
    //   principals: [new ServicePrincipal('s3.amazonaws.com')],
    //   resources: ['*'],
    //   // conditions
    // }))

    // resetLambdaRole.addToPolicy(new PolicyStatement({
    //   sid: 'ResetLambdaPolicyCognito',
    //   effect: Effect.ALLOW,
    //   actions: [
    //     "cognito-identity:UpdateUserAttributes",
    //     "cognito-identity:DeleteUser",
    //     "cognito-identity:ListUsers",
    //   ],
    //   principals: [new ServicePrincipal('cognito-identiy.amazonaws.com')],
    //   resources: ['*']
    // }))

    // resetLambdaRole.addToPolicy(new PolicyStatement({
    //   sid: 'ResetLambdaPolicyDynamodb',
    //   effect: Effect.ALLOW,
    //   actions: ["dynamodb:BatchGetItem",
    //     "dynamodb:BatchWriteItem",
    //     "dynamodb:ConditionCheckItem",
    //     "dynamodb:PutItem",
    //     "dynamodb:DescribeTable",
    //     "dynamodb:DeleteItem",
    //     "dynamodb:GetItem",
    //     "dynamodb:Scan",
    //     "dynamodb:Query",
    //     "dynamodb:UpdateItem"],
    //   principals: [new ServicePrincipal('dynamodb.amazonaws.com')],
    //   resources: ['*']
    // }))


    this.resetLambda = new Function(this, "ResetLambdaFunction", {
      functionName: `reset_env-${opts.env}`,
      runtime: Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: Code.fromAsset(path.join(path.resolve("lambda/reset-env"))),
      // role: resetLambdaRole,
      environment: {
        AWS_KEY: opts.awsKeyName, // coming from a parameter store hardcore them AWSMULTITENANTKEY encrypt with KMS
        SQL_BUCKET_NAME: opts.sqlBucketName,
        LOGS_TABLE_NAME: opts.logsTableName,
        MYPOKKET_DB_CRED: '',// Secret Name // do not logg password
        MYPOKKET_DB_CONN: opts.dbConnDetails, // {db information}, // coming from a parameter store // arn of the secret manager password
        MYPOKKET_SP_ONBOARD: opts.spOnboardTable, // table name add cut-off date parameter
        MYPOKKET_SURVEYS: opts.surveysTable, // coming from a parameter store hardcore them  
        MYPOKKET_COGNITO_POOL: opts.cognitoDetails //  {cognitoId: '', cognitoUrl: ''}, // coming from a parameter store hardcore them
        // db creds mypokketdbcred
      },
    });


    // new cdk.aws_iam.
    // Do not log key or db pass 
    // log everything else

    // new AwsCustomResource(this, "UpdateLambdaFunction", {
    //   onUpdate: {
    //     service: "Lambda",
    //     action: "updateFunctionConfiguration",
    //     parameters: {
    //       FunctionName: this.resetLambda.functionArn,
    //       Environment: {
    //         Variables: "*",
    //       },
    //     },
    //     physicalResourceId: PhysicalResourceId.of("ResetLambdaFunction"),
    //   },
    //   policy: AwsCustomResourcePolicy.fromSdkCalls({
    //     resources: [this.resetLambda.functionArn],
    //   }),
    // });
  }
}
