import { CustodyStatus, Role } from "./user.type";

/**
 * Function to parse role from string
 * @param {string} input - Role as string
 * @returns {Role} - Role as enum
 * @example
 * parseRole("1") // Role.ACIVILATE_ADMIN
 * parseRole("2") // Role.PROGRAM_ADMIN
 * parseRole("3") // Role.SERVICE_PROVIDER_ADMIN
 * parseRole("4") // Role.CASE_MANAGER
 * parseRole("5") // Role.PARTICIPANT
 * parseRole("6") // Role.GUARDIAN
 * parseRole("7") // undefined
 * **/
export const parseRole = (input: string): Role | undefined => {
  const asInt = parseInt(input, 10);
  switch (asInt) {
    case 1:
      return Role.ACIVILATE_ADMIN;
    case 2:
      return Role.PROGRAM_ADMIN;
    case 3:
      return Role.SERVICE_PROVIDER_ADMIN;
    case 4:
      return Role.CASE_MANAGER;
    case 5:
      return Role.PARTICIPANT;
    case 6:
      return Role.GUARDIAN;
    default:
      return undefined;
  }
};

/**
 * Function to parse custody status from string
 * @param {string} input - Custody status as string
 * @returns {CustodyStatus} - Custody status as enum
 * @example
 * parseCustodyStatus("1") // CustodyStatus.IN_CUSTORY
 * parseCustodyStatus("2") // CustodyStatus.OUT_OF_CUSTODY_NO_CELL_PHONE
 * parseCustodyStatus("3") // CustodyStatus.OUT_OF_CUSTODY_AND_HAS_CELL_PHONE
 * parseCustodyStatus("4") // CustodyStatus.NOT_KNOWN
 * parseCustodyStatus("5") // CustodyStatus.IN_CUSTODY_BUT_MESSAGING_AND_DIRECTIONS_ENABLED
 * parseCustodyStatus("6") // undefined
 * **/
export const parseCustodyStatus = (
  input: string
): CustodyStatus | undefined => {
  const asInt = parseInt(input, 10);
  switch (asInt) {
    case 1:
      return CustodyStatus.IN_CUSTODY;
    case 2:
      return CustodyStatus.OUT_OF_CUSTODY_NO_CELL_PHONE;
    case 3:
      return CustodyStatus.OUT_OF_CUSTODY_AND_HAS_CELL_PHONE;
    case 4:
      return CustodyStatus.NOT_KNOWN;
    case 5:
      return CustodyStatus.IN_CUSTODY_BUT_MESSAGING_AND_DIRECTIONS_ENABLED;
    default:
      return undefined;
  }
};
