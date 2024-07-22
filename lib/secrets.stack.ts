import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { Env } from "./types";
// import {
//     SecretsManagerClient,
//     GetSecretValueCommand,
//   } from "@aws-sdk/client-secrets-manager";

export type ResetEnvSecretsStackOpts = {
    env:Env
}

export class ResetEnvSecretsStack extends cdk.Stack {
  constructor(scope: Construct, id: string,opts:ResetEnvSecretsStackOpts, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // const secret = sm.Secret.fromSecretAttributes(this, "ImportedSecret", {
    //   secretCompleteArn:
        // "arn:aws:secretsmanager:<region>:<account-id-number>:secret:<secret-name>-<random-6-characters>" 
        // arn of Train secret
       // If the secret is encrypted using a KMS-hosted CMK, either import or reference that key:
      // encryptionKey: ...
    // });

    const templatedSecret = new secretsmanager.Secret(this, 'TemplatedSecret', {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: 'postgres' }),
          generateStringKey: 'password', // Pass the secret name here to store that value in the SM
          excludeCharacters: '/@"',
        },
        // rds-db-credentials/cluster-R5TT6DJBY6H2ZMT4HMDRFETOCM/acivilatedbadmin pass parameter as secret
        secretName:`reset-env.rds-credentials.${opts.env}`
      });



     /**  // Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html


  
  const secret_name = "rds-db-credentials/cluster-R5TT6DJBY6H2ZMT4HMDRFETOCM/acivilatedbadmin";
  
  const client = new SecretsManagerClient({
    region: "us-east-1",
  });
  
  let response;
  
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
  
  const secret = response.SecretString;
  
  // Your code goes here */
  }
}

