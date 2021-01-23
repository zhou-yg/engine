# Diff 的高级使用

"diff" 可以看做是一种框架提供出来的能力。这种能力在"数据驱动、结构化描述功能的场景下有大作用"。
例如很多绘图框架提供的都是命令式的 api、addNode/addEdge 等。当我们希望实现"业务数据驱动->绘图"，并且始终遵循"单项数据流"、并且希望"保障性能"的时候，
diff 就能帮忙找到每次业务数据的结构变化，然后通过对"变化"的部分调用"命令式 api"来实现修改，并且保障性能。
 
"业务数据驱动"这种场景应该是目前研发的主流。因为在这个产经下，我们只需要描述"映射关系就够了"，这是一种对中间可能出现的操作状态的"归纳"和省略，
带来了逻辑上的便利，也保障了一致性。