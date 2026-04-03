# TDD Guidelines for Easy-Flags

## Core Principle: Red-Green-Refactor
This project strictly follows the Test-Driven Development (TDD) cycle. Every feature or fix must progress through these three stages:

1. **🔴 RED**: Write a failing test that defines a small piece of functionality.
2. **🟢 GREEN**: Write the minimum amount of code necessary to make the test pass.
3. **🔵 REFACTOR**: Clean up the code while ensuring all tests still pass.

---

## Testing Stack
- **Test Runner**: [Vitest](https://vitest.dev/)
- **Component Testing**: [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/)
- **DOM Utilities**: `@testing-library/jest-dom`
- **Environment**: `jsdom`
- **Mocking**: Vitest's built-in mocking utilities (`vi.mock`, `vi.fn`).

---

## Workflow for AI Assistant

When asked to implement a feature or fix a bug, you MUST follow these steps:

1. **Analyze Requirements**: Understand the expected behavior and edge cases.
2. **Identify/Create Test File**: Locate or create the corresponding `.test.ts` or `.test.tsx` file (located in the same directory as the source file).
3. **Write the Test First**: Provide the code for the failing test. Ensure it fails for the right reason (e.g., function not defined, element not found).
4. **Verify Failure**: Run the test and confirm it fails.
5. **Implement Source Code**: Provide the implementation that satisfies the test. Do not over-engineer; only write what's needed to pass.
6. **Confirm Success**: Run the tests again to ensure they pass.
7. **Refactor**: Review the code for readability, performance, and best practices. Ensure tests still pass after refactoring.

---

## Writing Effective Tests

### Unit Tests (`.test.ts`)
- Focus on pure functions and business logic.
- Use descriptive `it` or `test` blocks (e.g., `it('should return true when flag is enabled', () => { ... })`).
- Keep tests isolated. Use Vitest's lifecycle hooks (`beforeEach`, `afterEach`) to reset state.

### Component Tests (`.test.tsx`)
- Focus on what the user sees and interacts with.
- Use queries like `screen.getByRole`, `screen.getByLabelText`, and `screen.getByText`.
- Use `@testing-library/user-event` for simulating browser interactions instead of `fireEvent`.
- Mock external services or heavy dependencies to keep tests fast and deterministic.

---

## Running Tests
- `pnpm test`: Run all tests in the project.
- `pnpm test:watch`: Run tests in watch mode (recommended during active development).
- `vitest related ./file.ts`: Run tests related to a specific file.
