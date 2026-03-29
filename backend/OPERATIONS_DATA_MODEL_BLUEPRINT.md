# Operations Data Model Blueprint (Backend)

This blueprint defines a scalable target schema for Commercial Operations.
It is designed for real business operations, with normalized entities,
status timelines, immutable events, and analytics-ready daily facts.

## Core entities

1. `OpsZone` - geographic hierarchy and management slices
2. `OpsOutletCategory` - normalized outlet classification
3. `OpsOutlet` - outlet master table
4. `OpsOutletAssignment` - historical outlet-manager assignment
5. `OpsRoutePlan` - reusable route definition
6. `OpsRoutePlanStop` - ordered planned stops
7. `OpsRouteRun` - per-day route execution
8. `OpsRouteRunStop` - materialized run stops
9. `OpsShift` - attendance and shift lifecycle
10. `OpsLocationPing` - near-live GPS feed
11. `OpsVisit` - visit proof and adherence flags
12. `OpsIncident` - field observations/issues
13. `OpsServiceTicket` - internal service request lifecycle
14. `OpsViolationCase` - compliance case and penalty workflow
15. `OpsAttachment` - reusable evidence storage
16. `OpsStatusHistory` - normalized status timeline
17. `OpsAuditEvent` - immutable event/audit ledger
18. `OpsDailyKPI` - denormalized daily management facts

## Normalization decisions

- Master entities are separated from execution entities:
  - Outlet master vs route plan vs route run vs visit
- Status changes are historical, not overwritten:
  - `OpsStatusHistory`
- Evidence is normalized and reusable across domains:
  - `OpsAttachment` with `domain + object_id`
- Management assignment is historical and queryable:
  - `OpsOutletAssignment` with effective dating

## Audit/history strategy

- Every critical action should generate an immutable `OpsAuditEvent`
- All major status transitions should write `OpsStatusHistory`
- Use event payload for extensibility and analytics enrichment

## Analytics-ready data captured now

- planned/completed/skipped visits
- route adherence percentage
- visit duration metrics
- ticket and violation volume by day/zone
- event timestamps with actor/outlet/agent context

## Files

- `backend/apps/operations_blueprint/models.py`
- `backend/apps/operations_blueprint/apps.py`

