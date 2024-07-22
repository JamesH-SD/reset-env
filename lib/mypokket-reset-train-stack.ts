import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as kms from "aws-cdk-lib/aws-kms";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as r53 from "aws-cdk-lib/aws-route53";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import path = require("node:path");
import assert = require("node:assert");
import { NetworkLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

const Duration = cdk.Duration;
const RemovalPolicy = cdk.RemovalPolicy;
const CfnOutput = cdk.CfnOutput;
export class MypokketResetTrainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // VPC for application
    // const vpc = new ec2.Vpc(this, "VPC", {
    //   natGateways: 1,
    //   vpcName: "Mypokket-Train-Reset",
    //   maxAzs: 1,
    // });

    // // domain for train webiste
    // const resetDomain = new r53.VpcEndpointServiceDomainName(
    //   this,
    //   "Reset-Train-Domain",
    //   {
    //     endpointService: new ec2.VpcEndpointService(this, "Vpc-servicer", {
    //       acceptanceRequired: true,
    //       vpcEndpointServiceLoadBalancers: [
    //         new NetworkLoadBalancer(this, "network-load-balancer", {
    //           vpc: vpc,
    //           deletionProtection: false,
    //         }),
    //       ],
    //     }),
    //     domainName: "reset-train.acivilate.com",
    //     publicHostedZone: new r53.PublicHostedZone(this, "Domain-Hosted-Zone", {
    //       zoneName: "reset-train.acivilate.com",
    //     }),
    //   }
    // );

    // // Lambda Cloudwatch Logs
    // const resetTrainLambdaCloudwatch = new iam.Role(this, "Lambda-logs", {
    //   assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    //   description: "To log actions of the reset train lambda",
    //   inlinePolicies: {
    //     loggingRole: new iam.PolicyDocument({
    //       statements: [
    //         new iam.PolicyStatement({
    //           actions: [
    //             "logs:CreateLogGroup",
    //             "logs:CreateLogStream",
    //             "logs:DescribeLogStreams",
    //             "logs:PutLogEvents",
    //           ],
    //           resources: [
    //             `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/*`,
    //           ],
    //           effect: iam.Effect.ALLOW,
    //         }),
    //       ],
    //     }),
    //   },
    // });

    // resetTrainLambdaCloudwatch.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // // Security Group for application
    // const securityGroup = new ec2.SecurityGroup(this, "Train-Reset-Security", {
    //   vpc,
    //   allowAllOutbound: true,
    //   securityGroupName: "Reset-Train-Group",
    //   description: "Security group for Lambda and Frontend to make changes",
    // });

    // securityGroup.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const reset_env_Role = new iam.Role(this, "reset_env-site-role", {
      assumedBy: new iam.ServicePrincipal("s3.amazonaws.com"),
      roleName: "reset_env-site-bucket",
    });

    const reset_env_Site = new s3.Bucket(this, "reset_env-site", {
      websiteIndexDocument: "index.html",
      bucketName: "reset_env_site",
      encryption: s3.BucketEncryption.S3_MANAGED,
      // publicReadAccess: true,
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,

      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    reset_env_Role.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:*"],
        resources: [reset_env_Site.bucketArn, `${reset_env_Site.bucketArn}/*`],
      })
    );

    const sqlBucket = new s3.Bucket(this, "sql-bucket", {
      bucketName: "reset_env-sql-scripts",
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    reset_env_Site.grantPublicAccess("reset_env-Access", "s3:GetObject");

    // cloudformation for site
    const reset_env_Distro = new cloudfront.CloudFrontWebDistribution(
      this,
      "reset_env-cloudfront",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: reset_env_Site,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
        enabled: true,
        comment: "Cloudfront Distrobution reset-train website",
      }
    );

    reset_env_Distro.grantCreateInvalidation(reset_env_Role);

    // //used to deploy Frontend
    const deployUi = new s3deploy.BucketDeployment(
      this,
      "Deploy-reset-train-site",
      {
        sources: [s3deploy.Source.asset(path.join("frontend"))],
        destinationBucket: reset_env_Site,
        distribution: reset_env_Distro,
        distributionPaths: ["/*"],
      }
    );

    // s3 policy for website
    /**
     * s3 bucket policy
     */
    // const resetTrainPolicy = resetTrain.addToResourcePolicy(
    //   new iam.PolicyStatement({
    //     actions: ['s3:GetObject'],
    //     resources : [resetTrain.arnForObjects("*")],
    //   })
    // )

    // sqlBucket.addToResourcePolicy(
    //   new iam.PolicyStatement({
    //     actions: ['s3:GetObject'],
    //     resources : [sqlBucket.arnForObjects("*")],
    //   })
    // )

    // const cognitoSenderKmsKey = new kms.Key(
    //   this,
    //   "cognito-sender-sms-kms-key",
    //   {
    //     removalPolicy: RemovalPolicy.DESTROY,
    //     pendingWindow: Duration.days(7),
    //     alias: "alias/customKmsSenderCognito",
    //     description: "Used to decrypt the Cognito code",
    //     enabled: true,
    //     enableKeyRotation: false,
    //   }
    // );

    // cognitoSenderKmsKey.addToResourcePolicy(
    //   new iam.PolicyStatement({
    //     effect: iam.Effect.ALLOW,
    //     principals: [new iam.ServicePrincipal("cognito-idp.amazonaws.com")],
    //     actions: ["kms:CreateGrant", "kms:Encrypt"],
    //     resources: ["*"],
    //   })
    // );

    // const cognitoSMSSenderLambdaPermissions = {
    //   Version: "2012-10-17",
    //   Statement: [
    //     {
    //       sid: "cognito-sms-sender-permission",
    //       Effect: "Allow",
    //       Action: ["sns:publish"],
    //       Resource: "*",
    //     },
    //     {
    //       sid: "cognito-sms-sender-permission",
    //       Effect: "Allow",
    //       Action: ["kms:Decrypt"],
    //       Resource: "*",
    //     },
    //   ],
    // };

    // const sender_lambda_role = new iam.Role(this, "Lambda-Execution-Role", {
    //   assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    //   description: "Role for lambda to execute actions",
    //   roleName: "lambda-execution-role",
    //   managedPolicies: [
    //     iam.ManagedPolicy.fromAwsManagedPolicyName(
    //       "service-role/AWSLambdaBasicExecutionRole"
    //     ),
    //   ],
    // });

    // const senderLambdaPolicy = new iam.Policy(this, "Sender-Lambda-Policy", {
    //   document: iam.PolicyDocument.fromJson(cognitoSMSSenderLambdaPermissions),
    // });

    // sender_lambda_role.attachInlinePolicy(senderLambdaPolicy);

    // const cognitoSMSsender = new lambda.LayerVersion(
    //   this,
    //   "cognito-customSMS-sender-node",
    //   {
    //     removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    //     code: lambda.Code.fromAsset(path.join("lambda")),
    //     compatibleArchitectures: [
    //       lambda.Architecture.X86_64,
    //       lambda.Architecture.ARM_64,
    //     ],
    //     compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    //   }
    // );

    // const cognitoSmsLambda = new lambda.Function(this, "cognito-sms-lambda", {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   code: lambda.Code.fromAsset(path.join("lambda/custom-sender")),
    //   handler: "custom-sender.handler",
    //   description: "Lambda handler for sending the temporary passwords",
    //   functionName: "cognito-sms-lambda-train-reset",
    //   role: sender_lambda_role,
    //   environment: {
    //     KEY_ALIAS: "customKmsSenderCognito",
    //     KEY_ARN: cognitoSenderKmsKey.keyArn,
    //   },
    // });

    const userPool = new cognito.UserPool(this, "temp_acivialte-users", {
      userPoolName: "temp_acivialte-users",
      autoVerify: {
        email: true,
        phone: false,
      },
      signInAliases: {
        username: true,
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      mfa: cognito.Mfa.OFF,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(7),
      },
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      removalPolicy: RemovalPolicy.DESTROY,
      // customSenderKmsKey: cognitoSenderKmsKey,
    });

    // userPool.addTrigger(
    //   cognito.UserPoolOperation.CUSTOM_SMS_SENDER,
    //   cognitoSmsLambda
    // );

    const cognito_pool_client = userPool.addClient(
      "temp_acivialte-temporary-app",
      {
        userPoolClientName: "temp_acivialte-users-app",
      }
    );

    cognito_pool_client.applyRemovalPolicy(RemovalPolicy.DESTROY);

    //DynamoDB table for logging
    // const resetTrainLogs = new dynamodb.TableV2(this, "Reset-Train-Logs", {
    //   tableName: "mypokket-reset-train-logs",
    //   partitionKey: {
    //     name: "StartedDateTime",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   encryption: dynamodb.TableEncryptionV2.dynamoOwnedKey(),
    //   tableClass: dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS,
    //   removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    // });

    // const reset_lambda_role = new iam.Role(
    //   this,
    //   "Reset-Lambda-Execution-Role",
    //   {
    //     assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    //     description: "Role for lambda to execute actions",
    //     roleName: "reset-lambda-execution-role",
    //     managedPolicies: [
    //       iam.ManagedPolicy.fromAwsManagedPolicyName(
    //         "service-role/AWSLambdaBasicExecutionRole"
    //       ),
    //     ],
    //   }
    // );

    // resetTrainLogs.grantReadWriteData(reset_lambda_role);
    // sqlBucket.grantRead(reset_lambda_role);

    // const resetTrainLambda = new lambda.Function(this, "Reset-train-lambda", {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   code: lambda.Code.fromAsset(path.join("lambda/reset-train")),
    //   handler: "reset-train.handler",
    //   functionName: "reset-train-lambda",
    //   description: "Reset Train Lambda",
    //   role: reset_lambda_role,
    // });

    // // CfnOuputs for Infrastructure
    new CfnOutput(this, "temp_acivialte-cognito-app-client-id", {
      value: cognito_pool_client.userPoolClientId,
    });
    // new CfnOutput(this, "Reset-DynamoDB", {
    //   value: resetTrainLogs.tableName,
    // });
    // new CfnOutput(this, "Cognito-SMS-Key-Lambda", {
    //   value: cognitoSmsLambda.functionArn,
    // });
    // new CfnOutput(this, "Reset-Train-lambda", {
    //   value: resetTrainLambda.functionArn,
    // });
  }
}
