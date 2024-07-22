import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Env } from "./types";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export type SqlBucketStackOpts = {
  env: Env;
};

export class SqlBucketStack extends cdk.Stack {
  readonly bucketName: string;
  readonly sqlBucketArn: string;
  //   readonly bucketNameOutput: cdk.CfnOutput;
  constructor(
    scope: Construct,
    id: string,
    opts: SqlBucketStackOpts,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.bucketName = `reset-env.variables.${opts.env}`;

    const sqlBucket = new s3.Bucket(this, `sqlS3bucket.${opts.env}`, {
      bucketName: this.bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    this.sqlBucketArn = 'sqlBucketArn'
        new cdk.CfnOutput(this, this.sqlBucketArn, {
            value: sqlBucket.bucketArn,
            exportName: this.sqlBucketArn,
        })

    // S3 Policy statement
    const denyNonHttpsTraffic = new PolicyStatement({
      effect: Effect.DENY,
      actions: ["s3:*"],
      resources: [
        sqlBucket.bucketArn, // For the bucket
        `${sqlBucket.bucketArn}/*`, // For all objects
      ],
      principals: [new AnyPrincipal()],
      conditions: {
        Bool: { "aws:SecureTransport": "false" }, // needs to be changed to fit whatever the Lambda is using.
      },
    });

    // Attach the policy to the bucket
    new s3.BucketPolicy(this, "BucketPolicy", {
      bucket: sqlBucket,
    }).document.addStatements(denyNonHttpsTraffic);



    // create folders for bucket 
    //    S3:
    //       - sql
    //          - 1.4.5 // sort for name (highest version)
    //       - cognito
    

    // this.bucketNameOutput = new cdk.CfnOutput(this, "ResetEnvSqlBucketName", {
    //   value: this.bucketName,
    // });
    cdk.Tags.of(sqlBucket).add("env", opts.env);
  }
}
