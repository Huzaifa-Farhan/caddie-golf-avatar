# Caddie: Voice/Text Tee Time Booking Avatar

SOFE4850 (Fall 2026) UX group project. **Caddie** is a conversational avatar on a fictional golf course website (Pine Ridge Golf Club). It books a tee time through **voice or typed text**, with quick-reply buttons as a third option.

> Unofficial student project. The black/silver/red theme is inspired by the Crushers GC / Bryson DeChambeau look. It is not affiliated with or endorsed by LIV Golf or Bryson DeChambeau, and no official logos are used.

**Live prototype:** https://claude.ai/artifact/32cVuror9bai7ManohqiJ8
**Target platform:** mobile-first responsive website (also works on desktop)

## What Caddie collects

Date, tee time, players (1 to 4), holes (9 or 18), cart (riding or walking), club rentals (right, left, or none), name, and phone or email. **No payment details** are requested; payment happens at the pro shop.

## Features mapped to the project requirements

| Requirement | Implementation |
|---|---|
| Greeting and purpose | Opening message explains what Caddie does and how to answer |
| Voice and text input | Web Speech API microphone, text field, and quick-reply chips |
| Show what was heard | "I heard: ..." card with Send and Retry |
| Spoken and visible replies | Speech synthesis (toggle) plus a text caption for every reply |
| Remembers answers | Session state object, shown in the "Your booking" panel |
| Follow-ups for missing info | For example, "Saturday morning" prompts for a specific time |
| Multiple answers in one sentence | The parser fills every field it recognizes |
| Error handling (more than 2) | Booked time, unavailable time, more than 4 players, invalid contact, unrecognized input, silent or blocked microphone |
| Correction without restarting | "Actually make it 3 players", an Edit button on each field, and Back |
| Final confirmation | Full summary, "Is that correct?", then a booking reference |
| System status | Avatar states: idle, listening, thinking, speaking |
| Accessibility | Text alternative for all speech, ARIA live regions, labelled controls, reduced-motion support, light and dark themes |
| Privacy awareness | Panel states exactly what is collected and why |

## Run it locally

```bash
git clone <your-repo-url>
cd caddie-golf-avatar
python3 -m http.server 8000
```

Open http://localhost:8000. Use `localhost` or HTTPS rather than opening the file directly, because browsers restrict microphone access on `file://` pages. Voice works best in **Chrome or Safari**. In other browsers, text and buttons still work.

## Project structure

```
index.html      Page markup and avatar (SVG)
styles.css      Theme variables (colours at the top), layout, avatar animation
app.js          Conversation state machine, parsing, validation, speech I/O
docs/           Conversation flow, test cases, usability testing log
docs/screenshots/  Wireframe and prototype screenshots
```

## Changing the theme

All colours are CSS variables in `:root` at the top of `styles.css` (light, dark, and forced-dark blocks).

## Testing

See [docs/TEST_CASES.md](docs/TEST_CASES.md) for the six minimum conversation test cases and [docs/USABILITY_TESTING.md](docs/USABILITY_TESTING.md) for the user-testing plan and log.

## Known limitations

- Rule-based language understanding, not a full NLP model
- Fixed demo tee-time slots (8:00 AM is intentionally "fully booked" to demonstrate error recovery)
- No real booking backend; nothing is stored or sent
- Speech recognition accuracy depends on browser, microphone, and background noise

## Team

|---------|
| Huzaifa Farhan |
| Anas Jamil |
| Bilal Brohi |

## Licence

MIT, see [LICENSE](LICENSE).
