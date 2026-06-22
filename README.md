# FLIGHT400 Application — IBM i Modernization Lab Guide

> **Estimated time:** 2–3 hours  
> **Prerequisites:** IBM Bob IDE installed, internet access, IBM i TechZone LPAR (see below) , and the Premium Package for i 

---

## How to Get an IBM i Virtual Machine (aka LPAR)

To complete this lab, you need access to an IBM i environment. You can provision a free IBM i LPAR through **IBM TechZone**.

1. Go to [https://techzone.ibm.com](https://techzone.ibm.com) and log in with your IBM ID.
2. Search for **"IBM i"** in the catalog, and select an **IBM i 7.6** environment (e.g. *IBM i 7.6 - Sandbox*).
3. Click **Reserve** and fill in the reservation form:
   - **Purpose:** Practice / Self-Education
   - **Duration:** choose at least 8 hours (extend later if needed)
   - **Geography:** pick the region closest to you
4. Submit the reservation. Within a few minutes you'll receive an email with your LPAR's **hostname**, **port**, **user profile**, and **password**.
5. Keep these credentials handy — you'll need them in the next step to connect Bob IDE to your IBM i.

> 💡 If you don't have an IBM ID, create one for free at [https://www.ibm.com/account](https://www.ibm.com/account).

---

## Part 0 — Environment Setup

### Install the IBM i Developer Pack for VS Code / Bob IDE

1. Open **Bob IDE**.
2. Go to the **Extensions** view (`Cmd+Shift+X` / `Ctrl+Shift+X`).
3. Search for **"IBM i Developer"** and install the **IBM i Developer Pack** (publisher: *IBM*). This bundle includes:
   - **Code for IBM i** — source editing, object browser, IFS browser, Db2 for i extension etc. 
4. After installation, reload Bob IDE when prompted.
5. In the **Bob** extension settings (Activity sidebar), ensure the **Premium Package for i** is activated — this unlocks the IBM i Developer and IBM i Database modes used in later exercises.

---

## Part 1 — Quick Setup: Restore the FLIGHT400 Application

In this section you will deploy the FLIGHT400 save file to your IBM i LPAR and restore the application library.

### 1.1 — Create a new local workspace

1. On your laptop, create an empty folder — for example `~/ibmi-lab`.
2. In Bob IDE go to **File → Open Folder** and open this new folder.  
   Bob IDE will use this folder as your local workspace.

### 1.2 — Copy the lab files into your workspace

From the [Bob Folder](https://ibm.box.com/v/flight400-box), Download (or copy) the following two files into the folder you just opened:

| File | Description |
|---|---|
| `FLGHT400.FILE` | Save file containing the FLIGHT400 application |
| `Install-Flight400.sql` | SQL script that restores the application on IBM i |

Both files should now be visible in the VS Code **Explorer** panel.

### 1.3 — Connect Bob IDE to your IBM i

1. In the Bob IDE Activity Bar, click the **IBM i** icon (plug icon).
2. Click **➕ New Connection** and enter the details from your TechZone reservation:
   - **IP/Host:** `<your-lpar-hostname>`
   - **Username:** `<your-user-profile>`
   - **Password:** `<your-password>`
   - **Private Key** If using PowerVS , let the **Password** field empty, download the private key, and set its path in this field.
3. Click **Connect**. A green status bar message confirms a successful connection.

### 1.4 — Deploy the files to the IFS

1. In the Bob IDE **Explorer**, right-click on **`Install-Flight400.sql`**.
2. Choose **Deploy Selected Files**.  
   This uploads the entire workspace to an IFS directory on IBM i. The target IFS path is shown in the output panel — note it (e.g. `/home/YOURUSER/builds/ibmi-lab`).
3. In the Bob IDE **Explorer**, right-click on **`FLGHT400.FILE`**.
4. Choose **Deploy Selected Files**. 
   This uploads the entire workspace to an IFS directory on IBM i. The target IFS path is shown in the output panel — note it (e.g. `/home/YOURUSER/builds/ibmi-lab`).

> ☕ This may take a one minute or two, Perfect time for a coffee break! 
The Save File `FLGHT400.FILE` contains the code, programs, database files etc. Everything you need to run the application. 

### 1.5 — Verify the upload in the IFS Browser

1. In the IBM i sidebar, expand **IFS Browser**.
2. Navigate to the upload directory noted above (e.g. `/home/YOURUSER/builds/ibmi-lab`).
3. You should see `FLGHT400.FILE` and `Install-Flight400.sql` listed.
4. Right-click on `FLGHT400.FILE` and choose **Copy Path**. It will look something like:  
   `/home/YOURUSER/builds/ibmi-lab/FLGHT400.FILE`

### 1.6 — Update the SQL install script

1. Open `Install-Flight400.sql` in the Bob IDE editor.
2. Locate the `v_ifs_path` and `v_new_owner` variables  , and update them with the IFS path you just copied and the user profile used to connect to the IBM i. 

3. Save the file (`Ctrl+S` / `Cmd+S`).

### 1.7 — Run the SQL script

1. In the **IFS Browser**, refresh the folder. You should see `Install-Flight400.sql` updated.
2. Right-click `Install-Flight400.sql` → **Run Action** → **Run SQL Statements**.
3. Wait for the script execute (create save file, restore library, update library ownership).  
   The output console will confirm each step. The final `RSTLIB` command restores the full **FLIGHT400** library including programs, source members, and database files.

> ✅ **End of Quick Setup.** The FLIGHT400 application is now restored on your IBM i in the `FLGHT400` library. 

> ✅ Make sure `FLGHT400`library is in your library list (in the Code for i settings). 

> ✅  If you have a 5250 terminal to your IBM i available, you can add the library to your lib list `ADDLIBLE FLGHT400` if not already done, and launch the application: `GO FLGHT400/FRSMAIN`

> 💡 Want to explore or troubleshoot the green-screen app? See the [FLIGHT400 Quick Reference Guide](FLIGHT400-GUIDE.md) for navigation tips, menu structure, and common operations.

---

## Exercise 1 — Code Explanation & Architecture Documentation

**Goal:** Use Bob's IBM i Developer mode to automatically generate an architecture overview with diagrams, then switch to Database mode to produce an Entity Relationship Diagram.

### 1a — Browse the Application in the Object Browser

1. In the IBM i sidebar, expand **Object Browser**.
2. Navigate to the **FLGHT400** library. You will see its contents organized by object type:
   - `*PGM` — RPG and CL programs (e.g. `FRS001`, `FRS021`, `FRS409`)
   - `*FILE` — Display files and database physical/logical files
   - `*MENU` — Application menus
3. Expand **Source Files** and browse `QRPGSRC` — open a couple of RPG programs to get a feel for the classic fixed-format style.
4. Navigate to **`QDDSSRCD`** and open the display file `FRS001DF`. In the editor, Click on **Preview All** on the first line of code. It renders the green-screen layout visually — notice the classic 5250 style.

> 💡 Try previewing `FRS021DF` as well — this is the **Flight Maintenance** screen you will work on later in Exercise 4.

> 💡 Again in the **Object Browser**, same library,  click on the program `FRS000.pgm`that is the flight reservation logon. You'll see in the `Detail` that this program was compiled in 1997, 30 years ago ! 


### 1b — Generate an Architecture Explanation with Bob

1. Click the **Open Bob** icon in the top right Activity Bar to open the chat panel.
2. If not already in **IBM i Developer** mode, switch to it using the mode selector at the top of the chat.
3. Click the **`+` (Scope) button** and add **QSYS Library List** as the context scope. This gives Bob visibility into the full application structure. Again, make sure that `FLGHT400` is in the library list. Bob will first search in this list before searching in all QSYS. 
4. Type the following prompt:

   > *"Generate a comprehensive architecture overview of the FLIGHT400 application in Markdown format. Include a high-level description, the main program flows, key programs and their roles, a Mermaid architecture diagram, and a summary of the database tables used."*

5. Bob will analyze the programs, source members, and database files and return a structured Markdown document. Review the output — notice how it identifies the menu-driven architecture, the core transaction programs, and the underlying database schema.
6. Copy the output to a new file `FLIGHT400-Architecture.md` in your workspace for reference.

### 1c — Generate an Entity Relationship Diagram (Database Mode)

1. In the Bob chat panel, switch to **IBM i Database** mode using the mode selector.
2. Type the following slash command:

   > `/erd FLGHT400`

3. Bob will introspect the physical files (`FLIGHTS`, `ORDERS`, `CUSTOMERS`, `AGENTS`, etc.) and their logical files, then generate a **Mermaid ERD** showing the relationships between entities.
4. Observe the key relationships:
   - `ORDERS` links to `FLIGHTS`, `CUSTOMERS`, and `AGENTS`
   - `FLIGHTS` references `FRCITY` and `TOCITY` for departure/arrival cities
5. Copy the ERD Markdown to your `FLIGHT400-Architecture.md` file.

> ✅ You now have a living architecture document generated entirely from the legacy codebase — no manual reverse-engineering required!

---

## Exercise 2 — Program-Level Explanation & Modernization

**Goal:** Understand an old OPM RPG program, then modernize it to free-format ILE RPG using the Bob modernization workflow.

### 2a — Understand FRS409 (Order Modification Confirmation)

1. Switch Bob back to **IBM i Developer** mode.
2. In the Object Browser, navigate to `FLGHT400/QRPGSRC` and open `FRS409`.
3. In the Bob chat panel, type:

   > *"What does this program do?"*

4. Bob will explain the program: `FRS409` is the **Order Modification Confirmation Window** — an OPM RPG program that displays a confirmation popup when a user modifies an order. It handles F3 (Exit), F12 (Cancel), and Enter key inputs via a `DOUEQ` loop with `CASEQ` dispatch subroutines, using a workstation data structure (`WSDS`) to capture the last key pressed.

### 2b — Modernize FRS409 Using the RPG Modernization Workflow

1. With `FRS409` still open in the editor, type in the Bob chat:

   > *"Can you modernize this program?"*

2. Bob recognizes the fixed-format OPM RPG code and offers to run the **RPG Modernization (Fixed to Free Format) workflow**. You can also choose between:
   - **Agentic mode** — Bob iterates and converts interactively (more flexible, takes longer)
   - **Workflow mode** — structured, guided steps (faster for well-known patterns)
   
   → Choose **Workflow mode** and click to start it.

3. The workflow form opens. Fill in the details:
   - **Source file:** `FLGHT400/QRPGSRC`
   - **Source member:** `FRS409` (Bob pre-fills this from the open editor)
   - Accept the other defaults and click **Analyze Member**.

Bob converts the fixed-format RPG to modern free-format ILE RPG.
runs the **Code for IBM i** compile action for ILE RPG, triggering a `CRTBNDRPG` command on your LPAR. Watch the output in the terminal panel. 
  ```
   > CRTBNDRPG PGM(FLGHT400/FRS409) SRCFILE(FLGHT400/QRPGSRC) SRCMBR(FRS409)
   Program FRS409 created in library FLGHT400.
   ```

4. Bob will also prompt: **"Confirm Output Member Location** — choose the suggested location. Bob will use all its RPG skills to modernize this source code. Approve the requested tasks.

**Program FLGHT400/FRS409 was created successfully (highest severity: 00).**

### 2c — Review the Modernization Summary

Bob automatically generates a **Modernization Summary Report** in Markdown. It includes:
- What was changed and why
- Lines of code before vs. after
- Opcode-by-opcode conversion notes
- Compilation result

Save this as `FRS409-Modernization-Report.md` in your workspace for documentation.

> ✅ You've just modernized a 30-year-old RPG program to modern free-format ILE RPG — with AI-assisted compilation — in minutes!

> ✅ At the Bottom of the Bob Chat Panel , Click on the 'File Changed' item, see `FRS409.RPGLE` diff. This resulting source is the new FRS409 ILE (RPGLE) program source deriving from the old `FRS409.RPG` OPM program. 

> ✅ In the Object Browser, check the new FRS409.PGM timestamp in `Detail` (right click on the file). Your new program is ready for further testing. 

---

## Exercise 3 — Field Expansion: Adding a New Field to a Screen

**Goal:** Add a new business field — *Total Flight Hours* — to the Flight Maintenance screen, using Bob in IBM i Developer mode.

### 3a — Open the Flight Maintenance Screen

1. In the Object Browser, navigate to `FLGHT400/QDDSSRCD` and open `FRS021DF`.
2. Use the **DDS Previewer** to visualize the current screen layout. Note the existing fields:
   - Flight Number, Day of the Week, From/To City
   - Departure/Arrival Time
   - Mileage, Airline, Seats Available, Ticket Price
3. You want to add a new field: **Total Flight Hours** (numeric, 4 digits) between Mileage and Airline.

### 3b — Ask Bob to Add the New Field

1. With `FRS021DF` open and active in the editor, go to the Bob chat panel (IBM i Developer mode).
2. Type:

   > *"In the flight maintenance screen, add a new field for the total number of flight hours for the airplane. Place it after the Mileage field."*

3. Bob analyzes the DDS source and proposes the changes:
   - A new field `SFLHRS` (e.g. 4 digits, numeric, bound input/output) at line 16
   - A matching label `'Flight Hours. . . . . . . . .'` 
   - Appropriate `COLHDG` and `CHECK(RZ)` keywords

4. Review the diff in the editor. Use **Source Control** (`Ctrl+Shift+G` / `Cmd+Shift+G`) or the inline diff view to see exactly what changed in `FRS021DF`.

5. If the changes look correct, accept and save. You can then deploy and recompile the display file using the Code for IBM i compile action (`CRTDSPF`).

> ✅ Field expansion done — the screen now captures Total Flight Hours, ready for program-level integration.

---

## Exercise 4 — UI Modernization: Generate a React Application

**Goal:** Take the Flight Maintenance 5250 screen and generate a modern React web UI equivalent as a proof-of-concept.

### 4a — Ask Bob to Generate the React App

1. Make sure `FRS021DF` is still open in the editor.
2. In the Bob chat panel (IBM i Developer mode), type:

   > *"Can you modernize this 5250 screen by generating a corresponding React application? Use fake/sample data in the frontend for now — this is a quick proof-of-concept."*

3. Bob generates a React application with:
   - A `FlightMaintenance.jsx` component that mirrors the screen layout
   - Input fields for all DDS fields (Flight Number, Day of Week, From/To City, Departure/Arrival Time, Mileage, Flight Hours, Airline, Seats Available, Ticket Price)
   - Sample hardcoded data for a few flights
   - Basic form validation and a Submit/Cancel button pair

4. Bob creates the files in a `flight-maintenance-ui/` subfolder in your workspace:

   ```
   flight-maintenance-ui/
   ├── src/
   │   ├── App.jsx
   │   ├── FlightMaintenance.jsx
   │   └── sampleData.js
   ├── package.json
   └── index.html
   ```

### 4b — Run the React App

1. Open a terminal in Bob IDE (`Ctrl+\`` / `Cmd+\``).
2. Navigate to the app folder and install dependencies:

   ```bash
   cd flight-maintenance-ui
   npm install
   npm run dev
   ```

3. Open your browser at `http://localhost:5173` (or the port shown in the terminal).
4. You should see the modernized Flight Maintenance form — same fields as the 5250 screen, now in a clean web UI with the sample data pre-populated.

> 💡 This is a starting point. In a real project, you would connect the React app to IBM i via REST APIs or a BFF (Backend For Frontend) service, replacing the sample data with live Db2 for i queries.

> ✅ In just a few prompts, you went from a 1997-era green screen to a modern React UI!

---

## Exercise 5 — Database Optimization

**Goal:** Review a complex SQL query written by a junior developer, validate it, and apply Bob's index advisor to improve performance.

### 5a — Switch to IBM i Database Mode

In the Bob chat panel, use the mode selector to switch to **IBM i Database** mode.

### 5b — Review the Query with Bob

A junior developer wrote the following query to summarize flight bookings per flight per agent. Copy it into the Bob chat using the `/review` slash command:

```sql
/review
-- ============================================================
-- Flight Booking Summary — Per Flight, Per Agent
-- Shows: route details, airline, agent, ticket counts,
--        class breakdown, and ticket price
-- ============================================================
SELECT
    f.FLIGH00001                                    AS FLIGHT_NUMBER,
    f.DEPARTURE                                     AS FROM_CITY,
    f.ARRIVAL                                       AS TO_CITY,
    f.AIRLINES                                      AS AIRLINE,
    f.DAY_O00001                                    AS DAY_OF_WEEK,
    f.DEPAR00002                                    AS DEPARTURE_TIME,
    f.ARRIV00002                                    AS ARRIVAL_TIME,
    f.MILEAGE,
    f.TICKE00001                                    AS TICKET_PRICE,
    f.SEATS00001                                    AS SEATS_AVAILABLE,

    ag.AGENT_NAME,

    COUNT(DISTINCT o.CUSTO00001)                    AS UNIQUE_CUSTOMERS,
    SUM(o.TICKE00001)                               AS TOTAL_TICKETS_SOLD,

    SUM(CASE WHEN o.CLASS = 'F' THEN o.TICKE00001 ELSE 0 END) AS FIRST_CLASS_TICKETS,
    SUM(CASE WHEN o.CLASS = 'B' THEN o.TICKE00001 ELSE 0 END) AS BUSINESS_TICKETS,
    SUM(CASE WHEN o.CLASS = 'E' THEN o.TICKE00001 ELSE 0 END) AS ECONOMY_TICKETS,

    MIN(o.DEPAR00001)                               AS EARLIEST_BOOKING_DATE,
    MAX(o.DEPAR00001)                               AS LATEST_BOOKING_DATE

FROM FLGHT400/FLIGHTS       f
JOIN FLGHT400/ORDERS        o  ON o.FLIGH00001  = f.FLIGH00001
JOIN FLGHT400/AGENTS        ag ON ag.AGENT_NO   = o.AGENT_NO
LEFT JOIN FLGHT400/CUSTOMERS c  ON c.CUSTO00001  = o.CUSTO00001

WHERE o.DEPAR00001 >= CURRENT TIMESTAMP

GROUP BY
    f.FLIGH00001,
    f.DEPARTURE,
    f.ARRIVAL,
    f.AIRLINES,
    f.DAY_O00001,
    f.DEPAR00002,
    f.ARRIV00002,
    f.MILEAGE,
    f.TICKE00001,
    f.SEATS00001,
    ag.AGENT_NAME

ORDER BY
    o.DEPAR00001,
    f.FLIGH00001

FETCH FIRST 100 ROWS ONLY;
```

Bob will review the query and flag several observations, for example:
- ⚠️ The `ORDER BY o.DEPAR00001` references a non-grouped, non-aggregated column — this may cause unexpected ordering or an error in strict SQL mode
- ⚠️ The `LEFT JOIN` on `CUSTOMERS` is declared but `c.*` columns are never selected — it is unused and adds unnecessary overhead
- ✅ The `CASE`-based class breakdown is correct
- ✅ `FETCH FIRST 100 ROWS ONLY` is good practice for large datasets
- 💡 Suggestion: use column aliases in the `GROUP BY` for readability (DB2 for i supports this)

### 5c — Run the Index Advisor

Still in IBM i Database mode, ask Bob:

> *"Can you run the index advisor for this query and suggest what indexes should be created to improve its performance?"*

Bob will:
1. Submit the query to the **Db2 for i Index Advisor** (via the `SYSDUMMY1` virtual table and Index Advisor services)
2. Analyze the query access plan
3. Recommend indexes, for example:
   - An index on `ORDERS(FLIGH00001, DEPAR00001)` to optimize the join and `WHERE` filter
   - An index on `ORDERS(AGENT_NO)` to speed up the join to `AGENTS`
4. Optionally generate the `CREATE INDEX` DDL statements for you to review and apply

> ✅ You've validated, improved, and optimized a SQL query — without needing to be a Db2 expert!

---

## Exercise 6 — Ask Bob About Your System

**Goal:** Use Bob in IBM i Developer mode to answer system-level questions using two natural language prompts.

Switch back to **IBM i Developer** mode and try these prompts:

**Prompt 1:**
> *"What jobs are currently active on the system and which ones are consuming the most CPU?"*

Bob will query the system performance views (e.g. `QSYS2.ACTIVE_JOB_INFO`) and return a summary of active jobs with CPU utilization — giving you an instant health check on your LPAR.

**Prompt 2:**
> *"Which programs in the FLGHT400 library have not been recompiled in the last 5 years?"*

Bob will query `QSYS2.OBJECT_STATISTICS` filtering on object type `*PGM` in `FLGHT400`, compare the `LAST_USED_TIMESTAMP` or `OBJCREATED` attributes, and list the stale programs — perfect input for a modernization backlog.

---

## Summary

Congratulations! In this lab you:

| Exercise | What You Did |
|---|---|
| **Setup** | Restored the FLIGHT400 application onto IBM i from a save file |
| **Exercise 1** | Generated architecture docs and an ERD with Bob |
| **Exercise 2** | Explained and modernized OPM RPG `FRS409` to free-format ILE RPG |
| **Exercise 3** | Added a new field to a 5250 display file with Bob's help |
| **Exercise 4** | Generated a React UI from a classic green-screen definition |
| **Exercise 5** | Reviewed and optimized a SQL query using Bob's database tools |
| **Exercise 6** | Queried your IBM i system using natural language |

> **Next steps:** Explore connecting the React app to live IBM i data via a Node.js or Java REST API, or dive deeper into the RPG modernization workflow for the other FLIGHT400 programs.
