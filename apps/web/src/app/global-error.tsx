"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <head>
        <title>Application Error</title>
      </head>
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>Application Error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}