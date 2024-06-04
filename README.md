# 指南
## 部署

如果直接使用 `.load src/relay.lua` 部署会由于无法找到lsqlite3的依赖而报错，需要引入ao社区的`sqlite3` module到process来使用此依赖。

#### 较为简单的实现方式

```bash
aos relay_test --module=GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0
```
通过上述操作启动一个支持sqlite3模组的名为 "relay_test" 进程，其中 `GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0` 为sqlite3模组的id。

参考文档:

1. [aos-sqlite Github](https://github.com/permaweb/aos-sqlite)
2. [AOS-Sqlite Workshop](https://hackmd.io/@ao-docs/rkM1C9m40)

## 运行

将relay.lua加载至process之后，向此process发送不同的Action实现不同的nostr操作。
```bash
Send({Target = ao.id, Data = "", Action = "EVENT"})
```
```bash
Send({Target = ao.id, Data = "", Action = "REQ"})
```
其中 `Target` 为实际部署的process地址，上述为部署自身process操作时的情况， `Data` 目前为相应的event或者filters的base64编码后的内容。