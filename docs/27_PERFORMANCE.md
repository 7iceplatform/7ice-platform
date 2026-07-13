# Performance and Reliability

## Targets

Performance is a user-facing commitment measured with representative tenant data, network conditions, and devices. Each service and journey owns service-level objectives (SLOs), error budgets, and performance budgets; target values are agreed per product tier and recorded with the relevant feature.

## Engineering practices

- Define budgets for initial render, interaction responsiveness, API latency, background-job lag, and media weight before implementation.
- Instrument real-user and synthetic signals with tenant-safe dimensions, tracing critical API paths and queue delay.
- Cache deliberately with owner, key scope, TTL, invalidation strategy, and stale-data behavior; never allow cross-tenant cache reuse.
- Protect dependencies with timeouts, bounded retries, circuit breaking, bulkheads, and graceful degraded experiences.
- Load-test state transitions, exports, integration spikes, and high-cardinality reporting using safe synthetic data.

## Reliability response

An SLO breach triggers investigation, mitigation, customer-impact assessment, and priority adjustment according to the error budget policy. Post-incident work includes a measurable prevention action. Capacity, disaster recovery, and rollback procedures are verified under [Deployment](./32_DEPLOYMENT.md); client techniques are in [Frontend](./09_FRONTEND.md) and API practices in [Backend](./10_BACKEND.md).
