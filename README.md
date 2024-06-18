![Image Description](https://image.nostr.build/4bd8a4f41dc7aace829c15b2a7652118507f3b64a9a93ff8cd226ebcbc87b15d.png)
For the demo website can check: https://open-nostr.github.io/nostar/#/relayTest

Nostar, a combination of "Nostr" and "AR(AO)," may not be the best name, but it represents a significant evolution in our protocol.

Our team has been working on the Nostr protocol for about a year. We've discovered that the client-relay model can sometimes be unstable, leading to data synchronization issues. For a long time, we've been contemplating how to integrate a consensus layer into Nostr.

Thanks to AO, we can now spawn processes and load relay logic onto them. The advantages of this approach include:

Permanent event storage.
Enhanced relay capabilities. For instance, relays can outsource keyword searches to search engines operating on AO.
Improved event ordering, as SU can order events instead of relying on sender timestamps.
These are just a few benefits. We can even develop a client on AO.

Nostr as a data processing protocol combined with AO as infrastructure is a game-changer!

## Deployment

Direct deployment using `.load src/relay.lua` may cause errors due to the missing dependency `lsqlite3`. It is necessary to introduce the `sqlite3` module from the AO community to utilize this dependency.

#### A simpler implementation method:

```bash
aos relay_test --module=GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0
```
By executing the above command, a process named "relay_test" that supports the sqlite3 module is started, where `GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0` is the ID of the sqlite3 module.

Reference documents:

1. [aos-sqlite Github](https://github.com/permaweb/aos-sqlite)
2. [AOS-Sqlite Workshop](https://hackmd.io/@ao-docs/rkM1C9m40)

## Running

After loading `relay.lua` into the process, different Nostr actions can be performed by sending various actions to this process:
```bash
.load .relay.lua
```
```bash
Send({Target = ao.id, Data = "", Action = "EVENT"})
```
```bash
Send({Target = ao.id, Data = "", Action = "REQ"})
```
In the above commands, `Target` represents the address of the deployed process, `Data` currently contains the base64 encoded content of the corresponding event or filters.

## Querying with Base64 Encoding Example

To send queries or commands, the `Data` field needs to contain the base64 encoded content of the corresponding event or filters. Below is a specific example of how to format the data:

**Original JSON for Filter**:
```json
[{
  "authors": [
    "a8171781fd9e90ede3ea44ddca5d3abf828fe8eedeb0f3abb0dd3e563562e1fc"
  ],
  "kinds": [1]
}]
```

**Base64 Encoded Version**:
```
W3sKICAiYXV0aG9ycyI6IFsKICAgICJhODE3MTc4MWZkOWU5MGVkZTNlYTQ0ZGRjYTVkM2FiZjgyOGZlOGVlZGViMGYzYWJiMGRkM2U1NjM1NjJlMWZjIgogIF0sCiAia2luZHMiOiBbMV0KfV0=
```

**Command to Send**:
```bash
Send({Target = ao.id, Data = "W3sKICAiYXV0aG9ycyI6IFsKICAgICJhODE3MTc4MWZkOWU5MGVkZTNlYTQ0ZGRjYTVkM2FiZjgyOGZlOGVlZGViMGYzYWJiMGRkM2U1NjM1NjJlMWZjIgogIF0sCiAia2luZHMiOiBbMV0KfV0=", Action = "EVENT"})
```

This command sends a request to the process using the base64 encoded data. The `Target` specifies the address of the deployed process, and the `Action` sets the type of Nostr action to perform.

