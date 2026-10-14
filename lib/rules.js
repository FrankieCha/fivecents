/**
 * Pure business rules used by route handlers and tests. Database access belongs
 * in a repository layer so these rules remain easy to verify.
 */

export function reportingChain(staffId, staffMembers) {
  const byId = new Map(staffMembers.map((member) => [member.id, member]));
  const chain = [];
  const visited = new Set([staffId]);
  let current = byId.get(staffId);

  while (current?.reportingOfficerId) {
    if (visited.has(current.reportingOfficerId)) throw new Error("Reporting hierarchy contains a cycle");
    visited.add(current.reportingOfficerId);
    const officer = byId.get(current.reportingOfficerId);
    if (!officer) break;
    chain.push(officer);
    current = officer;
  }
  return chain;
}

export function officerDistance(officerId, staffId, staffMembers) {
  const index = reportingChain(staffId, staffMembers).findIndex((officer) => officer.id === officerId);
  return index === -1 ? null : index + 1;
}

export function canViewJournal(actor, subjectId, staffMembers) {
  if (actor.roles?.includes("OVERALL_ADMIN")) return true;
  if (actor.id === subjectId) return true;
  return officerDistance(actor.id, subjectId, staffMembers) !== null;
}

export function effectiveCents(lecturerCents, adjustments) {
  if (!adjustments.length) return lecturerCents;
  return [...adjustments]
    .sort((a, b) => b.officerDistance - a.officerDistance || new Date(b.createdAt) - new Date(a.createdAt))[0]
    .adjustedCents;
}

export function canAdjustCents({ actorId, subjectId, staffMembers, adjustments, locked }) {
  if (locked) return false;
  const distance = officerDistance(actorId, subjectId, staffMembers);
  if (distance === null) return false;
  const highestExisting = adjustments.reduce((max, item) => Math.max(max, item.officerDistance), 0);
  return distance >= highestExisting;
}

export function isSharedEntryLocked({ academicYearPermanentlyLocked, participantIds, activeLocks }) {
  if (academicYearPermanentlyLocked) return true;
  const participants = new Set(participantIds);
  return activeLocks.some((lock) => participants.has(lock.staffId) && !lock.unlockedAt);
}

export function canUnlockJournal({ actorId, subjectId, staffMembers, activeLock, academicYearPermanentlyLocked }) {
  if (academicYearPermanentlyLocked || !activeLock || activeLock.lockKind === "PERMANENT_AY") return false;
  const distance = officerDistance(actorId, subjectId, staffMembers);
  return distance !== null && distance >= activeLock.officerDistance;
}

export function canDeleteEntry({ actorId, creatorId, participants, locked }) {
  if (locked || actorId !== creatorId) return false;
  return participants.every((participant) =>
    participant.staffId === creatorId || participant.acknowledgementStatus !== "ACKNOWLEDGED"
  );
}

export function validateCents(value, academicYear) {
  if (!Number.isInteger(value)) return "Cents must be a whole number.";
  if (value < academicYear.minimumCents || value > academicYear.maximumCents) {
    return `Cents must be between ${academicYear.minimumCents} and ${academicYear.maximumCents}.`;
  }
  return null;
}
