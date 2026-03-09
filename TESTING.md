# Test Suite Documentation

## Overview

This project includes a comprehensive test suite built with **Jest** and **TypeScript**, organized following **Domain-Driven Design (DDD)** principles. The test suite covers all backend services, repositories, and utilities.

## Project Structure

The test suite is organized in the `tests/` directory with the following structure:

```
tests/
├── setup.ts                           # Test fixtures and mock factories
├── domain/                            # Domain layer tests
├── application/
│   └── services/                      # Application services tests
│       ├── authService.test.ts
│       ├── userService.test.ts
│       ├── featureService.test.ts
│       ├── roleService.test.ts
│       ├── permissionService.test.ts
│       └── environmentService.test.ts
├── infrastructure/
│   └── repositories/                  # Repository layer tests
│       ├── userRepository.test.ts
│       ├── featureRepository.test.ts
│       ├── roleRepository.test.ts
│       └── environmentRepository.test.ts
└── utils/                             # Utility tests
    ├── validators.test.ts
    └── errorHandler.test.ts
```

## Test Coverage

### Application Services (6 test suites)

- **AuthService**: 3 tests covering authentication and admin user creation
- **UserService**: 8 tests covering user management operations
- **FeatureService**: 6 tests covering feature flag operations
- **RoleService**: 11 tests covering role management
- **PermissionService**: 7 tests covering permission management
- **EnvironmentService**: 6 tests covering environment management

### Infrastructure Repositories (4 test suites)

- **UserRepository**: 9 tests for user persistence
- **FeatureRepository**: 8 tests for feature persistence
- **RoleRepository**: 6 tests for role persistence
- **EnvironmentRepository**: 7 tests for environment persistence

### Utilities (2 test suites)

- **Validators**: 18 tests for input validation middleware
- **ErrorHandler**: 11 tests for error handling utilities

**Total: 139 tests across 12 test suites**

## Running Tests

### Available Commands

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run all tests with verbose output and coverage
pnpm test:all
```

## Test Organization by DDD

The tests are organized following Domain-Driven Design principles:

### 1. Domain Layer

- Tests for domain models and entities
- Validates business rules and invariants
- Located in: `tests/domain/`

### 2. Application Layer

- Tests for application services
- Tests business logic and use cases
- Validates service interactions
- Located in: `tests/application/services/`

### 3. Infrastructure Layer

- Tests for repositories
- Validates data persistence operations
- Tests database interactions
- Located in: `tests/infrastructure/repositories/`

### 4. Cross-Cutting Concerns

- Tests for utilities, validators, and middleware
- Located in: `tests/utils/`

## Test Setup and Fixtures

### Mock Factories

The `setup.ts` file provides factory functions to create mocks for all repositories:

```typescript
import {
  createMockUserRepository,
  createMockFeatureRepository,
  createMockRoleRepository,
  mockUsers,
  mockRoles,
  mockFeatures,
} from "../setup";

describe("MyService", () => {
  let mockRepo = createMockUserRepository();
  // Use mockRepo in tests
});
```

### Mock Data

Pre-defined mock data is available for common entities:

```typescript
// Users
mockUsers.admin;
mockUsers.editor;
mockUsers.viewer;

// Roles
mockRoles.admin;
mockRoles.editor;
mockRoles.viewer;

// Features
mockFeatures.betaFeature;
mockFeatures.darkMode;

// Environments
mockEnvironments.development;
mockEnvironments.staging;
mockEnvironments.production;
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe()` blocks
- Use clear, descriptive test names
- One assertion focus per test when possible

### 2. Mocking

- Use mock factories for consistency
- Clear mock setup in `beforeEach()`
- Reset mocks between tests

### 3. Assertions

- Test both success and failure cases
- Verify correct parameters are passed to dependencies
- Use specific matchers for clarity

### 4. Database Testing

- Repository tests mock the database module
- Services tests mock repositories
- This allows unit testing without database setup

## Example Test

```typescript
import { UserService } from "../../../src/application/services/userService";
import { createMockUserRepository, mockUsers } from "../../setup";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  describe("listUsers", () => {
    it("should return a list of users without passwords", async () => {
      mockUserRepository.listAll.mockResolvedValue([mockUsers.admin]);

      const result = await userService.listUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty("password");
    });
  });
});
```

## Extending Tests

### Adding New Service Tests

1. Create file: `tests/application/services/newService.test.ts`
2. Import mock repositories from `setup.ts`
3. Write test suites following existing patterns

### Adding New Repository Tests

1. Create file: `tests/infrastructure/repositories/newRepository.test.ts`
2. Mock the database module
3. Write tests for each repository method

## Configuration

Jest configuration is defined in `jest.config.js` with:

- **Test environment**: Node.js
- **Test file patterns**: `**/?(*.)+(spec|test).ts`
- **Module type**: CommonJS with TypeScript support
- **Coverage**: Includes all source files except migrations and type definitions

## Troubleshooting

### Tests Not Found

- Verify test files end with `.test.ts` or `.spec.ts`
- Ensure test files are in the `tests/` directory

### Module Resolution Issues

- Check import paths - use relative paths from test file location
- Verify TypeScript configuration in `tsconfig.json`

### Mock Issues

- Call `jest.clearAllMocks()` in `beforeEach()` for test isolation
- Use `mockResolvedValue()` for single values or `mockResolvedValueOnce()` for sequential calls

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```bash
# Generate coverage report for CI
pnpm test:coverage

# Run tests with exit code
pnpm test
```

Coverage reports are generated in the `coverage/` directory with HTML, LCOV, and text formats.

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `pnpm test`
3. Check coverage: `pnpm test:coverage`
4. Maintain > 80% code coverage target

---

For more information about Jest, visit: https://jestjs.io/
For DDD principles, visit: https://www.domainlanguage.com/ddd/
