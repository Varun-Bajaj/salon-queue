# prompts.md — All prompts used in this project

## Step 1 — Setup
Read AGENTS.md and all of docs/. Summarise the app in 8 bullets and list questions. Then set up the project with empty pages for all 7 screens, the theme, and the EN/GU toggle.

## Step 2 — Home + Join Queue
Build Screen 1 (Home) and Screen 2 (Join Queue) from docs/02-screens.md with dummy services and barbers. Validate phone numbers and the 3-service limit.

## Step 3 — My Status
After Confirm, give a token (S-1, S-2…) and open My Status. Show position and estimated wait using the rule in docs/03-flows-rules.md. Add the 'Start coming' and 'It's your turn' states.

## Step 4 — Reception Dashboard
Build the Reception Dashboard. Customers who join from a phone must appear automatically. Call next must follow the barber-preference rules exactly.

## Step 5 — Barber View + TV
Build Barber View (Screen 5) and the Waiting Area TV (Screen 6). Start/Done and On break must update Reception, TV and the customer's phone within 5 seconds.

## Step 6 — Owner Settings
Build Screen 7. Turning off a service hides it from Join; closing the queue disables online joining with a clear message. Add today's stats cards.

## Step 7 — Rules, edge cases, polish
Implement the no-show, cancel and barber-on-break rules from docs/03-flows-rules.md. Add friendly empty states, e.g. 'No one waiting — walk right in!'. Check every screen in Gujarati.

## Step 8 — Deploy
Prepare this app for deployment: frontend on Vercel. Put the live link at the very top of README.md.
