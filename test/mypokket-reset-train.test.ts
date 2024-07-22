// import { Template } from 'aws-cdk-lib/assertions';
// import { App } from 'aws-cdk-lib';
// import { MypokketSftpStack } from '../lib/mypokket-sftp-stack';

it("1 === 1", () => {
  expect(1).toBe(1);
});
// test('SFTP Server Stack Test', () => {
//   const app = new App();
//   const stack = new MypokketSftpStack(app, 'TestStack');

//   const template = Template.fromStack(stack);

//     // Assertion 1: <NAME OR RESOURCE>
//     template.hasResourceProperties('AWS::EC2::VPC', {
//         <Properties>
//     });

// import * as cdk from 'aws-cdk-lib';
// import { Template } from 'aws-cdk-lib/assertions';
// import * as MypokketResetTrain from '../lib/mypokket-reset-train-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/mypokket-reset-train-stack.ts
// test('SQS Queue Created', () => {
//   const app = new cdk.App();
//     // WHEN
//   const stack = new MypokketResetTrain.MypokketResetTrainStack(app, 'MyTestStack');
//     // THEN
//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
// });
