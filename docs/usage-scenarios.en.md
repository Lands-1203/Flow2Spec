[中文](./Flow2Spec-使用案例-模拟对话.md) | [English](./usage-scenarios.en.md)

# Flow2Spec Usage Scenarios (Simulated Dialogues)

The following examples revolve around the same e-commerce project, covering the full pipeline from requirements clarification through post-launch maintenance.

**Prerequisite**: The project has executed `flow2spec init`, and `flow2spec.config.json` uses the default configuration (`subAgent: false`). `f2s-*` skills do not modify the configuration root `rules/` or `skills/` files.

---

## Scenario 1: New Requirement -> Clarification -> Technical Design

**You**

> /f2s-req-clarify The product team provided a refund requirement doc, but it does not specify whether partial refunds and full refunds go through the same API, or whether points should be reversed after a successful refund. The document is at `.Knowledge/req-docs/refund-requirements-v1.md`.

**Agent**

> I have read the requirements document. There are a few points that need clarification:
>
> 1. Do partial refunds and full refunds reuse the same endpoint, differentiated by the `amount` field, or should they be two separate endpoints?
> 2. Should points be reversed after a successful refund? If the reversal fails, should it block the refund flow?
> 3. Is the refund processed synchronously or asynchronously (T+1)?
> 4. Is there a seller-side review step?

**You**

> 1. Same endpoint, differentiated by amount; 2. Points are reversed; failure does not block the flow, retry asynchronously; 3. Asynchronous T+1; 4. No review needed.

**Agent**

> Clarification complete. Run `/f2s-req-backend` to produce the technical design.

**You**

> /f2s-req-backend

**Agent**

> Generated `.Knowledge/req-docs/refund-tech-design.md`, which includes:
> - API design: `POST /refunds`, `amount` field distinguishes full / partial refunds
> - State machine: `PENDING -> SUCCESS / FAILED`
> - Points reversal: asynchronous queue, failures go to dead letter queue, alert for manual handling
> - Error code list
>
> Next step: say "implement according to `.Knowledge/req-docs/refund-tech-design.md`" to trigger coding.

---

## Scenario 2: Architectural Documentation into Knowledge Base

**You**

> /f2s-doc-arch Help me draft an order service architecture document, focusing on the creation flow, payment callback, idempotency, and message delivery. The code is in `src/order` and `src/payment`.

**Agent**

> Scanned the relevant directories. Generated `.Knowledge/stock-docs/order-service-architecture-draft.md`, which includes:
> - Module boundaries and dependencies
> - Creation flow sequence diagram
> - Payment callback idempotency mechanism (based on the `payment_callback_log` table)
> - Message delivery retry strategy
>
> Confirm it looks good, then run `/f2s-doc-final` to normalize the format.

**You**

> /f2s-doc-final .Knowledge/stock-docs/order-service-architecture-draft.md

**Agent**

> Generated `.Knowledge/stock-docs/order-service-architecture-final.md`, formatted according to the final-draft template, with placeholders for items still to be filled in.

**You**

> f2s-ctx-build .Knowledge/stock-docs/order-service-architecture-final.md

**Agent**

> Knowledge base sync complete:
> - Added `.Knowledge/topics/order-service.md`
> - Updated `.Knowledge/manifest-routing.json` (added routing rule)
> - Generated `.Knowledge/matchers/order-service.json` (keywords: order creation, payment callback, idempotency, message delivery)
> - Updated `.Knowledge/index.md`
>
> Future tasks related to the order service will automatically hit this topic.

---

## Scenario 3: Implementation from Technical Design

**You**

> Implement according to `.Knowledge/req-docs/refund-tech-design.md`. Only modify `src/refund/`; do not touch the payment module.

**Agent**

> I have read the design document. Task list for implementation:
>
> 1. Create `RefundController` with `POST /refunds`
> 2. Create `RefundService` with state machine transition logic
> 3. Create `RefundRepository` for the `refund` table
> 4. Create `PointRollbackProducer` to send rollback messages to the points queue
> 5. Unit tests covering state machine transitions
>
> Before proceeding, I need to confirm:
> - Does the `refund` table already exist, or do I need to generate a migration?
> - What is the points queue topic name?

**You**

> The table already exists; no migration needed. The topic is `point-rollback-events`.

**Agent**

> Completed all 5 tasks above, all within `src/refund/`. Did not touch `src/payment/`.
>
> **Requires manual action**:
> - Consumer side for `point-rollback-events` (on the points service side)
> - Dead letter monitoring and alerting rule configuration
>
> Recommend running `/f2s-kb-feat` to sync this new capability into the knowledge base.

---

## Scenario 4: PDF Design -> Implementation

**You**

> /f2s-doc-pdf /Users/me/Downloads/marketing-coupon-v2.pdf

**Agent**

> Converted and saved as `.Knowledge/req-docs/marketing-coupon-v2.md`. Filled in the idempotency handling flow description and error code explanations that were missing in the PDF.

**You**

> Implement according to `.Knowledge/req-docs/marketing-coupon-v2.md`

**Agent**

> I have read the design document. Task list for implementation:
>
> 1. Create `CouponController` (coupon claim, redemption, and return endpoints)
> 2. Create `CouponService` with inventory deduction and idempotency checks
> 3. ...
>
> Before proceeding, I need to confirm: is the coupon inventory managed via Redis or database row locks?

---

## Scenario 5: Post-Implementation Knowledge Base Recording

**You**

> /f2s-kb-sync The refund feature has gone live. Help me record the payment failure retry queue naming, dead letter table fields, and monitoring alerting criteria into the knowledge base. Give me an outline first so I can confirm before you write.

**Agent**

> Knowledge base update outline (pending confirmation):
>
> **Update topic**: `order-service` (already exists)
>
> - Add "Payment Failure Retry Mechanism": queue name `payment-retry-queue`, max retries 3, intervals 30s / 120s / 300s
> - Add "Dead Letter Table": table name `payment_dead_letter`, fields `order_id / error_code / retry_count / created_at`
> - Add "Monitoring Criteria": alert threshold `retry_count >= 3`, notification channel DingTalk
>
> Confirm to write, or let me know what needs to be changed.

**You**

> Confirm, go ahead and write.

**Agent**

> Updated `.Knowledge/topics/order-service.md`. `manifest-routing` unchanged (topic already exists).

---

## Scenario 6: Non-compliant Implementation Found, Fix and Sync Knowledge Base

**You**

> /f2s-kb-fix `RefundService` directly calls `new RestTemplate()`, which violates the Spring Bean injection convention.

**Agent**

> Fixed: Line 34 of `RefundService.java` changed to constructor injection; `RefundConfig` supplemented with `@Bean` declaration.
>
> Knowledge base synced: the "HTTP Client Conventions" section in `.Knowledge/stock-docs/` has been updated, noting that `RestTemplate` must be injected as a Bean, and direct instantiation is prohibited.

---

## Scenario 7: Knowledge Base Conflicts After Git Merge

**You**

> /f2s-kb-merge `.Knowledge/index.md` and `.Knowledge/stock-docs/order-service-architecture-final.md` have conflict markers after the merge. I have already resolved the conflicts in the business code manually.

**Agent**

> Scanned the conflict markers in both files:
>
> - `index.md`: 2 conflicts, both in topic description fields. Took the HEAD version (newer content). Resolved automatically.
> - `order-service-architecture-final.md`: 1 conflict. The "monitoring alert threshold" differs between branches (3 vs. 5). Please confirm which one to keep.

**You**

> Use 3.

**Agent**

> All conflict markers have been cleaned up per your confirmation. The files are ready to commit.

---

## Related Documentation

- [Usage Guide](./usage-guide.en.md)
- [Commands Reference](./commands-reference.en.md)
- [Directory Conventions](./directory-conventions.en.md)
- [Architecture](./architecture.en.md)