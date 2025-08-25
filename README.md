# React + Vite + React Router

Project bootstrapped with Vite and configured with React Router (v7 data API) for client-side routing.

## Routing Structure

Routes are defined in `src/routes.jsx` using `createBrowserRouter`.

```
/
 ├─ (index) HomePage
 ├─ /about  AboutPage
 └─ *       NotFoundPage (catch-all)
```

`RootLayout` provides shared navigation and an outlet.

## Add a New Page
1. Create a component in `src/ui/pages/YourPage.jsx`.
2. Add an entry in the children array inside `routes.jsx`:
```js
	{ path: 'your-path', element: <YourPage /> },
```
3. Add a `<NavLink>` in `RootLayout.jsx` if you want it in the nav.

## Development
Start dev server:
```bash
npm run dev
```

## Notes
- The legacy `App.jsx` file is now a no-op; the app renders via `RouterProvider` in `main.jsx`.
- Update or remove `App.jsx` once no tooling expects it.
