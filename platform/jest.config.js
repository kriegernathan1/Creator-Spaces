/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.spec.ts"],
  setupFiles: ["<rootDir>/src/tests/setup.ts"],
};
