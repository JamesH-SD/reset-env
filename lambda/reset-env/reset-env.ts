import * as dotenv from "dotenv";
dotenv.config();
// S3
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
// DynamoDb
import { DeleteItemCommand, DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
// Cognito
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
// Secrets Manager
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
import * as mysql from "mysql2";

const now = () => Date();
const pemFile: string = path.resolve(__dirname, "rds-combined-ca-bundle.pem");
const region: any = process.env.AWS_REGION;
const s3Client: S3Client = new S3Client(region);
const sqlBucket: string | undefined = process.env.DEV_SQL_S3_BUCKET; //DEV_SQL_S3_BUCKET
const dynamoDBClient: DynamoDB = new DynamoDB({ region });
const awsConfig: object = {
  region: process.env.AWS_REGION,
  accessKey: process.env.AWS_ACCESS_KEY_ID,
  secretAcessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};
const cognitoClient: CognitoIdentityProviderClient =
  new CognitoIdentityProviderClient(awsConfig);

export const handler = async (_: any): Promise<any> => {
  await resetTrainingEnv();

  const secret_name = "rds!cluster-cd453cb6-8f7b-4391-828e-c25f000f80cc";

  // const client = new SecretsManagerClient(region);
  // console.log("This is the Client Response: ", client);
  // let response;

  // try {
  //   response = await client.send(
  //     new GetSecretValueCommand({
  //       SecretId: process.env.MYPOKKET_DB_CRED,
  //       VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
  //     })
  //   );
  //   console.log("This is the GetSecretValueCommand response: ", response);
  // } catch (error) {
  //   throw error;
  // }

  // const secret = response.SecretString;

  // console.log("This is the SecretString response ===>", secret);
  // return {
  //   okay: true,
  // };
};

// Make S3 call to retrieve files to reset DB
async function getSqlFiles(file?: string): Promise<any> {
  const params = new GetObjectCommand({
    Bucket: sqlBucket,
    Key: file,
  });
  try {
    const sqlFileContent = await s3Client.send(params);
    return sqlFileContent.Body?.transformToString().then((result) => {
      const sqlStatements: string = result;
      return sqlStatements;
    });
  } catch (error) {
    console.error("ERROR: S3GetSqlFilesException: ", error);
    throw new Error("COULD NOT RETRIEVE S3 FILES");
  }
}

// getSqlFiles('grants-tablecrud.sql');

const rows: any = [];

const processCsv = (inputCsvFile: string, tableName?: string) => {
  fs.createReadStream(inputCsvFile)
    .pipe(csv({ separator: "," }))
    .on("data", (row: any) => {
      rows.push({
        ptUserName: row["ptUserName"],
        ptCustodyStatus: row["ptCustodyStatus"],
        spaCmUserName: row["spaCmUserName"],
        spaDefaultRole: row["spaDefaultRole"],
        spaCmCustomRole: row["spaCmCustomRole"],
      });
    })
    .on("end", async () => {
      for (const row of rows) {
        if (row != "") {
          const ptUserName = row.ptUserName;
          const ptCustodyStatus = row.ptCustodyStatus;
          const spaCmUserName = row.spaCmUserName;
          const spaDefaultRole = row.spaDefaultRole;
          const spaCmCustomRole = row.spaCmCustomRole;

          // updatePtCustody(ptUserName, ptCustodyStatus);
          // updateSpaCmRoles(spaCmUserName, spaDefaultRole, spaCmCustomRole);
          // const usersToBeDeleted = await getListOfusers();
          // await deleteUserByIds(usersToBeDeleted);
          const orgsToBeDeleted = await getOrgIds(tableName);
          await deleteItemsByOrgId(orgsToBeDeleted);
          const surveysToBeDeleted = await getSurveyData();
          await deleteSurveyByFormId(surveysToBeDeleted);
        } 
      }
    });
  return rows;
};

// Primary function to update Survey DynamoDb Table
const getSurveyData = async (): Promise<any[]> => {
  const surveyItemParams = {
    TableName: process.env.TRAIN_SURVEY_TABLE_NAME, //SURVEY_TABLE_NAME,
    AttributesToGet: ["formId"],
  };
  try {
    const { Items } = await dynamoDBClient.scan(surveyItemParams);
    return (
      Items?.filter((item) => item.formId)
        .map((item) => item.formId || "")
        .filter((item) => item) || []
    );
    // if (Items && Items.length > 0) {
    //   for (const item of Items) {
    //     const formId: any = item.formId;
    //     surveyToBeDeleted.push(formId);
    //     console.log("Surveys to be deleted: ", formId);
    //   }
    // } else {
    //   console.log("No Survey Forms Found");
    // }
  } catch (error) {
    console.error("ERROR: getDynamoDbItemsException: ", error);
    throw new Error("UNABLE TO GET ORG IDs FROM DB");
  }
};

// Primary function to delete formIds from Survey Table
const deleteSurveyByFormId = async (orgIds: string[]) => {
  try {
    for await (const orgId of orgIds) {
      console.log("Here are the OrgIds ==> ", orgId);
      deleteSurveyById(orgId);
    }
  } catch (error) {
    console.error("ERROR: orgIdIterationException: ", error);
    throw new Error("UNABLE TO ITERATE ORG IDs");
  }
};

// Secondary function to delete OrgIds from SP Table
const deleteSurveyById = async (orgId: string) => {
  const deleteParams = {
    TableName: process.env.TRAIN_SURVEY_TABLE_NAME, //SP_TABLE_NAME,
    Key: {
      orgId: { S: orgId },
    },
  };

  const deleteRequest = new DeleteItemCommand(deleteParams);

  try {
    await dynamoDBClient.send(deleteRequest);
    console.log(`Item with orgId: ${orgId} deleted.`);
  } catch (error) {
    console.error("ERROR: deleteOrgIdException: ", error);
    // throw new Error("UNABLE TO DELETE ORG ID");
  }
};

// Primary function to grab new OrgIds from SP Table
const getOrgIds = async (
  tableName?: string,
  epoch?: number
): Promise<string[]> => {
  const creationDate: string = "1/1/2024"; // Change to env
  const dbItemParams = {
    TableName: tableName,
    AttributesToGet: ["orgId", "invitedDate", "orgName"],
  };
  try {
    const { Items } = await dynamoDBClient.scan(dbItemParams);
    return (
      Items?.filter(
        (item) =>
          Date.parse(item?.invitedDate?.S || "") > Date.parse(creationDate)
      )
        .map((item) => item?.orgId?.S || "")
        .filter((item) => item) || []
    );
    // if (Items && Items.length > 0) {
    //   for (const item of Items) {
    //     const orgId: any = item.orgId.S;
    //     const createdDTM: any = item.invitedDate.S;

    //     const createdDTMEpoch = Date.parse(createdDTM);
    //     const creationDateEpoch = Date.parse(creationDate);

    //     if (createdDTMEpoch > creationDateEpoch) {
    //       orgToBeDeleted.push(orgId);
    //     }
    //     console.log("OrgIds to be deleted: ", orgToBeDeleted);
    //   }
    // }
    // deleteItemsByOrgIds(orgToBeDeleted);
  } catch (error) {
    console.error("ERROR: getDynamoDbItemsException: ", error);
    throw new Error("UNABLE TO GET ORG IDs FROM DB");
  }
};

// Primary function to delete OrgIds from SP Table
const deleteItemsByOrgId = async (orgIds: string[]) => {
  try {
    for await (const orgId of orgIds) {
      console.log("Here are the OrgIds ==> ", orgId);
      deleteDBItemsByOrgId(orgId);
    }
  } catch (error) {
    console.error("ERROR: orgIdIterationException: ", error);
    throw new Error("UNABLE TO ITERATE ORG IDs");
  }
};

// Secondary function to delete OrgIds from SP Table
const deleteDBItemsByOrgId = async (orgId: string) => {
  const deleteParams = {
    TableName: process.env.TRAIN_SP_TABLE_NAME, //SP_TABLE_NAME,
    Key: {
      orgId: { S: orgId },
    },
  };

  const deleteRequest = new DeleteItemCommand(deleteParams);

  try {
    await dynamoDBClient.send(deleteRequest);
    console.log(`Item with orgId: ${orgId} deleted.`);
  } catch (error) {
    console.error("ERROR: deleteOrgIdException: ", error);
    // throw new Error("UNABLE TO DELETE ORG ID");
  }
};

// Primary function to update Logs
// async function sendLogs() {
//   const logParams: PutCommand = new PutCommand({
//     TableName: process.env.LOGS_TABLE_NAME,
//     Item: {
//       StartedDateTime: now(),
//       version: "4.13.0", // sqlBucket?.split('-')[2].toString(),
//       user: "Showing-Erick",
//     },
//   });

//   try {
//     const response = dynamoDBClient.send(logParams);
//     response.then((result) => {
//       console.log("I am the sendLogs result", result);
//       return result;
//     });
//   } catch (error) {
//     console.error("ERROR: sendLogsException: ", error);
//     throw new Error("UNABLE TO SEND LOGS");
//   }
// }

//Primary Function for resetting the Database <---- On-click?

const resetTrainingEnv: any = async (): Promise<any> => {
  try {
    const dbMysql = await mysql.createConnection({
      host: process.env.TRAIN_DB_HOST,
      user: process.env.DB_USER,
      password: process.env.TRAIN_DB_PASSWORD, //DB_PASSWORD,
      database: process.env.DB_NAME, //DB_NAME,
      multipleStatements: true,
      ssl: {
        ca: fs.readFileSync(pemFile),
      },
    });
    dbMysql.config.namedPlaceholders = true;

    const exeDump: any = async () => {
      const dbSqlFiles = await getSqlFiles("Train-4.15.0_20240223.sql");
      dbMysql.query(dbSqlFiles, [], (_err) => {
        console.log("Train DB Dump Completed ");
      });
    };

    const exeGrants: any = async () => {
      const dbSqlFiles = await getSqlFiles("grants.sql");
      dbMysql.query(dbSqlFiles, [], (_err) => {
        console.log("Grants Completed ");
      });
    };

    const exeGrantsCrud: any = async () => {
      const dbSqlFiles = await getSqlFiles("grants-tablecrud.sql");
      dbMysql.query(dbSqlFiles, [], (_err) => {
        console.log("Table CRUD Completed ");
      });
      //sendSNSNotification("The Database has been reset.");
    };

    await exeDump();
    await exeGrants();
    await exeGrantsCrud();
    await dbMysql.end();

    processCsv(
      "./lambda/reset-env/train_user_combined.csv",
      process.env.TRAIN_SP_TABLE_NAME
    ); //Date.parse(process.env.CREATION_DATE?)
  } catch (error) {
    console.error("ERROR: resetTrainingEnvException: ", error);
    throw new Error(`COULD NOT EXECUTE TOWARDS DB, ${error}`);
  }
};

resetTrainingEnv();
