export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
  }
}
