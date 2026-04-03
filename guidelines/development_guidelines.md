# Development Guidelines for Easy-Flags

## Architecture Overview

This project follows **Hexagonal Architecture** principles to separate business logic from infrastructure and UI concerns, ensuring maintainability and testability.

### Layer Directory Structure

- **`src/domain/`**: Core business logic. Contains entities, value objects, and repository interfaces. Must remain pure and free from framework-specific code.
- **`src/application/`**: Use cases and application-specific business rules. Orchestrates interactions between the domain and infrastructure layers.
- **`src/infrastructure/`**: Implementation of domain interfaces (e.g., database repositories using LibSQL), API clients, and external service adapters.
- **`src/components/`**: Shared and feature-specific React components. Use these for high interactivity.
- **`src/pages/`**: [Astro Pages](https://docs.astro.build/en/basics/astro-pages/) for routing and server-side rendering logic.
- **`src/layouts/`**: [Astro Layouts](https://docs.astro.build/en/basics/layouts/) to define common shell structures for the application.

---

## Coding Standards & Conventions

### Language & Tooling

- **TypeScript**: Use strictly typed TypeScript. Avoid `any` unless absolutely necessary.
- **React Components**: Use functional components with Hooks.
- **ESM**: Use ECMAScript Modules (`import`/`export`) for all modules.
- **PNPM**: Use `pnpm` for all dependency management.

### Naming Conventions

- **Directories & Files**: `kebab-case` (e.g., `feature-flags/flag-list.tsx`).
- **React Components**: `PascalCase` matching the file name.
- **Variables & Functions**: `camelCase`.
- **Types & Interfaces**: `PascalCase`.
- **Constants**: `UPPER_SNAKE_CASE`.

### Styling (Tailwind CSS v4)

- **Framework**: Use Tailwind CSS v4 via its Vite integration.
- **Approach**: Prefer utility classes over custom CSS. Use responsive prefixes for mobile-first design.
- **Dynamic Classes**: Avoid string interpolation for dynamic class names that Tailwind needs to purge; use complete class names (e.g., `isActive ? 'bg-blue-500' : 'bg-gray-500'`).

---

## Astro & React Integration

- **Default SSR**: Leverage Astro's default Server-Side Rendering for SEO and performance.
- **Hydration**: Use [Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives) (`client:load`, `client:visible`) only when interaction is required.
- **Server Islands**: Consider using Astro server islands for components that don't need heavy client-side hydration but require dynamic server data.

---

## Data Management & Infrastructure

### Database (LibSQL / SQLite)

- **Migrations**: All schema changes must be implemented via the CLI scripts:
  - `pnpm migration:create <name>`: To create a new SQL migration.
  - `pnpm db:migrate`: To apply migrations locally.
- **Persistence**: Database access should only happen within the `infrastructure` layer.

### Environment Management

- Use `.env` for local configuration.
- Never commit secrets to the repository; use `.env.example` as a template.
- Access variables via standard Vite/Astro patterns (`import.meta.env`).

---

## Quality Assurance & Workflow

- **TDD (Test-Driven Development)**: Follow the [TDD Guidelines](./tdd_guidelines.md) for every new feature or bug fix.
- **Linting & Formatting**: Ensure code adheres to Prettier/ESLint rules.
- **Type Checking**: Regularly run `pnpm type-check` to catch potential issues early.
- **Documentation**: Keep the `docs/` folder Updated. Every significant change should reflect in the relevant Markdown documentation.

---

## Role of the AI Assistant

When collaborating on this project:

1. Always check the **Architecture** before adding new files to ensure they are in the correct layer.
2. Prioritize **testability** and **separation of concerns**.
3. If a change involves a database schema change, remind the user to create a migration.
4. Ensure all new UI components are responsive and use Tailwind v4 conventions.
