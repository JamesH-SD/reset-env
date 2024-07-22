import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";

export const handler: Handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`,
  };
  return Promise.resolve(response);
};
