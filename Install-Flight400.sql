-- =============================================================================
-- Install-Flight400.sql
-- Restores the FLGHT400 library from a save file and transfers ownership.
--
-- Prerequisites:
--   Upload FLGHT400.FILE to the IFS before running.--
-- Run in: ACS Run SQL Scripts  or  VS Code SQL Runner
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CONFIGURATION - edit these two values before running
-- -----------------------------------------------------------------------------
-- IFS path where FLGHT400.FILE was uploaded
-- v_ifs_path  = '/home/BENOIT/builds/Flight400-demo/FLGHT400.FILE'
--
-- Target owner for the library and all its objects (your user profile, max 10 chars)
-- v_new_owner = 'BENOIT'
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
  -- configurable variables ** edit these two values before running ** 
  DECLARE v_ifs_path  VARCHAR(256) DEFAULT '/home/BENOIT/builds/Flight400-demo/FLIGHT74.FILE'; --path in the IFS (IBM i)
  DECLARE v_new_owner VARCHAR(10)  DEFAULT 'BENOIT'; --this is your use profile. 

  -- working variables
  DECLARE v_exists    INT          DEFAULT 0;
  DECLARE v_cmd       VARCHAR(512);

  -- ignore CPF223A: some QSYS objects cannot have owner changed - that is expected
  DECLARE CONTINUE HANDLER FOR SQLSTATE '38501' BEGIN END;

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
  FROM TABLE(QSYS2.OBJECT_STATISTICS('QSYS', '*LIB', 'FLGHT400')) AS x;

  IF v_exists = 0 THEN
    CALL QSYS2.QCMDEXC('RSTLIB SAVLIB(FLGHT400) DEV(*SAVF) SAVF(QGPL/FLIGHT400)');
  ELSE
    SIGNAL SQLSTATE '01000'
      SET MESSAGE_TEXT = 'Library FLGHT400 already exists - RSTLIB skipped. Drop it first to force a full restore.';
  END IF;

  -- ==========================================================================
  -- Step 4: Transfer ownership - library + all objects inside
  --         First call: the library object itself
  --         Second call: everything inside, SUBTREE(*ALL) recurses into files/members
  -- ==========================================================================
  SET v_cmd =
    'CHGOWN OBJ(''/QSYS.LIB/FLGHT400.LIB'') NEWOWN(' CONCAT TRIM(v_new_owner) CONCAT
    ') ';
  CALL QSYS2.QCMDEXC(v_cmd);

  SET v_cmd =
    'CHGOWN OBJ(''/QSYS.LIB/FLGHT400.LIB/*'') NEWOWN(' CONCAT TRIM(v_new_owner) CONCAT
    ') SUBTREE(*ALL) ';
  CALL QSYS2.QCMDEXC(v_cmd);

END;

-- =============================================================================
-- Verification - paste the SELECT below into ACS Run SQL Scripts separately
-- It should return 0 rows when ownership transfer is complete
-- =============================================================================
-- SELECT OBJNAME, OBJTYPE, OBJOWNER
-- FROM TABLE(QSYS2.OBJECT_STATISTICS('FLGHT400', '*ALL')) AS x
-- ORDER BY OBJTYPE, OBJNAME;
