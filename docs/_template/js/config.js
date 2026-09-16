/**
 * FLIGHT400 Lab — Event Configuration
 * =====================================
 * Copy the entire _template/ folder and rename it for your event (e.g. contoso/).
 * Edit only this file. Everything else (CSS, JS, tracks) is shared from ../
 *
 * FIELDS
 * ──────
 * companyName   Display name shown in the hero badge and page footer.
 * eventName     Full event title, e.g. "TechConnect 2026".
 * eventDate     Human-readable date, e.g. "Tuesday, September 9, 2026".
 * primaryColor  Hex — overrides --primary CSS token. Default: IBM Blue #0F62FE.
 * accentColor   Hex — overrides --accent CSS token. Default: IBM Gold #F0AB00.
 *
 * boxFolderUrl  URL to the Box folder containing the IBM i credentials and
 *               ssh_private_key.pem for this engagement. Rendered as a link in
 *               Setup step 5 (Connect Bob IDE to IBM i). Omit or set to null to
 *               hide the link.
 *
 * agendaItems   Array of agenda sessions rendered into the "Event Agenda" modal.
 *               Remove or set to [] to hide the Agenda button entirely.
 *               Each item: { time: string, title: string, bullets: string[] }
 *
 * attendeeTable Array of attendee rows rendered into the Setup card assignment
 *               table, replacing the generic 1–50 table.
 *               Each row: { student: number, attendeeName?: string, library: string, devPort: number, reactUrl: string }
 *               attendeeName is optional — when any row includes it, an "Attendee Name" column
 *               is automatically injected into the table header and each row.
 *               Pattern: library = 'FLGHT4' + zero-padded(student),
 *                        devPort = 3000 + student,
 *                        reactUrl = 'http://localhost:' + devPort
 *
 * tracks        Optional. Array of track slugs to display, in order.
 *               Omit this field entirely to show all 8 tracks (the default).
 *               When provided, this list completely replaces the default —
 *               only the specified tracks will load, in the order given.
 *               Valid slugs: 'setup', 'track-1', 'track-2', 'track-3',
 *                            'track-4', 'track-5', 'track-6', 'track-7'
 *               Example (show only setup + tracks 1, 3, 4):
 *                 tracks: ['setup', 'track-1', 'track-3', 'track-4']
 *
 *               Local track overrides: if you place a file at
 *               <eventslug>/tracks/<slug>.html it will be used instead of the
 *               shared docs/tracks/<slug>.html for that slug only.
 *               All other slugs still load from the shared folder.
 */

window.FLIGHT400_CONFIG = {

  companyName:  'Your Company',        // ← REPLACE
  eventName:    'FLIGHT400 Lab',       // ← REPLACE
  eventDate:    'Your Event Date',     // ← REPLACE e.g. "Tuesday, September 9, 2026"

  primaryColor: '#0F62FE',             // ← optional brand color override
  accentColor:  '#F0AB00',             // ← optional accent color override

  // ← REPLACE with the Box folder URL containing credentials & ssh_private_key.pem
  // Set to null to hide the link entirely.
  boxFolderUrl: null,

  /**
   * Agenda sessions — remove this array entirely to hide the Agenda button.
   */
  agendaItems: [
    {
      time:    '0:00 – 0:15',
      title:   'Welcome & Introduction',
      bullets: ['Welcome and event objectives', 'Lab overview and format', 'Housekeeping / logistics']
    },
    {
      time:    '0:15 – 0:30',
      title:   'Environment Setup',
      bullets: ['Connect Bob IDE to IBM i', 'Install Premium Package for i', 'Confirm your library number']
    },
    {
      time:    '0:30 – 2:00',
      title:   'Hands-On Exercises',
      bullets: ['Self-select your track (Exercises 1–7)', 'Instructors available for questions', 'Independent exploration']
    }
  ],

  /**
   * Attendee assignment table.
   * Add one row per attendee. The sample below shows 5 rows — extend as needed.
   * See instructor/INSTRUCTOR-GUIDE.md for the full 1–50 pattern.
   */
  attendeeTable: [
    { student: 1, attendeeName: 'Attendee One',   library: 'FLGHT401', devPort: 3001, reactUrl: 'http://localhost:3001' },
    { student: 2, attendeeName: 'Attendee Two',   library: 'FLGHT402', devPort: 3002, reactUrl: 'http://localhost:3002' },
    { student: 3, attendeeName: 'Attendee Three', library: 'FLGHT403', devPort: 3003, reactUrl: 'http://localhost:3003' },
    { student: 4, attendeeName: 'Attendee Four',  library: 'FLGHT404', devPort: 3004, reactUrl: 'http://localhost:3004' },
    { student: 5, attendeeName: 'Attendee Five',  library: 'FLGHT405', devPort: 3005, reactUrl: 'http://localhost:3005' }
    // Add more rows here... Remove attendeeName fields to hide the name column entirely.
  ],

  // tracks: ['setup', 'track-1', 'track-3', 'track-4']
  // ↑ Uncomment and edit to show only specific tracks. Omit to show all 8.

};
