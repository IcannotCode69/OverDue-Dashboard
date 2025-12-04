import { GradeAssignment } from "./grades.types";
import { generateId } from "../../utils/randomId";

export interface ParsedGradeLine {
  name: string;
  earned: number | null;
  possible: number | null;
  letter: string | null;
}

const POINTS_REGEX = /^(-|\d+)\s*\/\s*(-|\d+)$/;
const LETTER_REGEX = /^[A-F][+-]?|-$/i;

function cleanLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !!line)
    .filter((line) => {
      const lower = line.toLowerCase();
      if (lower === "grades") return false;
      if (lower.startsWith("grade item")) return false;
      if (lower.startsWith("points")) return false;
      if (lower.startsWith("grade ")) return false;
      if (lower.startsWith("comments and assessments")) return false;
      if (lower.startsWith("view quiz") || lower.startsWith("view exam")) return false;
      return true;
    });
}

/**
 * Example block (Brightspace):
 * Lab 2 - NetCat Relay
 * 20 / 20
 * A
 */
export function parseBrightspaceText(raw: string): ParsedGradeLine[] {
  const lines = cleanLines(raw);
  const parsed: ParsedGradeLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const name = lines[i];
    const pointsLine = lines[i + 1];
    if (!name || !pointsLine) continue;

    const match = pointsLine.match(POINTS_REGEX);
    if (!match) continue;

    const earned = match[1] === "-" ? null : Number(match[1]);
    const possible = match[2] === "-" ? null : Number(match[2]);

    const potentialLetter = lines[i + 2];
    const letter =
      potentialLetter && LETTER_REGEX.test(potentialLetter)
        ? potentialLetter === "-" ? null : potentialLetter
        : null;

    parsed.push({
      name,
      earned,
      possible,
      letter,
    });

    i += letter ? 2 : 1;
  }

  return parsed;
}

export function parsedToAssignments(
  courseId: string,
  parsed: ParsedGradeLine[]
): GradeAssignment[] {
  const now = Date.now();
  return parsed.map((item, index) => ({
    id: `${generateId()}-${index}`,
    courseId,
    name: item.name,
    due: null,
    pointsEarned: item.earned,
    pointsPossible: item.possible,
    letter: item.letter,
    status: item.earned == null ? "Not Started" : "Graded",
    notes: undefined,
    createdAt: now,
    updatedAt: now,
  }));
}
