/**
 * Host half of the inline-branches bundle.
 *
 * The feature is a Client-side view over the existing Session: turn folders
 * live in localStorage and are drawn with CSS over the native Chat transcript
 * (see client.js). No Host service or session event is involved, so this entry
 * registers nothing; it exists because a bundle patch needs a Host plugin row.
 */
export function apply() {}
