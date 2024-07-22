import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";

/**
 * Function to find attribute by property name
 * @param {string} propName - Property name
 * @returns {(obj: AttributeType) => boolean} - Function to find attribute by property name
 * @example
 * findAttributeByPropName("given_name") // (obj: AttributeType) => boolean
 * **/
export const findAttributeByPropName =
  (propName: string): ((obj: AttributeType) => boolean) =>
  (obj) => {
    return obj.Name === propName;
  };
