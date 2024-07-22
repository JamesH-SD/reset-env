import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function, InlineCode, Runtime } from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class TempAcivilateStack extends cdk.Stack {
  readonly RemovalPolicy = cdk.RemovalPolicy;
  readonly Duration = cdk.Duration;
  readonly cognitoPoolId = cdk.CfnOutput;
  readonly cognitoPoolURL = cdk.CfnOutput;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
        tempPasswordValidity: this.Duration.days(7),
      },
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      removalPolicy: this.RemovalPolicy.DESTROY,
      // customSenderKmsKey: cognitoSenderKmsKey,
    });

    const cognito_pool_client = userPool.addClient(
      "temp_acivialte-temporary-app",
      {
        userPoolClientName: "temp_acivialte-users-app",
      }
    );

    cognito_pool_client.applyRemovalPolicy(this.RemovalPolicy.DESTROY);

    // this.cognitoPoolId = new cdk.CfnOutput(this, "temp-acivialte.cognito-app.client-id", {
    //     value: cognito_pool_client.userPoolClientId,
    //   });
  }
}
