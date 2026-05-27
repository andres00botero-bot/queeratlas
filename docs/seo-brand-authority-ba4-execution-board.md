# QueerAtlas BA4: Execution Board + KPI Tracker Operating System

## Objective
- Turn BA3 outreach into a repeatable operating system with clear ownership, SLAs, and measurable outcomes.
- Increase citation quality, not only mention volume.

## Success Criteria (30 days)
- Minimum 40 qualified outreach sends.
- Minimum 12 responses.
- Minimum 6 published mentions or links.
- Minimum 4 mentions from P1 targets.
- Average first response time under 5 days.

## Team Roles
- Outreach Lead: owns daily execution and target prioritization.
- Content Lead: owns report URL quality, proof snippets, and FAQ precision.
- QA Lead: validates link quality, anchor text, and citation context.
- Growth Lead: owns social distribution and community amplification.

## Weekly Cadence
1. Monday: target selection + pitch personalization (batch plan).
2. Tuesday-Wednesday: send wave (P1 first, then P2).
3. Thursday: follow-ups and reply handling.
4. Friday: KPI review, wins/losses log, next-week adjustments.

## Pipeline Stages
1. `candidate`: target identified, not prepared.
2. `ready_to_pitch`: target researched, personalized angle prepared.
3. `sent`: first outreach sent.
4. `followup_1`: first follow-up sent.
5. `followup_2`: second follow-up sent.
6. `replied`: target responded.
7. `published`: mention/link is live.
8. `closed_lost`: no response or declined.

## SLAs
- First follow-up: 72 hours after first send.
- Second follow-up: 5 days after follow-up #1.
- Reply handling: same day, max 24h.
- Published-link QA: within 24h of publication.

## KPI Definitions
- Outreach Volume: count of unique `sent` rows in date range.
- Response Rate: `replied / sent`.
- Publish Rate: `published / sent`.
- P1 Publish Rate: `published_from_p1 / sent_to_p1`.
- Citation Quality Score (CQS): weighted score:
  - Follow link on indexable page: +40
  - Brand mention with linkless citation: +20
  - Contextual placement in core article body: +20
  - Exact report URL used (not homepage only): +20
  - Maximum 100 per published item

## Decision Rules (Stop/Go)
- If response rate < 15% for 2 consecutive weeks:
  - Pause low-performing template.
  - Replace with alternate hook angle within 24h.
- If P1 publish rate < 10%:
  - Re-prioritize toward highest-engagement vertical.
  - Add one data-led mini insight per pitch.
- If CQS average < 60:
  - QA reject weak placements and request correction.

## Weekly Review Template
1. What got published (with URLs)?
2. Which hook angle performed best?
3. Which target segment underperformed?
4. Which template needs revision?
5. What is next week priority list (top 10)?

## Required Fields (Tracker Contract)
- `week_id`
- `target_name`
- `target_tier` (P1/P2/P3)
- `target_type`
- `contact_url`
- `owner`
- `pitch_template`
- `hook_angle`
- `primary_report_url`
- `supporting_city_or_topic_url`
- `stage`
- `sent_at`
- `followup_1_at`
- `followup_2_at`
- `replied_at`
- `published_at`
- `published_url`
- `link_type` (follow/nofollow/mention-only/unknown)
- `anchor_text`
- `cqs`
- `notes`

## Guardrails
- No fabricated wins: published URL must be verifiable.
- No duplicate outreach to same contact within same week.
- No generic mass mail: each row must include a personalized `hook_angle`.
- If source is low trust, label outcome as `unverified` until QA confirms.

## 14-Day BA4 Launch Plan
1. Day 1: initialize tracker, assign owners, load BA3 20 targets.
2. Day 2-3: complete personalization for P1 targets.
3. Day 4-5: send wave #1 + log in tracker.
4. Day 6-7: follow-up #1 + process replies.
5. Day 8-10: send wave #2 (P2/P3) + QA check published links.
6. Day 11-14: follow-up #2 + KPI review + template iteration.

