'use server';

/**
 * Example Server Actions.
 *
 * Server Actions are async functions that run on the server.
 * They can be called directly from Client Components via forms or event handlers.
 *
 * Key rules:
 * - Must be in a file with 'use server' directive (or inline with 'use server' in function body)
 * - Arguments and return values must be serializable (no classes, functions, etc.)
 * - Use `revalidatePath()` / `revalidateTag()` to invalidate cached data after mutations
 * - Validate all inputs — Server Actions are public HTTP endpoints
 *
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
 *
 * @example
 * // In a Server Component:
 * import { submitFeedback } from '@/app/actions';
 *
 * <form action={submitFeedback}>
 *   <input name="message" required />
 *   <button type="submit">Send</button>
 * </form>
 *
 * @example
 * // In a Client Component with useActionState:
 * 'use client';
 * import { useActionState } from 'react';
 * import { submitFeedback } from '@/app/actions';
 *
 * function FeedbackForm() {
 *   const [state, action, isPending] = useActionState(submitFeedback, null);
 *
 *   return (
 *     <form action={action}>
 *       <input name="message" required />
 *       <button disabled={isPending}>
 *         {isPending ? 'Sending...' : 'Send'}
 *       </button>
 *       {state?.error && <p>{state.error}</p>}
 *       {state?.success && <p>Thanks for your feedback!</p>}
 *     </form>
 *   );
 * }
 */

type ActionState = {
  success?: boolean;
  error?: string;
} | null;

export async function submitFeedback(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const message = formData.get('message');

  // Always validate inputs — Server Actions are public endpoints
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { error: 'Message is required.' };
  }

  if (message.length > 1000) {
    return { error: 'Message must be under 1000 characters.' };
  }

  try {
    // Replace with your actual API call:
    // await fetcher('/feedback', {
    //   method: 'POST',
    //   body: JSON.stringify({ message: message.trim() }),
    // });

    // Revalidate cached data if needed:
    // revalidatePath('/feedback');
    // revalidateTag('feedback');

    return { success: true };
  } catch {
    return { error: 'Failed to submit. Please try again.' };
  }
}
