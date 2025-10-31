#!/bin/sh

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Only run this check on the ui-locked branch
if [ "$CURRENT_BRANCH" = "ui-locked" ]; then
  # Check for changes in UI directories
  UI_CHANGES=$(git diff --cached --name-only | grep -E 'src/react-app/(pages|components)/')
  
  if [ ! -z "$UI_CHANGES" ]; then
    echo "❌ Error: Direct UI changes are not allowed in the 'ui-locked' branch."
    echo "Please switch to a feature branch (e.g., dev/api, dev/auth, dev/backend) to make UI changes."
    echo "Affected files:"
    echo "$UI_CHANGES"
    exit 1
  fi
fi

exit 0
