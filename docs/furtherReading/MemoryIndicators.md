# 内存指标

一般而言，应用中存在一些全局性的对象是正常的，而且在正常的使用中，变量都会自动释放回收。但是也会存在一些我们认为会回收但是却没有被回收的对象，这会导致内存占用无限增长。一旦增长达到V8的内存限制，将会得到内存溢出错误，进而导致进程退出。

## 查看内存使用情况

前面我们提到了process.memoryUsage()可以查看内存使用情况。除此之外，os模块中的totalmem()和freemem()方法也可以查看内存使用情况。

#### 1.查看进程的内存占用

调用process.memoryUsage()可以看到Node进程的内存占用情况，示例代码如下：

```javascript
> process.memoryUsage()
{ rss: 22904832,
  heapTotal: 9682944,
  heapUsed: 5424960,
  external: 8858 }
```
rss是resident set size的缩写，即进程的常驻内存部分。进程的内存总共有几部分，一部分是rss，其余部分在交换区(swap)或者文件系统(filesystem)中。
除了rss外，heapTotal和heapUsed对应的是V8的堆内存信息。heapTotal是堆中总共申请的内存量，heapUsed表示目前堆中使用中的内存量。这3个值的单位都是字节。

为了更好地查看效果，我们格式化一下输出结果：

```javascript
var showMem = function () {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  console.log('Process: heapTotal ' + format(mem.heapTotal) +' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
  console.log('----------------------------------------------');
};
```
同时，写一个方法用于不停地分配内存但不释放内存，相关代码如下：

```javascript
var useMem = function () {
  var size = 20 * 1024 * 1024;
  var arr = new Array(size);
  for (var i = 0; i < size; i++) {
    arr[i] = 0;
  }
  return arr;
};
var total = [];
for (var j = 0; j < 15; j++) {
  showMem();
  total.push(useMem());
}
showMem();
```
将以上代码存为outOfMemory.js并执行它，得到的输出结果如下：

```javascript
Process: heapTotal 6.23 MB heapUsed 3.82 MB rss 19.36 MB
----------------------------------------------
Process: heapTotal 168.25 MB heapUsed 164.52 MB rss 180.99 MB
----------------------------------------------
Process: heapTotal 328.26 MB heapUsed 324.52 MB rss 341.39 MB
----------------------------------------------
Process: heapTotal 488.27 MB heapUsed 484.53 MB rss 501.91 MB
----------------------------------------------
Process: heapTotal 648.28 MB heapUsed 644.53 MB rss 662.30 MB
----------------------------------------------
Process: heapTotal 808.29 MB heapUsed 804.53 MB rss 822.65 MB
----------------------------------------------
Process: heapTotal 968.30 MB heapUsed 964.53 MB rss 983.00 MB
----------------------------------------------
Process: heapTotal 1130.32 MB heapUsed 1123.70 MB rss 1143.85 MB
----------------------------------------------
Process: heapTotal 1290.33 MB heapUsed 1283.70 MB rss 1304.19 MB
----------------------------------------------
......
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```
可以看到，每次调用useMem都导致了3个值的增长。在接近1500 MB的时候，无法继续分配内存，然后进程内存溢出了，连循环体都无法执行完成，仅执行了8次。

#### 2.查看系统的内存占用

与process.memoryUsage()不同的是，os模块中的totalmem()和freemem()这两个方法用于查看操作系统的内存使用情况，它们分别返回系统的总内存和闲置内存，以字节为单位。示例代码如下：

```javascript
> os.totalmem()
8580620288
> os.freemem()
3807412224
```
从输出的信息可以看到我的电脑的总内存为8GB，当前闲置的内存大致为3.5GB。


## 堆外内存

通过process.memoryUsage()的结果可以看到，堆中的内存用量总是小于进程的常驻内存用量，这意味着Node中的内存使用并非都是通过V8进行分配的。我们将那些不是通过V8分配的内存称为堆外内存。

这里我们将前面的useMem()方法稍微改造一下，将Array变为Buffer，将size变大，每一次构造200MB的对象，相关代码如下：

```javascript
var useMem = function () {
  var size = 200 * 1024 * 1024;
  var buffer = new Buffer(size);
  for (var i = 0; i < size; i++) {
    buffer[i] = 0;
  }
  return buffer;
};
```
重新执行该代码，得到的输出结果如下所示：

```javascript
Process: heapTotal 6.23 MB heapUsed 3.82 MB rss 19.38 MB
----------------------------------------------
Process: heapTotal 8.23 MB heapUsed 4.73 MB rss 221.38 MB
----------------------------------------------
Process: heapTotal 8.23 MB heapUsed 4.74 MB rss 422.06 MB
----------------------------------------------
Process: heapTotal 10.23 MB heapUsed 4.26 MB rss 622.88 MB
----------------------------------------------
Process: heapTotal 10.23 MB heapUsed 4.27 MB rss 823.28 MB
----------------------------------------------
Process: heapTotal 10.23 MB heapUsed 4.03 MB rss 1023.71 MB
----------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 1224.61 MB
----------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 1425.00 MB
----------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 1625.40 MB
----------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.84 MB rss 1825.79 MB
----------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 2026.20 MB
----------------------------------------------
Process: heapTotal 11.23 MB heapUsed 3.85 MB rss 2226.59 MB
----------------------------------------------
Process: heapTotal 8.23 MB heapUsed 3.84 MB rss 2425.51 MB
----------------------------------------------
Process: heapTotal 8.23 MB heapUsed 3.84 MB rss 2625.90 MB
----------------------------------------------
Process: heapTotal 8.23 MB heapUsed 3.84 MB rss 2826.30 MB
----------------------------------------------
Process: heapTotal 8.23 MB heapUsed 3.84 MB rss 3026.20 MB
----------------------------------------------
```
我们看到15次循环都完整执行，并且三个内存占用值与前一个示例完全不同。在改造后的输出结果中，heapTotal与heapUsed的变化极小，唯一变化的是rss的值，并且该值已经远远超过V8的限制值。这其中的原因是Buffer对象不同于其他对象，它不经过V8的内存分配机制，所以也不会有堆内存的大小限制。

**这意味着利用堆外内存可以突破内存限制的问题。**

为何Buffer对象并非通过V8分配？这在于Node并不同于浏览器的应用场景。在浏览器中，Javascript直接处理字符串即可满足绝大多数的业务需求，而Node则需要处理网络流和文件I/O流，操作字符串远远不能满足传输的性能需求。

## 总结

从上面的介绍可以得知，Node的内存构成主要由通过V8进行分配的部分和Node自行分配的部分。受V8的垃圾回收限制的主要是V8的堆内存。