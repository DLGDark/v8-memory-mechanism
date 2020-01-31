# 高效使用内存

在 V8 面前，开发者所要具备的责任是如何让垃圾回收机制更高效地工作。

## 作用域

提到如何触发垃圾回收，第一个要介绍的是作用域(scope)。在 Javascript 中能形成作用域的有**函数调用**、**with**以及**全局作用域**。

以如下代码为例：

```javascript
var foo = function() {
  var local = {};
};
```

foo()函数在每次被调用时会创建对应的作用域，函数执行结束后，该作用域将会销毁。同时作用域中声明的局部变量分配在该作用域上，随作用域的销毁而销毁。只被局部变量引用的对象存活周期较短。在这个示例中，由于对象非常小，将会分配在新生代中的 From 空间中。在作用域释放后，局部变量 local 失效，其引用的对象将会在下次垃圾回收时被释放。

以上就是最基本的内存回收过程。

#### 1.标识符查找

与作用域相关的即是标识符查找。所谓标识符，可以理解为变量名。在下面的代码中，执行bar()函数时，将会遇到 local 变量：

```javascript
var bar = function() {
  console.log(local);
};
```

Javascript 在执行时会去查找该变量定义在哪里。它最先查找的是当前作用域，如果在当前作用域中无法找到该变量的声明，将会向上级的作用域里查找，直到查到为止。

#### 2.作用域链

在下面代码中：

```javascript
var foo = function () {
  var local = 'local var';
  var bar = function () {
    var local = 'another var';
    var baz = function () {
      console.log(local);
    };
    baz();
  };
  bar();
};
foo();
```
local变量在baz()函数形成的作用域里查找不到，继而将在bar()的作用域里寻找。如果去掉上述代码bar()中的local声明，将会继续向上查找，一直到全局作用域。这样的查找方式使得作用域像一个链条。由于标识符的查找方向是向上的，所以变量只能向外访问，而不能向内访问。

下图为变量在作用域中的查找示意图：

![scopeChain](/v8-memory-mechanism/expand/scopeChain.png)

当我们在baz()函数中访问local变量时，由于作用域中的变量列表中没有local，所以会向上一个作用域中查找，接着会在bar()函数执行得到的变量列表中找到了一个local变量的定义，于是使用它。尽管在再上一层的作用域中也存在local的定义，但是不会继续查找了。如果查找一个不存在的变量，将会一直沿着作用域链查找到全局作用域，最后抛出未定义错误。

了解了作用域，有助于我们了解变量的分配和释放。

#### 3.变量的主动释放

如果变量是全局变量(不通过var声明或定义在global变量上)，由于**全局作用域需要直到进程退出才能释放**，此时将导致引用的对象常驻内存(常驻在老生代)。如果需要释放常驻内存的对象，**可以通过delete操作来删除引用关系。或者将变量重新赋值，让旧的对象脱离引用关系**。在接下来的老生代内存清除和整理的过程中，会被回收释放。下面为示例代码：

```javascript
global.foo="I am global object";
console.log(global.foo); // => "I am global object"
delete global.foo;
global.foo=undefined; // or null
console.log(global.foo); // undefined
```
同样，如果在非全局作用域中，想主动释放变量引用的对象，也可以通过这样的方式。虽然delete操作和重新赋值具有相同的效果，但是在V8中通过delete删除对象的属性有可能干扰V8的优化，所以**通过赋值的方式解除引用更好**。


## 闭包

我们知道作用域链上的对象访问只能向上，这样外部无法向内部访问。如下代码可以正常打印：

```javascript
var foo = function () {
  var local = "局部变量";
  (function () {
    console.log(local);
  }());
};
```
但在下面的代码中，却会得到local未定义的异常：

```javascript
var foo = function () {
  (function () {
    var local = "局部变量";
  }());
  console.log(local);
};
```
在Javascript中，**实现外部作用域访问内部作用域中变量的方法叫做闭包**。这得益于*高阶函数的特性*：**函数可以作为参数或者返回值**。示例代码如下：

```javascript
var foo=function(){
  var bar=function(){
    var local="局部变量";
    return function(){
      return local;
    };
  };
  var baz=bar();
  console.log(baz());
};
```
一般而言，在bar()函数执行完成后，局部变量local将会随着作用域的销毁而被回收。但是注意这里的特点在于返回值是一个匿名函数，且这个函数中具备了访问local的条件。虽然在后续的执行中，在外部作用域中还是无法直接访问local，但是若要访问它，只要通过这个中间函数稍作周转即可。

闭包是Javascript的高级特性，利用它可以产生很多巧妙的效果。它的问题在于，一旦有变量引用这个中间函数，这个中间函数将不会释放，同时也会使原始的作用域不会得到释放，作用域中产生的内存占用也不会得到释放。除非不再有引用，才会逐步释放。

## 总结

在正常的Javascript执行中，无法立即回收的内存有**闭包**和**全局变量引用**这两种情况。由于V8的内存限制，要十分小心此类变量是否无限制地增加，因为它会导致老生代中的对象增多。
