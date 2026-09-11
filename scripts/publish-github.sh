#!/usr/bin/env bash
# Run locally from the source folder. Creates a NEW PUBLIC repo; never overwrites one.
set -euo pipefail
cd "$(dirname "$0")/.."
for command in git gh; do command -v "$command" >/dev/null || { echo "Install $command first. GitHub CLI: https://cli.github.com" >&2; exit 1; }; done
gh auth status >/dev/null 2>&1 || { echo 'Authenticate first: gh auth login' >&2; exit 1; }
owner="$(gh api user --jq .login)"
name="${1:-tracecraft}"
[[ "$name" =~ ^[A-Za-z0-9._-]+$ ]] || { echo 'Invalid repository name.' >&2; exit 1; }
repo="$owner/$name"
# Never inherit a parent worktree and accidentally publish unrelated history.
if top="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  [[ "$(cd "$top" && pwd -P)" == "$(pwd -P)" ]] || { echo "This folder is inside another Git repository. Move it outside that worktree before publishing." >&2; exit 1; }
fi
if gh repo view "$repo" >/dev/null 2>&1; then echo "$repo already exists. Stopping without changing it." >&2; exit 1; fi
if git remote get-url origin >/dev/null 2>&1; then echo 'An origin remote already exists. Stopping to avoid publishing the wrong project.' >&2; exit 1; fi
if find . -maxdepth 1 -type f -name '.env*' ! -name '.env.example' | grep -q .; then echo 'Remove private .env files from this folder before public publication.' >&2; exit 1; fi
node --check src/app.mjs
npm test
npm run build
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git init -b main; fi
# Keep generated previews, personal progress, credentials, and runtime outputs out of Git.
git add .gitignore package.json index.html src scripts tests docs README.md LICENSE CONTRIBUTING.md SECURITY.md AGENTS.md .github public
git diff --cached --quiet || git commit -m 'Start TraceCraft: visual learning alpha and research roadmap'
gh repo create "$repo" --public --source=. --remote=origin --push --description 'Visual coding, systems concepts, and interview practice. Original lessons. Local-first alpha.'
echo "Published: https://github.com/$repo"
echo 'No paid hosting or AI service was provisioned. Review Actions/Pages settings before deployment.'
