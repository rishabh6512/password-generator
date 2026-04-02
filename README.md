# 🔐 Password Generator (React + Tailwind)

A compact, deterministic password generator with dark UI, secure randomness, and live strength feedback.

---

## Features

* Secure generation (`crypto.getRandomValues`)
* Adjustable composition (lower / upper / digits / special)
* Instant regeneration
* Strength meter (Weak → Very Strong)
* One-click copy

---

## Tech

React · Tailwind CSS · Framer Motion

---

## Run

```bash
npm install
npm run dev
```

---

## Notes

* Max length: 25 (Can be changed)
* No password storage
* No external security libraries
* Fully client-side