# Queer Atlas homepage measurement plan

## Goal

Measure whether the homepage helps a visitor understand Queer Atlas, begin discovery, and return as a member. Homepage changes should be evaluated against behavior, not pageviews alone.

## Primary funnel

1. `home_viewed`
2. `home_section_viewed`
3. `home_action_selected` or `home_search_submitted`
4. `home_search_result_opened` or `home_member_prompt_opened`
5. `signup_completed`

## Event dictionary

| Event | Meaning | Safe properties |
| --- | --- | --- |
| `home_viewed` | One homepage view per browser session | `member_status` |
| `home_section_viewed` | At least 30% of a measured section entered the viewport | `section`, `member_status` |
| `home_action_selected` | A discovery, live, community, editorial, or intelligence action was selected | `action`, `destination`, `city`, `member_status` |
| `home_city_focus_changed` | The visitor manually changed the local city | `city` |
| `home_search_submitted` | Search was submitted from the hero | `source`, `query_length`, `result_count` |
| `home_search_result_opened` | An instant search result was opened | `city`, `target_type`, `target_id`, `position` |
| `home_member_prompt_opened` | Member access was opened | `source`, `mode`, `destination` |
| `home_member_mode_selected` | Sign-in or account creation was selected | `mode` |
| `home_member_prompt_closed` | Member access was dismissed | `reason`, `mode` |
| `home_contact_started` | A support or partnership form was opened | `intent` |
| `home_contact_submitted` | A contact form was successfully submitted | `intent`, `category` |
| `signup_completed` | Registration completed through an existing auth flow | Existing safe properties |

Search phrases, message text, names, email addresses, and member identifiers are not sent to centralized analytics.

## Decision metrics

- Discovery start rate = visitors with `home_action_selected` or `home_search_submitted` / `home_viewed`.
- Search success rate = `home_search_result_opened` / `home_search_submitted`.
- Member intent rate = `home_member_prompt_opened` / `home_viewed`.
- Signup completion rate = `signup_completed` / `home_member_prompt_opened`.
- Section reach = each section's `home_section_viewed` / `home_viewed`.
- Contact completion rate = `home_contact_submitted` / `home_contact_started`.

## Iteration cadence

1. Collect a 14-day baseline after deployment.
2. Compare mobile and desktop where the analytics interface allows segmentation.
3. Identify the largest meaningful funnel drop, not merely the least-viewed section.
4. Change one message, CTA, or ordering decision at a time.
5. Run the variant for at least 14 days or until traffic is sufficient for a stable comparison.
6. Keep the change only when the primary metric improves without harming signup completion or useful downstream actions.

Use Vercel Web Analytics custom events as the shared production source. The local KPI buffer remains a best-effort diagnostic fallback and must not be treated as site-wide traffic.
