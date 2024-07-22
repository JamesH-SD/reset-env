export const mockCognitoUsers = {
  Users: [
    {
      Username: "user1",
      Attributes: [
        { Name: "given_name", Value: "John" },
        { Name: "family_name", Value: "Doe" },
        { Name: "custom:userId", Value: "123" },
        { Name: "sub", Value: "123" },
      ],
    },
    {
      Username: "user2",
      Attributes: [
        { Name: "given_name", Value: "Jane" },
        { Name: "family_name", Value: "Doe" },
        { Name: "custom:userId", Value: "456" },
        { Name: "sub", Value: "456" },
      ],
    },
  ],
};
