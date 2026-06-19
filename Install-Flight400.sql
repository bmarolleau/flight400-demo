-- Step 1: Upload FLIGHT400.SAVF to the IFS
-- Example location:
-- /tmp/FLIGHT400.SAVF

-- Step 2: Run these commands in ACS Run SQL Scripts
-- or VS Code SQL Runner

-- 0. Delete Save File if necessary 
--CL: DLTOBJ OBJ(QGPL/FLIGHT400) OBJTYPE(*FILE);

-- 1. Create the save file
CL: CRTSAVF FILE(QGPL/FLIGHT400);

-- 2. Copy the save file from IFS into QSYS (fixed quoting)
CL: CPYFRMSTMF FROMSTMF('/home/U5MGOZD/builds/Flight400-demo/FLGHT400.FILE')  TOMBR('/QSYS.LIB/QGPL.LIB/FLIGHT400.FILE') MBROPT(*REPLACE);                          

-- 3. Restore the library from the save file
CL: RSTLIB SAVLIB(FLGHT400) DEV(*SAVF) SAVF(QGPL/FLIGHT400); 