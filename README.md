# retro-counter

A little 90s hit counter for static sites. One file, no dependencies, no
build step, no server, no third-party service, no tracking.

**[Live demo →](https://rachelkaur.github.io/retro-counter/)**

```html
<div data-retro-counter></div>
<script src="retro-counter.js"></script>
```

That's the whole install. The styles ship inside the script — there's no CSS
file to add.

## ⚠️ Read this before you use it

The count lives in **each visitor's own browser** (localStorage). It is **not
a site-wide total**. Every visitor counts only their own visits, so a
first-time visitor always sees `000001`.

It's a personal hello, not a stat. That's why the default label reads
*"Your visit"* and not the period-accurate *"You are visitor number"* — that
phrasing would be a lie, and the whole appeal of these things was that the
number meant something.

If you want a true shared tally, you need a server or a hosted counter
service. This isn't that, and it can't be made into that — that's the
tradeoff for having no backend and sending nothing anywhere.

What you get instead: nothing to deploy, nothing to pay for, no visitor data
leaving the page, and no external service that can disappear and take your
counter with it.

## Options

All optional, all set with data attributes:

```html
<div data-retro-counter
     data-label="Your visit"
     data-digits="6"
     data-theme="lcd"
     data-key="my-site"
     data-count-per="session"></div>
```

| Attribute | Default | What it does |
|---|---|---|
| `data-label` | `Your visit` | Text before the digits. Set to `""` for digits only. |
| `data-digits` | `6` | How many digits. The number caps at the largest that fits. |
| `data-theme` | `lcd` | `lcd`, `amber`, `cyan`, or `paper`. |
| `data-key` | `retro-counter` | localStorage key. Change it if you run two separate counters. |
| `data-count-per` | `session` | `session`, `pageview`, or `day`. |

### Counting rules

- **`session`** (default) — one count per browsing session, so a visitor
  clicking around your site doesn't run the number up.
- **`pageview`** — every page load.
- **`day`** — at most one count per calendar day.

## Styling

Override the CSS custom properties. No need to edit the file:

```css
.rc {
  --rc-box:   #2c2420;  /* the odometer housing */
  --rc-digit: #9fc131;  /* digit color          */
  --rc-glow:  rgba(159, 193, 49, .75);
  --rc-label: #6a5f57;
}
```

The markup it renders:

```html
<span class="rc" data-rc-theme="lcd">
  <span class="rc-label">Your visit</span>
  <span class="rc-odo"><span class="rc-digit">0</span>…</span>
  <span class="rc-sr">Your visit 1</span>  <!-- screen readers only -->
</span>
```

## JavaScript API

Counters with a `data-retro-counter` attribute mount themselves. If you build
your footer dynamically, mount by hand:

```js
RetroCounter.mount(element, { label: "Your visit", digits: 6, theme: "lcd",
                              key: "my-site", per: "session" });

RetroCounter.reset("my-site");  // clear a counter
RetroCounter.version;           // "1.0.0"
```

`mount()` returns the visit number, or `null` if storage is blocked.

## Notes

- Several counters sharing a `data-key` on one page show the same number and
  count the visit once.
- If storage is blocked (some private modes, cookies off) the counter hides
  itself rather than showing a fake or stuck `000000`.
- The odometer digits are individual spans, so they're marked `aria-hidden`
  and paired with a screen-reader-only "Your visit 7" — otherwise it'd read
  aloud as "zero zero zero zero zero seven".
- Plain ES5, no build step. Works anywhere localStorage does.

## License

MIT © 2026 Rachel Kaur
