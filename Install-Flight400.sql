-- =============================================================================
-- Install-Flight400.sql
-- Restores the FLGHT400 library from a save file and transfers ownership.
--
-- Prerequisites:
--   Upload FLGHT400.FILE to the IFS before running.--
-- Run in: ACS Run SQL Scripts  or  VS Code SQL Runner
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CONFIGURATION - edit these values before running
-- -----------------------------------------------------------------------------
-- IFS path where FLGHT400.FILE was uploaded
-- v_ifs_path   = '/home/BENOIT/builds/Flight400-demo/FLIGHT74.FILE'
--
-- Target library name where the save file will be restored (max 10 chars)
-- v_rst_lib    = 'FLGHT400'
--
-- Owner of the restored library (max 10 chars, uppercase).
-- Leave v_owner as NULL to use the session user (CURRENT_USER) automatically.
-- Set it explicitly to override, e.g.: DEFAULT 'MYPROFILE'
-- v_owner      = NULL   -> resolves to CURRENT_USER at runtime
-- -----------------------------------------------------------------------------

---- Initial version: 
---- 0. Delete Save File if necessary 
--CL: DLTOBJ OBJ(QGPL/FLIGHT400) OBJTYPE(*FILE);
---- 1. Create the save file
-- CL: CRTSAVF FILE(QGPL/FLIGHT400);
---- 2. Copy the save file from IFS into QSYS (fixed quoting)
-- CL: CPYFRMSTMF FROMSTMF('/home/U5MGOZD/builds/Flight400-demo/FLGHT400.FILE')  TOMBR('/QSYS.LIB/QGPL.LIB/FLIGHT400.FILE') MBROPT(*REPLACE);                          
---- 3. Restore the library from the save file
-- CL: RSTLIB SAVLIB(FLGHT400) DEV(*SAVF) SAVF(QGPL/FLIGHT400); 
---- End initial version.

BEGIN
  -- configurable variables ** edit these before running **
  DECLARE v_ifs_path  VARCHAR(256) DEFAULT '/home/BENOIT/builds/Flight400-demo/FLIGHT74.FILE'; -- path in the IFS (IBM i)
  DECLARE v_rst_lib   VARCHAR(10)  DEFAULT 'FLGHT400'; -- target library name after restore
  DECLARE v_owner     VARCHAR(10)  DEFAULT NULL; -- set to a profile name to override; NULL = use CURRENT_USER

  -- working variables
  DECLARE v_new_owner VARCHAR(10);
  DECLARE v_exists    INT          DEFAULT 0;
  DECLARE v_cmd       VARCHAR(512);

  -- ignore CPF223A: some QSYS objects cannot have owner changed - that is expected
  DECLARE CONTINUE HANDLER FOR SQLSTATE '38501' BEGIN END;

  -- resolve owner: use explicit override if provided, otherwise fall back to session user
  IF v_owner IS NOT NULL AND TRIM(v_owner) <> '' THEN
    SET v_new_owner = LEFT(TRIM(v_owner), 10);
  ELSE
    SET v_new_owner = LEFT(CURRENT_USER, 10);
  END IF;

  -- ==========================================================================
  -- Step 1: Create the save file in QGPL (skip if it already exists)
  -- ==========================================================================
  SELECT COUNT(*) INTO v_exists
  FROM TABLE(QSYS2.OBJECT_STATISTICS('QGPL', '*FILE', 'FLIGHT400')) AS x;

  IF v_exists = 0 THEN
    CALL QSYS2.QCMDEXC('CRTSAVF FILE(QGPL/FLIGHT400)');
  END IF;

  -- ==========================================================================
  -- Step 2: Copy the save file from the IFS into QSYS
  --         MBROPT(*REPLACE) overwrites safely on re-run
  -- ==========================================================================
  SET v_cmd =
    'CPYFRMSTMF FROMSTMF(''' CONCAT TRIM(v_ifs_path) CONCAT
    ''') TOMBR(''/QSYS.LIB/QGPL.LIB/FLIGHT400.FILE'') MBROPT(*REPLACE)';
  CALL QSYS2.QCMDEXC(v_cmd);

  -- ==========================================================================
  -- Step 3: Restore the library (skip if it already exists)
  -- ==========================================================================
  SELECT COUNT(*) INTO v_exists
  FROM TABLE(QSYS2.OBJECT_STATISTICS('QSYS', '*LIB', v_rst_lib)) AS x;

  IF v_exists = 0 THEN
    SET v_cmd =
      'RSTLIB SAVLIB(FLGHT400) DEV(*SAVF) SAVF(QGPL/FLIGHT400) RSTLIB(' CONCAT TRIM(v_rst_lib) CONCAT ')';
    CALL QSYS2.QCMDEXC(v_cmd);
  ELSE
    SIGNAL SQLSTATE '01000'
      SET MESSAGE_TEXT = 'Target library already exists - RSTLIB skipped. Drop it first to force a full restore.';
  END IF;

  -- ==========================================================================
  -- Step 4: Transfer ownership - library + all objects inside
  --         First call: the library object itself
  --         Second call: everything inside, SUBTREE(*ALL) recurses into files/members
  -- ==========================================================================
  SET v_cmd =
    'CHGOWN OBJ(''/QSYS.LIB/' CONCAT TRIM(v_rst_lib) CONCAT '.LIB'') NEWOWN(' CONCAT TRIM(v_new_owner) CONCAT ')';
  CALL QSYS2.QCMDEXC(v_cmd);

  SET v_cmd =
    'CHGOWN OBJ(''/QSYS.LIB/' CONCAT TRIM(v_rst_lib) CONCAT '.LIB/*'') NEWOWN(' CONCAT TRIM(v_new_owner) CONCAT ') SUBTREE(*ALL)';
  CALL QSYS2.QCMDEXC(v_cmd);

END;

-- =============================================================================
-- Verification - paste the SELECT below into ACS Run SQL Scripts separately
-- It should return 0 rows when ownership transfer is complete
-- =============================================================================
-- SELECT OBJNAME, OBJTYPE, OBJOWNER
-- FROM TABLE(QSYS2.OBJECT_STATISTICS('FLGHT400', '*ALL')) AS x   -- replace FLGHT400 with your v_rst_lib value
-- ORDER BY OBJTYPE, OBJNAME;
