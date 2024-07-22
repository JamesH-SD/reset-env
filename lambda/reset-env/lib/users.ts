import { AdminDeleteUserCommand, CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";


export class UserService {
    constructor(private cognitoClient: CognitoIdentityProviderClient, ){   
    }
     getListOfusers = async () => {
        try {
          const listInput: ListUsersCommand = new ListUsersCommand({
            UserPoolId: process.env.TRAIN_COGNITO_POOL, //DEV_COGNITO_POOL, //
          });
          const response = await this.cognitoClient.send(listInput);
          const usersFilter: any = [];
          usersFilter.push(
            response.Users?.filter((user) => {
              rows.spaCmUserName !== user.Username ||
                rows.ptUserName !== user.Username;
            })
          );
          console.log("Retrieved all needed users", usersFilter);
          // deleteUsers(usersFilter); // getListOfUser -- Return []
          return usersFilter;
        } catch (err) {
          console.log(`Error retrieving users with ${err}`);
          throw new Error(`${err}`);
        }
      };
}


  const deleteUserByIds = async (userList: string[]) => {
    const input = {
      UserPoolId: process.env.TRAIN_COGNITO_POOL, // process.env.DEV_COGNITO_POOL
      Username: "",
    };
    for await (const user of userList) {
      input.Username = user;
      try {
        cognitoClient.send(new AdminDeleteUserCommand(input));
        console.log("Deleting user", user);
      } catch (err) {
        console.log(`Error deleting user: ${input.Username} with ${err}`);
        throw new Error(`${err}`);
      }
    }
  };