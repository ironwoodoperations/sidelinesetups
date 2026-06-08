# RLS Audit — Sideline Setups (PR 3 Part B)

**Status:** Audit only. **No RLS policy, migration, or table was modified in this PR.**
This report exists to give Scott the facts to decide whether fixes land here, in a
follow-up (PR 3b), or are deferred. Every "fix" line below is the change that *would*
be applied — none of it was applied.

**Scope:** all 18 tables, read from `supabase/migrations/*` (14 migration files).

---

## BOTTOM LINE (read this first)

**The schema's server-side security is NOT sound. There are real, unauthenticated holes.**

PR 2 made admin a **client-side UI gate only** and explicitly deferred server-side
enforcement to "PR 3 / RLS." This audit is that check, and the answer to the central
question is unambiguous:

> **No — RLS does not enforce the employee/admin role on any admin-managed table.**

Every "admin-managed" table (events, packages, parks, fields, spots, equipment, add_ons,
discount_codes, faq_items, site_settings, sms_templates, sms_auto_rules, sms_logs,
employees) ships write policies of the form `USING (true) / WITH CHECK (true)` granted to
the `public` role. `public` in Postgres RLS **includes the anonymous (`anon`) role**, and
the `anon` publishable key is shipped in the browser bundle by design. So the gate is not
"a logged-in customer can bypass the UI" — it's **anyone on the internet with the public
key can read and write these tables directly**, no account required. The PR 2 UI gate is
cosmetic.

**Counts:** Critical **2** · High **7** · Medium **7** · Low **1** · OK **1** (18 total).

**Single most serious finding:** the **`employees`** table is **world-readable and
world-writable**. Its `pin` column is the *only* credential behind both the admin gate
(PR 2) and the staff gate (PR 3 Part A). Anyone can read every PIN, and anyone can `UPDATE`
any employee row to set `role = 'owner'` or change a PIN. This single hole defeats both
auth gates by itself — no PIN guessing required.

**Architectural root cause (why this needs human design, not a quick patch):** employees
are **not** `auth.users` — they authenticate by PIN with no Supabase JWT. RLS therefore
*cannot* reference an employee's role via `auth.uid()` / `auth.jwt()`. Closing these holes
is a design decision, not a one-line policy swap. Two viable directions:
- **(A)** Move every privileged read/write behind Edge Functions that verify the PIN/role
  server-side and use the `service_role` key; lock the tables to `service_role` only.
- **(B)** Issue real Supabase sessions to employees and add a
  `SECURITY DEFINER is_employee_admin()` helper that RLS policies call.

That choice is Scott's. **No fix is applied here.**

---

## Findings by severity

### 🔴 CRITICAL

#### 1. `employees` — world-readable + world-writable (credential exposure + privilege escalation)
- **RLS:** enabled.
- **Policies** (migration `…060537`/`…043528`): `SELECT USING (true)`, `INSERT WITH CHECK (true)`,
  `UPDATE USING (true)`, `DELETE USING (true)` — all to `public`.
- **Impact:** `pin` (the sole admin/staff credential), plus name/email/phone, are readable by
  anyone with the anon key. Anyone can `UPDATE` their own/any row to `role='owner'`, change
  any PIN, or insert a new admin. Defeats the PR 2 admin gate **and** the PR 3 staff gate.
- **Would-fix:** revoke all `public` access; restrict `employees` to `service_role`, never
  expose `pin` to the client, and authenticate PIN via an Edge Function.

#### 2. `bookings` — all customer PII world-readable + arbitrary writes
- **RLS:** enabled.
- **Policies:** `SELECT USING (true)` ("Bookings are publicly readable"),
  `INSERT WITH CHECK (true)`, `UPDATE USING (true)`. No `DELETE` policy. `user_id` column
  exists but **no policy references it**.
- **Impact:** every customer's `full_name`, `contact_email`, `phone`, `id_photo_url`,
  payment refs (`square_payment_id`, `paypal_order_id`) are readable by anyone. Anyone can
  `UPDATE` any booking — flip status, alter totals, overwrite payment fields.
- **Would-fix:** scope `SELECT`/`UPDATE` to `user_id = auth.uid()` OR a verified employee;
  keep guest `INSERT` (with tightened `WITH CHECK`).

### 🟠 HIGH

#### 3. `sms_logs` — phone/message leak + injectable send queue
- `SELECT/INSERT/UPDATE` all `USING (true)` to `public` (migration `…053151`).
- **Impact:** customer phone numbers + message bodies world-readable. Anyone can `INSERT`
  a row with `status='queued'`; **if the `process-sms-queue` function sends queued rows
  without re-validation, this is attacker-controlled SMS to arbitrary numbers on the
  business's provider account — toll fraud / brand-phishing (escalates to Critical).**
- **Would-fix:** remove `public` read/insert; only the `SECURITY DEFINER` status trigger and
  `service_role` may write/read. (Verify the queue processor independently.)

#### 4. `site_settings` — world-writable business/payment config
- `SELECT/INSERT/UPDATE` `USING (true)` to `public`; no `DELETE`.
- **Impact:** anyone can rewrite `tax_rate_percent`, `service_fee_cents`, `square_app_id`,
  `square_location_id`, `square_environment`, `paypal_mode` — i.e. tamper with payment
  routing and pricing math for every checkout.
- **Would-fix:** `SELECT` may stay public (read-only brand/hero fields); gate all writes
  behind verified employee / `service_role`.

#### 5. `discount_codes` — anyone can mint or read codes
- `SELECT/INSERT/UPDATE/DELETE` `USING (true)` to `public`.
- **Impact:** anyone can read all codes or create a `100% / fixed` code → direct revenue loss.
- **Would-fix:** writes behind verified employee; reconsider public `SELECT` (validate codes
  server-side at checkout rather than exposing the table).

#### 6. `packages` — world-writable pricing
- `SELECT` public (intended) but `INSERT/UPDATE/DELETE` `USING (true)`.
- **Impact:** anyone can rewrite `per_game_usd` / `per_day_usd` / `full_weekend_usd` →
  revenue tampering / fraudulent low prices.
- **Would-fix:** keep public `SELECT`; gate writes behind verified employee.

#### 7. `add_ons` — world-writable pricing
- Same shape as packages; `per_*_usd` fields editable by anyone.
- **Would-fix:** keep public `SELECT`; gate writes behind verified employee.

#### 8. `sms_templates` — world-writable outbound message bodies
- `SELECT/INSERT/UPDATE/DELETE` `USING (true)`.
- **Impact:** the `body` of these templates is what gets sent to real customer phones on
  booking status changes — an attacker can rewrite them into phishing/abuse sent under the
  business's name.
- **Would-fix:** writes behind verified employee / `service_role`.

#### 9. `sms_auto_rules` — world-writable send triggers
- `SELECT/INSERT/UPDATE/DELETE` `USING (true)`.
- **Impact:** controls which template fires on which status → an attacker can wire arbitrary
  templates to fire, amplifying #8.
- **Would-fix:** writes behind verified employee / `service_role`.

### 🟡 MEDIUM

#### 10–13. `events`, `parks`, `fields`, `spots` — world-writable catalog/integrity
- Each: public `SELECT` (intended) + `INSERT/UPDATE/DELETE` `USING (true)` (migration `…043528`).
- **Impact:** anyone can deface or delete the event/venue catalog (availability/integrity).
  Lower $ impact than pricing tables but still unauthenticated tamper.
- **Would-fix:** keep public `SELECT`; gate writes behind verified employee.

#### 14. `equipment` — world-writable inventory & COGS
- Public `SELECT` + open writes. Anyone can alter quantities / `cogs_per_use_usd`.
- **Would-fix:** keep public `SELECT`; gate writes behind verified employee.

#### 15. `locks` — anyone can create locks (booking DoS)
- `SELECT USING (true)`, `INSERT WITH CHECK (true)`; no `UPDATE`/`DELETE`.
- **Impact:** anyone can flood `locks` to make spots appear unavailable; no release path via
  client. Availability risk, not a data leak.
- **Would-fix:** create/expire locks via a `SECURITY DEFINER` function with expiry, not open
  client `INSERT`.

#### 16. `reviews` — anyone can delete any review
- `SELECT USING (true)` (intended public reviews). `INSERT`/`UPDATE` are **correctly** scoped
  to `authenticated` + `auth.uid() = user_id`. But `DELETE USING (true)` to `public`
  (migration `…054202`).
- **Impact:** anyone can delete any review (censorship/integrity). Note: no validation that
  the reviewer actually has a matching booking.
- **Would-fix:** scope `DELETE` to `auth.uid() = user_id` (and/or verified employee).

### 🟢 LOW

#### 17. `faq_items` — world-writable low-sensitivity content
- Public `SELECT` (intended) + open `INSERT/UPDATE/DELETE`.
- **Impact:** content defacement only; no PII, no money.
- **Would-fix:** gate writes behind verified employee.

### ✅ OK

#### 18. `profiles` — correctly scoped per customer
- `SELECT/INSERT/UPDATE` all `TO authenticated` with `auth.uid() = id` (migration `…050918`).
- **No cross-customer leak.** A customer can read/write only their own row. Minor note: there
  is no `DELETE` policy (customers cannot delete their own profile) — a product nit, not a
  security hole. Loyalty-point writes go through `increment_loyalty_points` (`SECURITY DEFINER`),
  which is appropriate.

---

## Answers to the audit's specific questions

- **Q1 (RLS enabled?):** Yes on all 18 tables. The problem is policy *content*, not missing RLS.
- **Q2 (what do policies check?):** For 13 admin-managed tables + `employees` + `bookings`,
  writes check **nothing** (`USING (true)`). Only `profiles` (and `reviews` INSERT/UPDATE)
  perform real `auth.uid()` ownership checks.
- **Q3 (is admin/owner enforced server-side?):** **No.** No policy, helper function, or JWT
  claim references the `employees` role. The UI gate is the only "enforcement," and it is
  client-side. A customer — or any anon key holder — can write directly to Supabase.
- **Q4 (customer-data tables):** `profiles` = correctly per-customer scoped (OK).
  `bookings` = **not** scoped; every booking is world-readable and world-writable (Critical).
- **Q5 (RLS disabled / overly permissive):** RLS is enabled everywhere, but **16 of 18 tables
  carry overly-permissive `USING (true)` write policies**; `employees` and `bookings`
  additionally leak on read.

---

## Bottom line (restated)

**Not sound.** Server-side security for staff/admin-managed data is effectively absent: the
UI gate hardened in PR 2 and PR 3 Part A is cosmetic against direct Supabase access. The most
serious single hole is the **world-readable, world-writable `employees` table**, which leaks
every PIN and lets anyone self-promote to `owner`. Fixing this is a design decision (move
privileged operations to `service_role` Edge Functions, or give employees real Supabase
sessions + an `is_employee_admin()` helper) and should be scoped deliberately — hence this
PR reports and stops rather than patching.
