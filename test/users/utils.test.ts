import {
  parseCustodyStatus,
  parseRole,
  CustodyStatus,
  Role,
} from "../../lambda/reset-env/lib/users";

describe("parseRole", () => {
  it("should return correct Role enum for valid input", () => {
    expect(parseRole("1")).toBe(Role.ACIVILATE_ADMIN);
    expect(parseRole("2")).toBe(Role.PROGRAM_ADMIN);
    expect(parseRole("3")).toBe(Role.SERVICE_PROVIDER_ADMIN);
    expect(parseRole("4")).toBe(Role.CASE_MANAGER);
    expect(parseRole("5")).toBe(Role.PARTICIPANT);
    expect(parseRole("6")).toBe(Role.GUARDIAN);
  });

  it("should return undefined for invalid input", () => {
    expect(parseRole("7")).toBeUndefined();
    expect(parseRole("")).toBeUndefined();
    expect(parseRole("invalid")).toBeUndefined();
  });
});

describe("parseCustodyStatus", () => {
  it("should return correct CustodyStatus enum for valid input", () => {
    expect(parseCustodyStatus("1")).toBe(CustodyStatus.IN_CUSTODY);
    expect(parseCustodyStatus("2")).toBe(
      CustodyStatus.OUT_OF_CUSTODY_NO_CELL_PHONE
    );
    expect(parseCustodyStatus("3")).toBe(
      CustodyStatus.OUT_OF_CUSTODY_AND_HAS_CELL_PHONE
    );
    expect(parseCustodyStatus("4")).toBe(CustodyStatus.NOT_KNOWN);
    expect(parseCustodyStatus("5")).toBe(
      CustodyStatus.IN_CUSTODY_BUT_MESSAGING_AND_DIRECTIONS_ENABLED
    );
  });

  it("should return undefined for invalid input", () => {
    expect(parseCustodyStatus("6")).toBeUndefined();
    expect(parseCustodyStatus("")).toBeUndefined();
    expect(parseCustodyStatus("invalid")).toBeUndefined();
  });
});
