import { describe, it, expect, beforeAll } from "vitest";
import { 
  hashPassword, 
  checkPasswordHash, 
  makeJWT, 
  validateJWT, 
  extractBearerToken 
} from "./auth.js";
import { UserNotAuthenticatedError, BadRequestError} from "./api/errors.js";


// --------------------------------------------------- Test Password Hashing

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });
  
  it("should return false when password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });

  it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password1, "invalidhash");
    expect(result).toBe(false);
  });
});


// ----------------------------------------------------- Test JWT Functions

describe("JWT Functions", async () => {
  const secret = "secret";
  const wrongSecret = "wrong_secret";
  const userID = "some-unique-user-id";
  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userID, 3600, secret);
  });

  it("should validate a valid token", async () => {
    const result = validateJWT(validToken, secret);
    expect(result).toBe(userID)
  });

  it("should throw an error for an invalid token string", async () => {
    expect(() => validateJWT("invalid_token_string", secret))
      .toThrow(UserNotAuthenticatedError,);
  });

  it("should throw an error when the token is signed with a wrong secret", async () => {
    expect(() => validateJWT(validToken, wrongSecret))
      .toThrow(UserNotAuthenticatedError,);
  });
});


// -------------------------------------------- Test Extract Bearer Token

describe("Extract Bearer Token", async () => {
  const token = "mySecretToken";

  it("should extract the token from a valid header", () => {
    const header = `Bearer ${token}`;
    const result = extractBearerToken(header);
    expect(result).toBe(token);
  });

  it("should extract the token even if there are extra parts", () => {
    const header = `Bearer ${token} extra-data`;
    const result = extractBearerToken(header);
    expect(result).toBe(token);
  });

  it("should throw a BadRequestError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header does not start with 'Bearer'", () => {
    const header = "Basic mySecretToken";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header is an empty string", () => {
    const header = "";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });
});