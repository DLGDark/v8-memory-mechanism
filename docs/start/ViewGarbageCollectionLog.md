# 查看垃圾回收日志

查看垃圾回收日志的方式主要是在启动时添加 --trace_gc参数。在进行垃圾回收时，将会从标准输出中打印垃圾回收的日志信息。下面是一段示例，执行结束后，将会在gc.log文件中得到所有垃圾回收信息：

node --trace_gc -e "var a = [];for (var i = 0; i < 1000000; i++) a.push(new Array(100));" > gc.log

下面是上面命令执行完成后生成的日志文件内容：

```javascript
[8212:00000000003014C0]       39 ms: Scavenge 2.5 (4.2) -> 2.2 (5.2) MB, 1.0 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]       54 ms: Scavenge 2.7 (5.2) -> 2.7 (6.2) MB, 1.3 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]       96 ms: Scavenge 3.9 (6.2) -> 3.7 (9.2) MB, 0.7 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]       97 ms: Scavenge 5.1 (9.2) -> 5.0 (9.2) MB, 0.8 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]       98 ms: Scavenge 5.6 (9.2) -> 5.6 (15.2) MB, 0.9 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      102 ms: Scavenge 8.9 (15.2) -> 8.9 (15.2) MB, 1.8 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      104 ms: Scavenge 9.5 (15.2) -> 9.3 (27.2) MB, 2.3 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      114 ms: Scavenge 17.0 (28.7) -> 17.1 (28.7) MB, 4.2 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      119 ms: Scavenge 17.5 (28.7) -> 17.1 (52.7) MB, 5.0 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      134 ms: Scavenge 32.5 (52.7) -> 32.9 (52.7) MB, 8.3 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      144 ms: Scavenge 32.9 (52.7) -> 32.1 (68.2) MB, 10.1 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[8212:00000000003014C0]      242 ms: Mark-sweep 127.2 (162.2) -> 124.6 (160.6) MB, 4.1 / 0.0 ms  (+ 2.2 ms in 15 steps since start of marking, biggest step 0.5 ms, walltime since start of marking 39 ms) (average mu = 1.000, current mu = 1.000) finalize incremental marking via stack guard GC in old space requested
[8212:00000000003014C0]      385 ms: Mark-sweep 281.9 (319.6) -> 278.5 (318.2) MB, 2.6 / 0.0 ms  (+ 24.3 ms in 290 steps since start of marking, biggest step 0.8 ms, walltime since start of marking 72 ms) (average mu = 0.814, current mu = 0.814) finalize incremental marking via stack guard GC in old space requested
[8212:00000000003014C0]      702 ms: Mark-sweep 612.5 (658.4) -> 605.1 (650.9) MB, 1.8 / 0.0 ms  (+ 67.6 ms in 660 steps since start of marking, biggest step 1.5 ms, walltime since start of marking 166 ms) (average mu = 0.792, current mu = 0.783) finalize incremental marking via stack guard GC in old space requested
```
通过分析垃圾回收日志，可以了解垃圾回收的运行情况，找出垃圾回收的哪些阶段比较耗时，触发的原因是什么。

通过在Node启动时使用 --prof参数，可以得到V8执行时的性能分析数据，其中包含了垃圾回收执行时占用的时间。下面的代码不断创建对象并将其分配给局部变量a，这里将以下代码存为 test.js文件：

```javascript
for(var i=0; i<1000000; i++){
  var a={};
}
```

然后执行以下命令：

```javascript
node --prof test.js
```

这将会在目录下得到一个V8.log日志文件。内容大致如下(内容过多，只截取了部分内容)：

![v8log](/content/v8log.png)

V8提供了linux-tick-processor工具用于统计日志信息。该工具可以从此链接找到 [linux-tick-processor工具](https://github.com/v8/v8/tree/master/tools)

在linux系统下使用工具命令如下：

```javascript
linux-tick-processor v8.log
```