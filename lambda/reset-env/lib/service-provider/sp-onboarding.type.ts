/**
 * Service provider onboarding
 * **/
export type Organization = {
  id: string;
  name: string;
};

/**
 * Service provider onboarding
 * **/
export type ServiceProviderOnBoarding = {
  org: Organization;
  inviteDate: Date;
};
