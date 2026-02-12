#!/bin/bash

# Voice Agent System Test Runner
# Runs comprehensive integration tests with detailed tracing

set -e

echo "═══════════════════════════════════════════════════════════════════════════"
echo "Voice Agent System Tests"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
TRACE=false
USE_REAL_APIS=false
DEV_SERVER_RUNNING=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --trace)
      TRACE=true
      shift
      ;;
    --real-apis)
      USE_REAL_APIS=true
      shift
      ;;
    --dev-running)
      DEV_SERVER_RUNNING=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: ./run-system-tests.sh [--trace] [--real-apis] [--dev-running]"
      exit 1
      ;;
  esac
done

# Check if dev server is running
if [ "$DEV_SERVER_RUNNING" = false ]; then
  echo -e "${YELLOW}⚠️  Starting development server...${NC}"
  npm run dev > /dev/null 2>&1 &
  DEV_PID=$!
  echo -e "${BLUE}ℹ️  Dev server PID: $DEV_PID${NC}"

  # Wait for server to be ready
  echo -e "${BLUE}ℹ️  Waiting for server to be ready...${NC}"
  sleep 5

  # Check if server is responding
  if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is ready${NC}"
  else
    echo -e "${RED}❌ Dev server failed to start${NC}"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
fi

# Set environment variables
export TRACE=$TRACE
export USE_REAL_APIS=$USE_REAL_APIS
export API_BASE=http://localhost:3000

# Run tests
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Running System Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Tracing: ${TRACE}"
echo -e "  Real APIs: ${USE_REAL_APIS}"
echo -e "  API Base: ${API_BASE}"
echo ""

# Run the tests
if npm test -- __tests__/integration/voiceAgent.system.test.ts; then
  echo ""
  echo -e "${GREEN}✅ All system tests passed!${NC}"
  TEST_RESULT=0
else
  echo ""
  echo -e "${RED}❌ Some tests failed${NC}"
  TEST_RESULT=1
fi

# Stop dev server if we started it
if [ "$DEV_SERVER_RUNNING" = false ]; then
  echo ""
  echo -e "${YELLOW}⚠️  Stopping development server (PID: $DEV_PID)...${NC}"
  kill $DEV_PID 2>/dev/null || true
fi

# Show report location
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Reports${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  JSON: ${GREEN}test-reports/voice-agent-system-report.json${NC}"
echo -e "  Markdown: ${GREEN}test-reports/voice-agent-system-report.md${NC}"
echo ""
echo -e "${BLUE}View reports:${NC}"
echo -e "  cat test-reports/voice-agent-system-report.md"
echo -e "  open test-reports/voice-agent-system-report.md"
echo ""

exit $TEST_RESULT
