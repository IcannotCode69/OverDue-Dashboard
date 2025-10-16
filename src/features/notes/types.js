// Extended types (JS + JSDoc; TS-ready)
/** @typedef {string} ClassId */
/** @typedef {string} ChapterId */
/** @typedef {string} NoteId */

/** @typedef {{ id: ClassId, name: string, order: number }} ClassItem */
/** @typedef {{ id: ChapterId, classId: ClassId, name: string, order: number }} ChapterItem */

/**
 * @typedef {Object} Note
 * @property {NoteId} id
 * @property {ClassId=} classId
 * @property {ChapterId=} chapterId
 * @property {string} title
 * @property {string} body
 * @property {string[]} tags
 * @property {boolean=} pinned
 * @property {string} createdAt
 * @property {string} updatedAt
 */
