local json = require("json")
local base64 = require(".base64")
local sqlite3 = require("lsqlite3")

DB = DB or sqlite3.open_memory()

DB:exec [[
  CREATE TABLE IF NOT EXISTS events (
    id blob PRIMARY KEY,
    kind integer NOT NULL,
    pubkey blob NOT NULL,
    created_at integer NOT NULL,
    content text NOT NULL,
    tags jsonb NOT NULL,
    sig blob NOT NULL
  );
]]

local function fromhex(hexstr)
  local str = hexstr:gsub("..", function(cc)
    return string.char(tonumber(cc, 16))
  end)
  return str
end

local function blob_to_hex(blob)
  return (blob.gsub(blob, ".", function(c)
      return string.format("%02x", string.byte(c))
  end))
end

local function query(stmt)
  local rows = {}
  for row in stmt:nrows() do
    -- change blob to hexstr 
    row.id = blob_to_hex(row.id)
    row.pubkey = blob_to_hex(row.pubkey)
    row.sig = blob_to_hex(row.sig)
    row.tags = json.decode(row.tags)
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
  -- preprocess message
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
  if type(event) ~= 'table' then
    print('Failed to decode event JSON')
    ao.send({
      Target = msg.From,
      Action = "ERROR",
      Data = "Failed to decode event JSON"
    })
    return
  end
  
  -- Insert event into DB
  local stmt = DB:prepare [[
    REPLACE INTO events (id, kind, pubkey, created_at, content, tags, sig)
    VALUES (:id, :kind, :pubkey, :created_at, :content, :tags, :sig);
  ]]

  if not stmt then
    error("Failed to prepare publish statement" .. DB:errmsg())
    ao.send({
      Target = msg.From,
      Action = "ERROR",
      Data = "Failed to publish statement"
    })
  end

  stmt:bind_names({
    id = fromhex(event.id),
    kind = event.kind,
    pubkey = fromhex(event.pubkey),
    created_at = event.created_at,
    content = event.content,
    tags = json.encode(event.tags),
    sig = fromhex(event.sig)
  })

  stmt:step()
  stmt:reset()
  print('Event published')
  ao.send({
    Target = msg.From,
    Data = "['OK', " .. event.id .. "]"
  })
end)
