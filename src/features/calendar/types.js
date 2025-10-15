// Deprecated types; Calendar now uses Google Calendar embed.
// If converted to TS, use these as the source of truth.

/** @typedef {"event"|"task"|"class"|"study"|"ai_suggested"} CalEventType */

/**
 * @typedef {Object} CalEvent
 * @property {string} id
 * @property {string} userId
 * @property {CalEventType} type
 * @property {string} title
 * @property {string} start // ISO
 * @property {string} end   // ISO
 * @property {boolean=} allDay
 * @property {string=} courseId
 * @property {string=} taskId
 * @property {string=} noteId
 * @property {string=} rrule // e.g. "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20251215"
 * @property {"local"|"ai_overlay"|"imported_ics"=} source
 * @property {string=} color
 */

export const TYPE_COLORS = {
  task: "#60A5FA",       // blue-400
  event: "#2DD4BF",      // teal-400
  study: "#A78BFA",      // purple-400
  class: "#F59E0B",      // amber-500
  ai_suggested: "#A78BFA" // purple (dashed border in UI)
};
