/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^jose$": "<rootDir>/lib/infrastructure/auth/__mocks__/jose.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/playwright-report/",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "lib/config/tests/tsconfig.test.json",
        isolatedModules: true,
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!@panva/hkdf)/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  collectCoverage: true,
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/e2e/**",
    "!**/playwright-report/**",
    "!**/public/**",
    "!**/page.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 0.5,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },
  maxWorkers: 4,
  testTimeout: 30000,
  verbose: false,
  silent: true,
};
