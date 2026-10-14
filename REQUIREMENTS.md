# FiveCents Requirements

## 1. Purpose

FiveCents is a contribution journal for staff in the School of Infocomm. It will initially be used by the Diploma in Applied AI and Analytics (DAAA). Staff record contributions throughout an Academic Year (AY), attach evidence, value their contribution in cents, and share a contribution with colleagues who participated. Reporting Officers use the journal to support staff during ranking exercises.

The first release focuses on contribution journals and cents. Competency assessments, skills assessments, appraisal submissions, and the final report format are outside this release.

## 2. Technology

- Next.js with JavaScript
- Tailwind CSS and shadcn/ui-style application components
- PostgreSQL hosted on Azure Database for PostgreSQL
- Azure App Service for the application
- Azure Blob Storage for uploaded evidence
- Custom email and password authentication
- Argon2id password hashing

## 3. Organisation

Each staff member has one designation, one organisational group, and an optional direct Reporting Officer. Reporting relationships form a hierarchy.

Initial designations are Programme Chair, Assistant Programme Chair, Senior Lecturer, and Lecturer. Groups include diploma groups such as DAAA, the Admin group, and the Industry group.

Designation, application role, and reporting relationship are separate concepts.

## 4. Roles and access

### Staff

Staff can view and maintain their own current-AY journal, create contributions, participate in shared entries, enter their own cents, and attach files or links as evidence. A staff member can see all details, participant cents, and Reporting Officer adjustments for a shared entry in which they participate.

### Reporting Officer

A Reporting Officer can view the journals of all direct and indirect Reportees below them in the reporting hierarchy. Any officer above a staff member may adjust that staff member's cents and lock or unlock the staff member's current-AY journal.

### Group Administrator

A Group Administrator manages accounts and group membership only within their assigned group. Group Administrators cannot view journal contents, cents, evidence, or other appraisal data.

### Overall Administrator

The Overall Administrator manages accounts and configuration across the School, creates Academic Years, and selects the current AY. The Overall Administrator can view all appraisal data but cannot create, edit, delete, adjust, lock, or otherwise modify it.

## 5. Authentication

Administrators create staff accounts. There is no public registration. A new account receives a temporary password that must be changed at first sign-in. Forgotten passwords are reset using a time-limited link sent to the registered email address. Passwords are never stored in plaintext.

Journal notifications appear inside the application after sign-in. Email is used only for password reset in the first release.

## 6. Academic Years

Academic Years use codes such as `AY2025` and `AY2026`. Only one AY is current, and only the Overall Administrator can create an AY or make it current.

Staff can create contributions only for the current AY. Actual contribution dates are not recorded. When a new AY becomes current, all entries in the previous AY become permanently locked and cannot be unlocked.

Each AY stores its configured cents range. The initial minimum is 5 cents and the initial maximum is 1,000 cents. These values must not be hard-coded in validation logic.

## 7. Contribution journal

A journal entry records:

- Academic Year
- Fixed performance category
- Fixed RP Transformation Goal, when applicable
- Title and description
- Contribution outcomes and measurable impact
- Contribution status
- Participating staff
- Evidence files and web links
- Audit information

Performance categories and RP Transformation Goals are centrally managed and remain fixed across Academic Years.

## 8. Shared entries

A contribution has one shared journal entry and one participant record per staff member. The entry appears in every participant's journal.

The creator is automatically acknowledged and enters their cents during creation. Invited staff see an in-app notification. An invited staff member enters their own cents when acknowledging the contribution, or may decline it. A participant may undo only their own acknowledgement.

All acknowledged participants may edit shared details and evidence while the entry is unlocked. Only the creator may delete the entry, and deletion is allowed only when no other participant currently acknowledges it.

Only staff with FiveCents accounts can be participants. External collaborators are not recorded. Whether acknowledged participants other than the creator may invite additional staff remains a future decision.

## 9. Cents and adjustments

Each participant has their own whole-number cents value within the AY's configured range. Staff may revise their own cents while the entry is unlocked.

Reporting Officer adjustments are stored separately from the lecturer's value. Adjustment comments are optional. Any officer above the staff member may adjust the value, but an adjustment from a higher officer takes priority. Once a higher officer has adjusted a contribution, lower officers cannot submit another adjustment. The complete adjustment history remains visible and auditable.

## 10. Locking

A Reporting Officer locks a staff member's entire current-AY journal in one action. Any officer above the staff member may lock or unlock it. A lower officer cannot override a lock placed by a higher officer; an officer at the same or higher level may unlock it.

Shared entries are atomically locked. Locking one staff member's journal also locks entries shared with other staff. A shared entry becomes editable only when all reversible journal locks affecting it have been removed. Locking and unlocking are audited.

Changing to a new current AY permanently locks all entries in the previous AY.

## 11. Evidence

Entries support uploaded files and web links. File content is stored in Azure Blob Storage. PostgreSQL stores metadata, the Blob Storage reference, and optional notes.

## 12. Reporting

Reporting Officers will generate reports after journals are locked at the end of an AY. Report content and output formats will be designed separately.

## 13. Audit requirements

The system records the actor and time for material actions, including entry edits, participant changes, acknowledgements, declines, cents changes, Reporting Officer adjustments, locks, unlocks, and administrative configuration changes.

