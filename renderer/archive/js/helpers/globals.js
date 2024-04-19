let isDev = true
fileName = store.get("app.fileName") ? store.get("app.fileName") : undefined
fromLine = 0

folder = isDev
    ? "/Users/vincent/Documents/Development/PoC/03-elitist/03-logs"
    : require("os").homedir() +
        "\\Saved Games\\Frontier Developments\\Elite Dangerous\\";
