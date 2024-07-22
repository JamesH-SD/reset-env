import { Logger } from "@aws-lambda-powertools/logger";
import {
  DeleteItemCommand,
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { ServiceProviderOnBoarding } from "./sp-onboarding.type";
import { Id, chunkArray } from "../utils";

/**
 * Service provider onboarding service
 * **/
export class ServiceProviderOnBoardingService {
  /**
   * Service provider onboarding service
   * @param logger - Logger
   * @param dbClient - DynamoDB client
   * @param tableName - Table name
   * **/
  constructor(
    private logger: Logger,
    private dbClient: DynamoDBClient,
    private tableName: string
  ) {}

  /**
   * Get all the service providers onboarding
   * @returns {Promise<ServiceProviderOnBoarding[]>} - Service providers onboarding
   * **/
  getByGivenCreationDate = async (
    date: string
  ): Promise<ServiceProviderOnBoarding[]> => {
    this.logger.debug("preparing dynamodb command");

    const dbItemParams = {
      TableName: this.tableName,
      AttributesToGet: ["orgId", "invitedDate", "orgName"],
      FilterExpression: "invitedDate >= :invitedDate",
      ExpressionAttributeValues: {
        ":invitedDate": { S: date },
      },
    };

    const scanCmd = new ScanCommand(dbItemParams);

    this.logger.info("calling dynamodb client with cmd", {
      data: scanCmd,
    });

    try {
      const result = await this.dbClient.send(scanCmd);

      return (
        result?.Items?.map(
          (item) =>
            ({
              org: {
                id: item.orgId.S,
                name: item.orgName.S,
              },
              inviteDate: new Date(),
            } as ServiceProviderOnBoarding)
        ) || []
      );
    } catch (error) {
      this.logger.error("An error has ocurred while retreiving the data", {
        data: { error },
      });
      throw error;
    }
  };

  /**
   * Delete items by org ids
   * @param orgIds - Org ids
   * @returns {Promise<{deletedSpOnboarding: Id[], skippedSpOnboarding: Id[]}>} - Deleted and skipped service providers onboarding
   * **/
  deleteItemsByOrgIds = async (
    orgIds: Id[]
  ): Promise<{
    deletedSpOnboarding: Id[];
    skippedSpOnboarding: Id[];
  }> => {
    const spChunks = chunkArray(orgIds, 25);
    this.logger.debug("preparing dynamodb command");
    const deletedSpOnboarding: Id[] = [];
    const skippedSpOnboarding: Id[] = [];

    const deletePromises = spChunks.map(async (chunk) => {
      const deleteCmds = chunk.map(
        (id) =>
          new DeleteItemCommand({
            TableName: this.tableName,
            Key: {
              orgId: { S: id },
            },
          })
      );

      // Delete users in parallel
      await Promise.all(
        deleteCmds.map(async (cmd) => {
          try {
            this.logger.info("Deleting sp-onboarding", {
              data: cmd.input.Key?.orgId?.S || "",
            });
            await this.dbClient.send(cmd);
            this.logger.info("Deleted sp-onboarding", {
              data: cmd.input.Key?.orgId?.S || "",
            });
            deletedSpOnboarding.push(cmd.input.Key?.orgId?.S || "");
          } catch (err) {
            this.logger.error("Error deleting sp-onboarding", {
              data: { key: cmd.input.Key?.orgId?.S || "", error: err },
            });
            skippedSpOnboarding.push(cmd.input.Key?.orgId?.S || "");
          }
        })
      );
    });

    // Wait for all chunks to be deleted
    await Promise.all(deletePromises);

    return {
      deletedSpOnboarding,
      skippedSpOnboarding,
    };
  };
}
