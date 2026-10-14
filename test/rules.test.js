import test from "node:test";
import assert from "node:assert/strict";
import {
  canAdjustCents, canDeleteEntry, canUnlockJournal, canViewJournal,
  effectiveCents, isSharedEntryLocked, officerDistance, validateCents
} from "../lib/rules.js";

const staff = [
  { id: "john", reportingOfficerId: "mary", roles: ["STAFF"] },
  { id: "mary", reportingOfficerId: "ling", roles: ["STAFF"] },
  { id: "ling", reportingOfficerId: null, roles: ["STAFF"] },
  { id: "admin", reportingOfficerId: null, roles: ["OVERALL_ADMIN"] },
  { id: "group-admin", reportingOfficerId: null, roles: ["GROUP_ADMIN"] },
];

test("indirect reporting officers can view a reportee journal", () => {
  assert.equal(canViewJournal(staff[2], "john", staff), true);
  assert.equal(canViewJournal(staff[4], "john", staff), false);
  assert.equal(canViewJournal(staff[3], "john", staff), true);
});

test("higher officers have a greater distance and their cents take priority", () => {
  assert.equal(officerDistance("mary", "john", staff), 1);
  assert.equal(officerDistance("ling", "john", staff), 2);
  assert.equal(effectiveCents(100, [
    { officerDistance: 1, adjustedCents: 120, createdAt: "2026-01-03" },
    { officerDistance: 2, adjustedCents: 140, createdAt: "2026-01-01" },
  ]), 140);
});

test("a lower officer cannot adjust after a higher officer", () => {
  const adjustments = [{ officerDistance: 2, adjustedCents: 140 }];
  assert.equal(canAdjustCents({ actorId: "mary", subjectId: "john", staffMembers: staff, adjustments, locked: false }), false);
  assert.equal(canAdjustCents({ actorId: "ling", subjectId: "john", staffMembers: staff, adjustments, locked: false }), true);
});

test("a lock on any participant atomically locks a shared entry", () => {
  assert.equal(isSharedEntryLocked({
    academicYearPermanentlyLocked: false,
    participantIds: ["john", "mary"],
    activeLocks: [{ staffId: "john", unlockedAt: null }],
  }), true);
});

test("lower officers cannot undo higher locks and past years cannot unlock", () => {
  const activeLock = { officerDistance: 2, lockKind: "JOURNAL" };
  assert.equal(canUnlockJournal({ actorId: "mary", subjectId: "john", staffMembers: staff, activeLock, academicYearPermanentlyLocked: false }), false);
  assert.equal(canUnlockJournal({ actorId: "ling", subjectId: "john", staffMembers: staff, activeLock, academicYearPermanentlyLocked: false }), true);
  assert.equal(canUnlockJournal({ actorId: "ling", subjectId: "john", staffMembers: staff, activeLock, academicYearPermanentlyLocked: true }), false);
});

test("creator deletion requires every other participant to be unacknowledged", () => {
  assert.equal(canDeleteEntry({ actorId: "john", creatorId: "john", locked: false, participants: [
    { staffId: "john", acknowledgementStatus: "ACKNOWLEDGED" },
    { staffId: "mary", acknowledgementStatus: "SUGGESTED" },
  ] }), true);
  assert.equal(canDeleteEntry({ actorId: "john", creatorId: "john", locked: false, participants: [
    { staffId: "john", acknowledgementStatus: "ACKNOWLEDGED" },
    { staffId: "mary", acknowledgementStatus: "ACKNOWLEDGED" },
  ] }), false);
});

test("cents validation uses Academic Year configuration", () => {
  const ay = { minimumCents: 5, maximumCents: 1000 };
  assert.equal(validateCents(5, ay), null);
  assert.match(validateCents(4, ay), /between 5 and 1000/);
  assert.match(validateCents(5.5, ay), /whole number/);
});
