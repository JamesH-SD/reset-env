import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  Wave,
} from "aws-cdk-lib/pipelines";
import { ArtifactStage } from "./pipeline-artifacts.stage";
import { ResetEnvStage } from "./reset-env.stage";

export class ResetEnvPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "ResetEnvPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("Acivilate/reset-env", "main"),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
    //comment
    const env = "train";

    const wave = pipeline.addWave("PipelineWave");
    const artifactStage = new ArtifactStage(this, "Supporting-Resources", {
      env,
    });
    const artifactStagePipeline = wave.addStage(artifactStage);
    // add frontend to wave

    const resetEnvStage = new ResetEnvStage(this, "Reset-Env", {
      awsKeyName: artifactStage.awsKeyNameParameter,
      sqlBucketName: artifactStage.bucketNameParameter,
      logsTableName: artifactStage.logsTableNameParameter,
      dbConnDetails: artifactStage.dbConnDetailsParameter,
      spOnboardTable: artifactStage.spOnboardTableParameter,
      surveysTable: artifactStage.surveysTableParameter,
      cognitoDetails: artifactStage.cognitoDetailsParameter,
      env,
    });

    pipeline.addStage(resetEnvStage);

    // resetEndStage.addPre(
    //   new ShellStep("supporting-artifacts-name", {
    //     envFromCfnOutputs: { bucketName: artifactStage.bucketName },
    //     commands: [`echo bucktname`],
    //   })
    // );
  }
}
