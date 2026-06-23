# Performance Testing

Two approaches available:

## 1. Jest-based load test (no dependencies)

```bash
npx jest --no-coverage src/tests/performance/load.test.js --verbose
```

Runs in-process (mocked DB), tests 3 scenarios:
- **Sequential** — 10 login requests, reports avg/min/max/p50/p95/p99
- **Concurrent** — 10 parallel login requests, measures wall time & throughput
- **Health check baseline** — 10 GET `/api/v1/health` requests

Output is printed via stderr so it shows even when tests pass.

## 2. Artillery (requires real DB)

### Requirements

```bash
npm install -g artillery
```

### Run

```bash
# Basic run
artillery run backend/src/tests/performance/scenario.yml

# With HTML report
artillery run --output report.json backend/src/tests/performance/scenario.yml
artillery report report.json

# With environment variables
BASE_URL=http://localhost:10000/api/v1 artillery run backend/src/tests/performance/scenario.yml
```

### Scenarios

- **Student flow**: Login → profile → attendance → logbooks → placements
- **Coordinator flow**: Login → pending placements → students → supervisors

### Tweaking

Edit `scenario.yml` to adjust:
- `arrivalRate` — users per second
- `duration` — how long each phase runs
- Add more scenarios for admin, supervisor flows
