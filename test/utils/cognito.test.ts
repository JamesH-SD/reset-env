import { findAttributeByPropName } from "../../lambda/reset-env/lib/utils";

describe("findAttributeByPropName", () => {
  it("should return a function to find attribute by property name", () => {
    const propName = "given_name";
    const findByGivenName = findAttributeByPropName(propName);
    const attribute1 = { Name: "given_name", Value: "John" };
    const attribute2 = { Name: "family_name", Value: "Doe" };
    expect(findByGivenName(attribute1)).toBe(true);
    expect(findByGivenName(attribute2)).toBe(false);
  });

  it("should return false when attribute does not match property name", () => {
    const propName = "given_name";
    const findByGivenName = findAttributeByPropName(propName);
    const attribute = { Name: "family_name", Value: "Doe" };
    expect(findByGivenName(attribute)).toBe(false);
  });
});
