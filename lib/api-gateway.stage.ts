import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NOCApiStack } from "./api-gateway.stack";

export type NOCApiStageOpts = {
  resetLambda: any;
};

export class NOCApiStage extends cdk.Stage {
  constructor(
    scope: Construct,
    id: string,
    opts: NOCApiStageOpts,
    props?: cdk.StageProps
  ) {
    super(scope, id, props);

    new NOCApiStack(this, "NOCApiStack", {
      resetLambda: opts.resetLambda,
    });
  }
}
