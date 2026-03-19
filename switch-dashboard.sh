#!/bin/bash

# Dashboard Switcher Script
# Usage: ./switch-dashboard.sh [new|old]

case "$1" in
  new)
    echo "🔄 Switching to NEW Dashboard (Placement Command Center)..."
    cp frontend/src/pages/DashboardPageNew.tsx frontend/src/pages/DashboardPage.tsx
    echo "✅ New Dashboard activated!"
    echo "📝 To undo: ./switch-dashboard.sh old"
    ;;
  old)
    echo "🔄 Restoring OLD Dashboard..."
    cp frontend/src/pages/DashboardPage.backup.tsx frontend/src/pages/DashboardPage.tsx
    echo "✅ Original Dashboard restored!"
    echo "📝 To use new: ./switch-dashboard.sh new"
    ;;
  *)
    echo "Usage: ./switch-dashboard.sh [new|old]"
    echo ""
    echo "Commands:"
    echo "  new  - Switch to new Placement Command Center design"
    echo "  old  - Restore original dashboard"
    exit 1
    ;;
esac
