local json = require("json")
local base64 = require(".base64")
local sqlite3 = require("lsqlite3")

DB = DB or sqlite3.open_memory()

DB:exec [[
  CREATE TABLE IF NOT EXISTS events (
    id blob PRIMARY KEY,
    kind integer NOT NULL,
    pubkey blob NOT NULL,
    created_at timestamp NOT NULL,
    content text NOT NULL,
    tags jsonb NOT NULL,
    sig blob NOT NULL
  );
]]

local function query(stmt)
  local rows = {}
  for row in stmt:nrows() do
    table.insert(rows, row)
  end
  stmt:reset()
  return rows
end

Handlers.add("Query", Handlers.utils.hasMatchingTag("Action", "REQ"), function(msg)
  print('Query:' .. msg.Data)
  local decoded = base64.decode(msg.Data)
  print('Decoded:' .. decoded)
  if decoded == nil then
    print('Failed to decode message')
    ao.send({
      Target = msg.From,
      Action = "ERROR",
      Data = "Failed to decode message"
    })
    return
  end
  print('type of decoded:' .. type(decoded))
  local params = json.decode(decoded)
  print('type of params:' .. type(params))
  -- Get filters from params
  -- parmas JSON Schema:
  -- [{
  --   "ids": <a list of event ids>,
  --   "authors": <a list of lowercase pubkeys, the pubkey of an event must be one of these>,
  --   "kinds": <a list of a kind numbers>,
  --   "#<single-letter (a-zA-Z)>": <a list of tag values, for #e — a list of event ids, for #p — a list of pubkeys, etc.>,
  --   "since": <an integer unix timestamp in seconds, events must be newer than this to pass>,
  --   "until": <an integer unix timestamp in seconds, events must be older than this to pass>,
  --   "limit": <maximum number of events relays SHOULD return in the initial query>
  -- }, {filters2}, ...]

  for _, filter in ipairs(params) do
    print('Get events by filter:' .. filter)
    print('ids:' .. filter.ids)
    print('authors:' .. filter.authors)
    print('kind:s' .. filter.kinds)
    print('since:' .. filter.since)
    -- print('until:'.. filter.until)
    print('limit:' .. filter.limit)
  end

  -- Query DB by filters
  local stmt = DB:prepare [[
    SELECT * FROM events;
  ]]
  if stmt == nil then
    print('Failed to prepare query')
    ao.send({
      Target = msg.From,
      Action = "ERROR",
      Data = "Failed to prepare query"
    })
    return
  end
  local results = query(stmt)
  print('size of results:' .. #results)
  for _, row in ipairs(results) do
    print('Row:' .. row.id)
  end

  -- Return results
  local response = json.encode(results)
  print('Response:' .. response)
  local encoded = base64.encode(response)
  ao.send({
    Target = msg.From,
    Action = "EVENT",
    Data = encoded
  })
  ao.send({
    Target = msg.From,
    Action = "EOSE",
    Data = ""

  })
end)

Handlers.add("Publish", Handlers.utils.hasMatchingTag("Action", "EVENT"), function(msg)
  local decoded = base64.decode(msg.Data)
  print('Decoded:' .. decoded)
  if decoded == nil then
    print('Failed to decode message')
    ao.send({
      Target = msg.From,
      Action = "ERROR",
      Data = "Failed to decode message"
    })
    return
  end
  print('type of decoded:' .. type(decoded))
  local event = json.decode(decoded)
  print('type of event:' .. type(event))
  -- Insert event into DB
  print('type of all the fields:' ..
  type(event.id) ..
  type(event.kind) ..
  type(event.pubkey) .. type(event.created_at) .. type(event.content) .. type(event.tags) .. type(event.sig))

  -- local stmt = DB:prepare [[
  --   REPLACE INTO events (id, kind, pubkey, created_at, content, tags, sig)
  --   VALUES (?, ?, ?, ?, ?, ?, ?);
  -- ]]

  -- if not stmt then
  --   error("Failed to prepare publish statement" .. DB:errmsg())
  -- end

  -- -- stmt:bind_names({
  -- --   id = fromhex(event.id),
  -- --   kind = event.kind,
  -- --   pubkey = fromhex(event.pubkey),
  -- --   created_at = os.date("!%Y-%m-%d %H:%M:%S", event.created_at),
  -- --   content = event.content,
  -- --   tags = json.encode(event.tags),
  -- --   sig = fromhex(event.sig)
  -- -- })
  -- stmt:bind(1, fromhex(event.id))
  -- stmt:bind(2, event.kind)
  -- stmt:bind(3, fromhex(event.pubkey))
  -- stmt:bind(4, os.date("!%Y-%m-%d %H:%M:%S", event.created_at))
  -- stmt:bind(5, event.content)
  -- stmt:bind(6, json.encode(event.tags))
  -- stmt:bind(7, fromhex(event.sig))

  -- stmt:step()
  -- stmt:reset()
  -- print('Event published')
end)
