/**
 * This file contains the mock data for the sp-onboarding table
 * **/
export const mockSpOnboardingTable = {
  Items: [
    {
      orgId: { S: "orgId1" },
      orgName: { S: "orgName1" },
      invitedDate: { S: "2024-03-12" },
    },
    {
      orgId: { S: "orgId2" },
      orgName: { S: "orgName2" },
      invitedDate: { S: "2024-03-12" },
    },
  ],
};

/**
 * This file contains the mock data for the sp-onboarding
 * **/
export const mockSpOnboarding = [
  {
    org: {
      id: "orgId1",
      name: "orgName1",
    },
    inviteDate: expect.any(Date),
  },
  {
    org: {
      id: "orgId2",
      name: "orgName2",
    },
    inviteDate: expect.any(Date),
  },
];
