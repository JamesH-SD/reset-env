import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";

export type NOCApiStageOpts = {
  resetLambda: any;
};

export class NOCApiStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    opts: NOCApiStageOpts,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const nocApi = new HttpApi(this, "NOCApi");
    const resetEnvLambda = new HttpLambdaIntegration(
      "ResetEnvLambda",
      opts.resetLambda
    );

    nocApi.addRoutes({
      path: "/resetenv",
      methods: [HttpMethod.POST],
      integration: resetEnvLambda,
    });
  }
}
