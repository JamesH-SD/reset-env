export const mockUsers = [
  {
    username: "user1",
    firstName: "John",
    lastName: "Doe",
    pokketUesrId: "123",
    cognitoUserId: "123",
  },
  {
    username: "user2",
    firstName: "Jane",
    lastName: "Doe",
    pokketUesrId: "456",
    cognitoUserId: "456",
  },
];

export const mockUsersInCSV = [
  "ptUserName,custodyStatus,spaCmUsername,spaDefaultRole,spaCmCustomRole\n",
  "user1,1,user1,1,1\n", // Valid row
  "user2,2,user2,2,3\n", // Valid row
  "user3,invalid,user3,invalid,invalid\n", // Invalid row
].join("");
