# Reactive

## 天然的性能问题

isCurrent 这个例子演示了 Reactive 必定存在的性能问题。reactive 的计算方式是站在"局部"来计算，整个计算过程是由 reactive 系统控制的，
这个控制就是使用的"遍历"。
为什么手动命令式地实现 isCurrent 没有问题呢？因为我们通常会建立中间结构来保存 item 和 current 的标志，快速地招到新的 item。实际上
是把"遍历"改成了哈希查找。这是第一个性能有差异的地方。第二个是从全局可以更好地利用"已知"规律，例如 isCurrent 肯定只有一个，于是及时
我在全局使用遍历的方式，找到一个后立即 break，也可以提升性能。

手动地写法可以有全局作用于能建立这个中间结构，但是从"局部"描述没有。

局部描述更符合人类思维。因为我们本身的多思考方式和"人脑算力"就难以从全局理解事物，从局部"自身"来推演更佳容易。

## 不便于表达的 computed

有时候会存在 computed 不方便表单的情况。例如 skill 是 atom，lastHasIdSkill 是基于 skill 的 computed，
想要表达的是上一次 有 id 的 skill，因为 skill 可能是新的没 id，也可能是从已有列表中选出来的，有 id。
这时候 lastHasIdSkill 的 computed 就不好写了，至少需要在 computed computation 中读取上一次的值，
判断如果当前 skill 没有 id，就仍然取上一次的值。
这是有副作用的 computed，怎么看待这个问题？？？？
