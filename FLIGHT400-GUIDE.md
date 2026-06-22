# Flight Reservation System (FLGHT400) — Quick Reference Guide

## 1 · How to Use the Application

### Launch

From a 5250 session:

```
GO FLGHT400/FRSMAIN
```

---

### Main Menu Options

| Option | Function |
|--------|----------|
| **1** | Create a New Reservation |
| **2** | Update an existing Reservation |
| **3** | Inquire on an existing Reservation |
| **4** | Delete an existing Reservation |
| **5** | Fax Reservation Information |
| **10** | Flight Reservation System Maintenance |
| **20** | Reservation System Reports |
| **90** | Signoff |

---

### Step 1 — Logon Screen (all options call this first)

| Field | Value |
|-------|-------|
| **Agent Name** | `Julia` (or any name from the table below) |
| **Password** | `mercury` (same for all agents) |

Press **F10=LOGON** to continue. Use **F4** to pop up the agent selection list.

#### Valid Agents

| Agent # | Name |
|---------|------|
| 2 | Julia |
| 3 | Mary |
| 4 | Alex |
| 5 | Debby |
| 6 | Amanda |
| 7 | Sharon |
| 8 | Suzanne |
| 9 | Helen |
| 10 | Terry |
| 11 | Mark |
| 12 | Richard |
| 14 | Dan |
| 15 | Mike |
| 16 | Paula |
| 17 | Amy |

> Agent 1 has a blank name — skip it.
> All passwords are **`mercury`**.

---

### Step 2 — Create Order Screen (Option 1)

The screen is split into two panels.

#### Left — Flight Information

| Field | What to enter | Prompt key |
|-------|--------------|------------|
| **From City** | `Albany` | **F4** — From City list |
| **To City** | `Albuquerque` | **F5** — To City list |
| **Date of Flight** | A Monday date, e.g. `07 14 2025` (MM DD YYYY) | — |

After entering From/To cities press **F6=Flights** to pick a flight from the list.

#### Sample Flights (Albany → Albuquerque, Mondays, Airline AMA)

| Flight # | Departs | Arrives | Price |
|----------|---------|---------|-------|
| **1100001** | 09:01 AM | 03:01 PM | $169 |
| 1200002 | 09:03 AM | 11:03 AM | $179 |
| 1500005 | 12:55 PM | 02:55 PM | $299 |

#### Right — Ticket Order Information

| Field | What to enter | Prompt key |
|-------|--------------|------------|
| **Customer** | `Brandle, Jimmy` | **F7** — Customer list |
| **Class of Service** | Enter `Y` in **one** field only: First / Business / Economy | — |
| **Number of Tickets** | `1` | — |

#### Sample Customers

| Customer # | Name |
|-----------|------|
| 1 | Brandle, Jimmy |
| 2 | Ethington, Jaclyn |
| 3 | Efflandt, Francisco |
| 4 | Elston, Maurice |
| 5 | Kling, Urbin |

Press **F10** to submit → a **confirmation window** appears → confirm to create the order.

---

### Function Keys (Order Screen)

| Key | Action |
|-----|--------|
| F2 | Refresh / clear the screen |
| F4 | Prompt — From City list |
| F5 | Prompt — To City list |
| F6 | Prompt — Flights list |
| F7 | Prompt — Customer list |
| F10 | Submit the order |
| F3/F12 | Exit / Cancel |

---

## 2 · Error Handling — Missing Compiled Programs

### Symptom

When navigating the app (pressing a prompt key or confirming an order) you get:

```
RPG0211 — Cannot resolve to object FRS402.
          Type and Subtype X'0201' Authority X'0000'.
```

`X'0201'` is the IBM i internal type code for `*PGM`. The message means the called program **object does not exist** in the library — the source is present but was never compiled.

---

### How to Diagnose with Bob

1. **Copy the full error message** from the 5250 session (e.g. `RPG0211 — Cannot resolve to object FRS402`).
2. **Paste it into the Bob chat** and ask:

   > *"I'm getting `RPG0211 Cannot resolve to object FRS402` when running the Flight Reservation app. What is missing and how do I fix it?"*

3. Bob will:
   - Identify that `FRS402` (and any other `FRSxxx` programs) are missing `*PGM` objects in `FLGHT400`.
   - Locate the corresponding source member in `FLGHT400/QRPGSRC`.
   - Compile the missing program directly using `CRTRPGPGM`.

---

### Programs Found Missing in This Deployment

Seven programs had source code but no compiled `*PGM` object. All were fixed in two rounds:

#### Round 1 — discovered when pressing F4/F6/F7 prompts on the Create Order screen

| Program | Description | Called by | Fixed |
|---------|-------------|-----------|-------|
| `FRS401` | Select Agent Name from List | `FRS000` (F4 on Logon) | ✅ |
| `FRS402` | Select From City from List | `FRS001` (F4 on Order screen) | ✅ |
| `FRS408` | Select Customer from List of Orders | `FRS009` (Update/Delete flow) | ✅ |

> **Why `FRS001` and `FRS009` appeared to fail:** they were compiled, but crashed immediately when calling a missing sub-program. Always trace the RPG0211 object name — *that* is the thing to compile, not the caller.

#### Round 2 — discovered when using menu options 2, 3, 4 and Maintenance

| Program | Description | Called by | Fixed |
|---------|-------------|-----------|-------|
| `FRS003` | Display (Inquire) an Order | `FRS009` (option 3 flow) | ✅ |
| `FRS004` | Delete an Order | `FRS009` (option 4 flow) | ✅ |
| `FRS021` | Flight Schedule Maintenance | `FRSMANT` menu (option 10) | ✅ |
| `FRS024` | Customers Table Maintenance | `FRSMANT` menu (option 10) | ✅ |

---

### Quick Check — Full Program Inventory

Ask Bob to check what's missing.  Bob will use the appropriate tool and run this SQL query to see every `FRS*` program compiled in `FLGHT400`:

```sql
SELECT OBJNAME, OBJTEXT
FROM TABLE(QSYS2.OBJECT_STATISTICS('FLGHT400','*PGM','FRS*'))
ORDER BY OBJNAME
```

#### Expected output — 27 programs

```
FRS000    Flights Reservation System Logon
FRS001    Flight Reservation data entry - new order 2004
FRS001CL  Flight Reservation data entry - new order (CL wrapper)
FRS001T   Flight Reservation data entry - new order 2004
FRS001U   Flight Reservation data entry - new order 2004
FRS002    Flight Reservation data entry - update order
FRS003    Flight Reservation - display order
FRS004    Flight Reservation - delete order
FRS005    Flight Reservation - FAX order
FRS009    Flight Reservation - Select Order
FRS010    Flight Reservation - Select Order
FRS021    Flight Maintenance - Flight Schedule
FRS022    Flight Maintenance - Flight CITY Table
FRS023    Flight Maintenance - Agents Table
FRS024    Flight Maintenance - Customers Table
FRS401    Select Agent from List
FRS402    Select From City from List
FRS403    Select To City from List
FRS404    Select Flights from List
FRS405    Select Customer from List
FRS406    Order Confirmation Window
FRS407    Select by Order Date from List of Orders
FRS408    Select Customer from List of Orders
FRS409    Order Modification Confirmation Window
FRS410    Order Removed Confirmation Window
FRS411CL  FAX confirmation window
FRS413    Select Flights from List - all Flights
```

If any row is missing, find the source member in `FLGHT400/QRPGSRC` and ask Bob to compile it:

```
"FRS003 is missing from FLGHT400. Please compile it from FLGHT400/QRPGSRC."
```

Bob will run the `CRTRPGPGM` command and confirm the result.

---

### Source Members in FLGHT400/QRPGSRC — What to Compile vs What to Skip

Some source members are **alternates or variants** not intended to be compiled as the active program:

| Member | Notes |
|--------|-------|
| `FRS001X` | Older variant of FRS001 — skip |
| `FRS001U2` | UDS variant of FRS001U — skip |
| `FRS401B` | Old version of FRS401 (no reposition) — skip |
| `FRS402B` | Old version of FRS402 (no reposition) — skip |
| `FRS404B` | Alternate version of FRS404 — skip |
| `FRS411` | OPM RPG stub example only — skip |

These are kept for reference/history. Do **not** compile them over the active programs.
