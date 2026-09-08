/**
 * Hold a promise to a minimum perceived duration.
 *
 * A submit that resolves in 40ms flashes its spinner for a single frame,
 * which reads as "the button did nothing". Flooring the duration makes
 * loading states legible. Failures are re-thrown AFTER the delay too —
 * an instant error flash is just as illegible as an instant success.
 *
 * @example
 * const result = await withMinDelay(submitContact(values));
 */
export async function withMinDelay<T>(promise: Promise<T>, minMs = 300): Promise<T> {
  const delay = new Promise<void>((resolve) => setTimeout(resolve, minMs));

  try {
    const [result] = await Promise.all([promise, delay]);
    return result;
  } catch (err) {
    await delay;
    throw err;
  }
}
