import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Outlet
} from "@remix-run/react";

import globalStylesUrl from './styles/global.css';
import globalStylesMediumUrl from './styles/global-medium.css';
import globalStylesLargeUrl from './styles/global-large.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: globalStylesUrl,
    },
    {
      rel: 'stylesheet',
      href: globalStylesMediumUrl,
      media: "print, (min-width: 640px)"
    },
    {
      rel: "stylesheet",
      href: globalStylesLargeUrl,
      media: "screen and (min-width: 1024px)",
    }
  ]
}

export function Document({
  children,
  title = "Remix: So great, it's funny"
}: {
  children: React.ReactNode,
  title?: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <Links/>
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet/>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-Oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
