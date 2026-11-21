# Reflection — Vibe Coding Lab

## One Thing the Agent Got Wrong & How It Was Resolved

### What Happened
During initial testing of the Join Queue screen (`/join`), mobile browsers and Chrome autofill injected a default light theme (`-internal-light-dark(white, ...)`), causing the text inputs to turn completely white with white text. This made the typed guest name and phone number visually invisible to the user. Additionally, all staff navigation links (Reception, TV Display, Manager Suite) were initially exposed in the same global header as regular customer buttons, which caused confusion between customer actions and staff management workflows.

### How I Noticed It
I tested the live screen on mobile and observed that typing into the input fields yielded blank white boxes where letters were masked by identical background and foreground colors. Furthermore, looking at the layout from a customer's perspective revealed that ordinary guests had immediate access to administrative controls without any security barrier.

### How the Prompt & Code Were Fixed
1. **Input Contrast & Autofill**: Explicit dark styles (`color-scheme: dark !important`, `-webkit-box-shadow: 0 0 0 1000px #121620 inset !important`) and inline dark properties were added to override browser autofill behavior permanently.
2. **Role Separation**: Prompted the agent to create a dedicated **Staff Portal** modal locked behind an authorized PIN (`1234`), cleanly hiding internal dispatch tools (Reception, Stylist HUD, Admin) from the customer experience while keeping them one tap away for salon staff.
3. **Cross-Tab Real-Time Sync**: Leveraged WebSocket broadcasting alongside browser `localStorage` event sync so that phone, tablet, and TV displays update simultaneously without manual refreshes.
