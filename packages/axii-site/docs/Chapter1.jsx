/** @jsx createElement */
import { createElement, ref, computed } from 'axii'

export const text = `
# AXII 组件基本概念
## 使用 Reactive Data。
 - 使用 ref 来创建 string/number/boolean 等非对象数据。如果对象数据不需要深度监听，也可以使用 ref。
 - ref 创建的数据要使用 .value 来取值。但是可以直接绑定到 form 组件上，AXII 会自动识别。 
 - 使用 reactive 创建对象类型的 reactive 数据，可以把对象的局部绑定到组件上。
 - 数据可以可以直接操作。视图会自动更新。

 - 使用 computed 创建计算数据。计算数据会自动监听内部依赖的数据，并进行更新。
 - 不可以直接修改 computed 创造出来的数据。

## AXII 实现了局部跟新
视图的每个节点只当自己绑定的 reactive 数据变化时才会局部变化。
如果没有外部引起的变化，那么组件函数只会执行一次。 
`

export function Code() {
  const firstName = ref('')
  const lastName = ref('')
  const fullName = computed(() => `${firstName.value}-${lastName.value}`)

  const setFirstName = (e) => {
    firstName.value = e.target.value
  }

  const setLastName = (e) => {
    lastName.value = e.target.value
  }

  return (
    <div>
      <input value={firstName} placeholder="firstName" onInput={setFirstName}/>
      <input value={lastName} placeholder="lastName" onInput={setLastName}/>
      <div>Hello, {fullName}.</div>
    </div>
  )
}

