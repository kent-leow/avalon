---
applyTo: '**'
---
# Git Instructions

## Branching
- Use feature branches for all new work: `feature/<short-description>`.
- Use bugfix branches for fixes: `bugfix/<short-description>`.
- Do not commit directly to `main`.

## Commits
- Write clear, concise commit messages in imperative mood (e.g., "Add login page").
- Use conventional commits if possible (e.g., `feat:`, `fix:`, `chore:`).
- Reference related issues in commit messages when applicable.

## Pull Requests
- Open a pull request for every change; do not merge without review.
- Ensure all checks (lint, tests, build) pass before merging.
- Rebase or squash commits before merging to keep history clean.
- Use draft PRs for work in progress.

## CI/CD
- Ensure CI/CD pipeline runs on every push and PR.
- Do not merge if the pipeline fails.
- Review pipeline logs for errors and fix before merging.
