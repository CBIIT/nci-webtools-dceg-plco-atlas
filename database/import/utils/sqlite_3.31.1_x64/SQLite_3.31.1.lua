local version = "3.31.1"
local base = "~/SQLite/" .. version

prepend_path("PATH", pathJoin(base,"bin"))
-- prepend_path("LD_LIBRARY_PATH", pathJoin(base,"lib"))
-- prepend_path("LD_RUN_PATH", pathJoin(base,"lib"))

if (mode() == "load") then
    LmodMessage("[+] Loading SQLite ",version," ...")
end
if (mode() == "unload") then
    LmodMessage("[-] Unloading SQLite ",version," ...")
end
