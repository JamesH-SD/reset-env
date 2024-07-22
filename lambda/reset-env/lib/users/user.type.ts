/**
 * Type for username
 * **/
export type Username = string;

/**
 * Type for user
 * **/
export type User = {
  cognitoUserId: string;
  username: Username;
  firstName: string;
  lastName: string;
  pokketUesrId: string;
};

/**
 * Type for custody status
 * **/
export enum CustodyStatus {
  IN_CUSTODY = 1,
  OUT_OF_CUSTODY_NO_CELL_PHONE = 2,
  OUT_OF_CUSTODY_AND_HAS_CELL_PHONE = 3,
  NOT_KNOWN = 4,
  IN_CUSTODY_BUT_MESSAGING_AND_DIRECTIONS_ENABLED = 5,
}

/**
 * Type for retain user
 * **/
export enum Role {
  ACIVILATE_ADMIN = 1,
  PROGRAM_ADMIN = 2,
  SERVICE_PROVIDER_ADMIN = 3,
  CASE_MANAGER = 4,
  PARTICIPANT = 5,
  GUARDIAN = 6,
}

/**
 * Type for retain user
 * **/
export type RetainUser = {
  username: Username;
  custodyStatus?: CustodyStatus;
  spaCmUsername: Username;
  spaDefaultRole: Role | undefined;
  spaCmCustomRoles: Role[];
};
