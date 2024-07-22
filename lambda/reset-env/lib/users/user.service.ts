import * as csv from "csv-parser";
import { Readable } from "node:stream";
import { Logger } from "@aws-lambda-powertools/logger";
import {
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { chunkArray, findAttributeByPropName } from "../utils";
import { CustodyStatus, RetainUser, Role, User, Username } from "./user.type";
import { parseCustodyStatus, parseRole } from "./utils";

/**
 * Service to manage users in cognito
 * **/
export class UserService {
  /**
   * Constructor for UserService
   * @param {Logger} logger - Logger instance
   * @param {CognitoIdentityProviderClient} cognitoClient - Cognito client
   * @param {string} cognitoPoolId - Cognito pool id
   * **/
  constructor(
    private logger: Logger,
    private cognitoClient: CognitoIdentityProviderClient,
    private cognitoPoolId: string
  ) {}

  /**
   * Function to get list of users from cognito
   * @returns {Promise<User[]>} - List of users
   * @example
   * getListOfUsersFromCognito() // [{username: "user1", firstName: "John", lastName: "Doe", pokketUesrId: "123", cognitoUserId: "123"}, {
   * username: "user2", firstName: "Jane", lastName: "Doe", pokketUesrId: "456", cognitoUserId: "456"}]
   * **/
  getListOfusersFromCognito = async (): Promise<User[]> => {
    this.logger.debug("preparing cognito command for");

    // Prepare list users command
    const listInput: ListUsersCommand = new ListUsersCommand({
      UserPoolId: this.cognitoPoolId,
    });

    this.logger.info("calling cognito client with cmd", { data: listInput });

    try {
      // Get list of users
      const response = await this.cognitoClient.send(listInput);

      return (
        response?.Users?.map((user) => {
          const givenName = findAttributeByPropName("given_name");
          const familyName = findAttributeByPropName("family_name");
          const userId = findAttributeByPropName("custom:userId");
          const sub = findAttributeByPropName("sub");

          return {
            username: user.Username || "",
            firstName: user.Attributes?.find(givenName)?.Value || "",
            lastName: user.Attributes?.find((a) => familyName(a))?.Value || "",
            pokketUesrId: user.Attributes?.find((a) => userId(a))?.Value || "",
            cognitoUserId: user.Attributes?.find((a) => sub(a))?.Value || "",
          };
        }) || []
      );
    } catch (err) {
      this.logger.error("Error getting list of users", { data: err });
      return [];
    }
  };

  /**
   * Function to delete users from cognito
   * @param {User[]} userList - List of users to be deleted
   * @returns {Promise<{ deletedUsers: Username[]; skippedUsers: Username[] }>} - Object containing deleted users and skipped users
   * @example
   * deleteUsers([user1, user2, user3]) // { deletedUsers: [user1, user2], skippedUsers: [user3] }
   * **/
  deleteUsers = async (
    userList: Username[]
  ): Promise<{ deletedUsers: Username[]; skippedUsers: Username[] }> => {
    const userChunks = chunkArray(userList, 10);
    const deletedUsers: Username[] = [];
    const skippedUsers: Username[] = [];

    // Delete users in chunks of 10
    const deletePromises = userChunks.map(async (chunk) => {
      const deleteCmds = chunk.map(
        (username) =>
          new AdminDeleteUserCommand({
            UserPoolId: this.cognitoPoolId,
            Username: username,
          })
      );

      // Delete users in parallel
      await Promise.all(
        deleteCmds.map(async (cmd) => {
          try {
            this.logger.info("Deleting user", {
              data: cmd.input.Username || "",
            });
            await this.cognitoClient.send(cmd);
            this.logger.info("Deleted user", {
              data: cmd.input.Username || "",
            });
            deletedUsers.push(cmd.input.Username || "");
          } catch (err) {
            this.logger.error("Error deleting user", {
              data: { username: cmd.input.Username || "", error: err },
            });
            skippedUsers.push(cmd.input.Username || "");
          }
        })
      );
    });

    // Wait for all chunks to be deleted
    await Promise.all(deletePromises);

    return {
      deletedUsers,
      skippedUsers,
    };
  };

  /**
   * Function to get users to retain from csv
   * @param {Readable} stream - Read stream for csv
   * @returns {Promise<RetainUser[]>} - List of users to retain
   * @example
   * getUsersToRetainFromCSV(stream) // [{username: "user1", custodyStatus: 1, spaCmUsername: "user1", spaDefaultRole: 1, spaCmCustomRoles: [1, 2]}, {
   * username: "user2", custodyStatus: 2, spaCmUsername: "user
   * **/
  getUsersToRetainFromCSV(stream: Readable): Promise<RetainUser[]> {
    return new Promise((resolve, reject) => {
      const users: RetainUser[] = [];
      this.logger.info("processing csv", {});
      stream
        .pipe(csv({ separator: "," }))
        .on("data", (row: Record<string, string>) => {
          this.logger.info("processing row", { data: row });

          if (Object.keys(row).length !== 5) {
            return reject("Invalid CSV format");
          }

          const username = row["ptUserName"];
          const custodyStatus = parseCustodyStatus(row["custodyStatus"]);
          const spaCmUsername = row["spaCmUsername"];
          const spaDefaultRole = parseRole(row["spaDefaultRole"]);
          const spaCmCustomRoles = row["spaCmCustomRole"]
            ?.split(",")
            .map((role) => parseRole(role) || Role.PARTICIPANT);

          // Skip if any of the required fields are missing
          if (
            custodyStatus === undefined ||
            spaDefaultRole === undefined ||
            spaCmCustomRoles === undefined
          ) {
            return;
          }

          const user: RetainUser = {
            username,
            custodyStatus,
            spaCmUsername,
            spaDefaultRole,
            spaCmCustomRoles,
          };
          this.logger.info("importing user", { data: user });

          users.push(user);
        })
        .on("end", () => {
          if (users.length === 0) {
            this.logger.error("No users found in CSV");
            return reject("No users found in CSV");
          }
          this.logger.info("CSV file imported successfully");
          resolve(users);
        })
        .on("error", (err) => {
          this.logger.error("An error has occurred", err);
          reject(err);
        });
    });
  }

  /**
   * Function to update custody status of a user
   * @param {Username} username - Username of the user
   * @param {CustodyStatus} custodyStatus - Custody status of the user
   * @returns {Promise<void>} - Promise
   * @example
   * updateCustodyStatus("user1", 1) // Promise
   * **/
  updateCustodyStatus = async (
    username: Username,
    custodyStatus: CustodyStatus
  ): Promise<void> => {
    const input = {
      UserPoolId: this.cognitoPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: "custom:inCustodyStatus",
          Value: custodyStatus.toString(),
        },
      ],
    };
    const cmd = new AdminUpdateUserAttributesCommand(input);
    this.logger.debug("Preparing command", { data: cmd });

    try {
      this.logger.debug("attempting to update attributes", { data: cmd });

      await this.cognitoClient.send(cmd);

      this.logger.info("User updated successfully", {
        data: { username },
      });
    } catch (err) {
      this.logger.error("Error updating custody status", {
        data: {
          error: err,
          username,
          custodyStatus,
        },
      });
    }
  };

  /**
   * Function to update user roles
   * @param {Username} username - Username of the user
   * @param {Role} defaultRole - Default role of the user
   * @param {Role[]} roles - List of roles
   * @returns {Promise<void>} - Promise
   * @example
   * updateUserRoles("user1", 1, [1, 2]) // Promise
   * **/
  updateUserRoles = async (
    username: Username,
    defaultRole: Role,
    roles: Role[]
  ): Promise<void> => {
    const input = {
      UserPoolId: this.cognitoPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: "custom:defaultRole",
          Value: defaultRole.toString(),
        },
        {
          Name: "custom:customRoles",
          Value: roles.join(","),
        },
      ],
    };
    const cmd = new AdminUpdateUserAttributesCommand(input);
    this.logger.debug("Preparing command", { data: cmd });

    try {
      this.logger.debug("attempting to update attributes", { data: cmd });

      await this.cognitoClient.send(cmd);

      this.logger.info("User updated successfully", {
        data: { username },
      });
    } catch (err) {
      this.logger.error("Error updating user roles", {
        data: {
          error: err,
          username,
          defaultRole,
          roles,
        },
      });
    }
  };
}
