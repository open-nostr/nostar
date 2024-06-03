local json = require("json")
local sqlite3 = require("lsqlite3")

DB = DB or sqlite3.open_memory()

DB:exec [[
  CREATE TABLE IF NOT EXISTS events (
    event_id bytea PRIMARY KEY,
    kind integer NOT NULL,
    pubkey bytea NOT NULL,
    created_at timestamp NOT NULL,
    content text NOT NULL,
    tags jsonb NOT NULL,
    signature bytea NOT NULL
  );
]]

Handlers.add("Query", Handlers.utils.hasMatchingTag("Action", "REQ"), function(msg)
  local params = json.decode(msg.Data)
  -- Get filters from params
  -- Query DB by filters
  -- Return results
end)

Handlers.add("Publish", Handlers.utils.hasMatchingTag("Action", "EVENT"), function(msg)
  local params = json.decode(msg.Data)
  -- Insert event into DB
end)
