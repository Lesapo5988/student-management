# Student Hub — DIWA2110

An interactive student management dashboard for the DIWA2110 Web Application Development assignment. It is built with React, JSX, and plain JavaScript, and stores records in the browser's `localStorage`.

## Run the application

This project contains no `.json` files, and needs no package manager or build step. Node.js is only needed to run the included development server; the app itself uses React and Babel browser scripts loaded from public CDNs, so an internet connection is required.

1. Open Command Prompt or PowerShell in the project root folder (the folder containing `index.html` and `server.js`), not inside `src`.
2. Run `node server.js` and open the printed local URL in a modern browser. Stop the server with **Ctrl+C**.
3. The dashboard starts with fictional sample records. Add, edit, and delete actions update the page immediately and persist in that browser.
4. To publish, upload the project folder to a GitHub repository and import it into Netlify or Vercel as a static site. Use the project root as the publish directory; no build command is required.

## Features

- Student dashboard with record totals, active and graduated counts, and a responsive table.
- Add and edit forms with required-field, age, email-format, duplicate-email, and status validation.
- A separate delete-confirmation dialog; cancel, close button, backdrop click, and Escape key all dismiss dialogs without saving or deleting.
- Search by student ID, name, email, or course; filter by enrollment status; sort names A–Z or Z–A.
- Immediate React state updates, browser `localStorage` persistence, clear empty states, and accessible labels and feedback.
- Automatically generated student IDs for new records.

## JavaScript and React concepts demonstrated

- **Data types:** names, IDs, emails, courses, and statuses are strings; age and computed counts are numbers; `isActive` is a boolean; student collections and validation errors are arrays/objects. Each student is an object.
- **Declarations:** `const` is used for values and references that are not reassigned; `let` is not needed because this implementation avoids reassigning local bindings; `var` is intentionally avoided because its function scope is less predictable than block-scoped declarations in modern React code. This demonstrates choosing declarations for their behavior rather than using all three without a purpose.
- **Functions and logic:** named reusable functions handle validation, record construction, ID generation, and initial data loading. Event handlers use function parameters, returns, conditionals, `map`, `filter`, `reduce`, `some`, and `sort`.
- **React:** functional components are composed with JSX; props pass record data and handlers; `useState`, `useEffect`, and `useMemo` manage state, persistence, dialog behavior, feedback, and derived lists.

## Manual test checklist

1. **Initial and empty states:** load the dashboard and verify the sample records and totals. Delete each record, then verify the empty-directory message and that adding a student remains possible.
2. **Add and validation:** open **Add student**, submit an empty form, and confirm field errors appear. Try an invalid email, duplicate email, decimal age, and age outside 16–100; each must be rejected. Add valid details and verify the new record, status, total, and generated ID.
3. **Edit:** edit a record, change its name and status, save, and confirm the table and active count update without a refresh. Open edit and cancel; the original values should remain unchanged.
4. **Delete and cancel:** start deleting a record and choose **Keep student**; it must remain. Confirm deletion of another record; it must disappear and the total must decrease.
5. **Dialog dismissal:** open either form dialog and test the close button, backdrop, and Escape key. Closing an add or edit dialog without saving must discard unsaved changes.
6. **Search, filtering, and sorting:** search using a name, ID, email, and course; choose each enrollment status; toggle A–Z/Z–A. Clear filters and verify the full list returns.
7. **Persistence and responsive layout:** refresh after adding or editing and verify the change remains. Check a narrow/mobile viewport and verify the table can scroll horizontally and controls remain usable.

## Project files

- `index.html` — browser entry point and CDN-loaded React runtime.
- `server.js` — optional local static server; uses only Node.js built-in modules.
- `src/app.js` — React components, student data, application logic, and interactions.
- `styles.css` — dashboard, dialog, and responsive styles.
- `README.md` — setup, concept notes, and test checklist.

The included records are fictional examples. Replace them with approved course data before presenting the application.
