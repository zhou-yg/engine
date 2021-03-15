/**
 * CAUTION vite 现在不支持直接加载非名为 index 的 jsx 文件。所以只能先占用这个名字。
 * 理论上用 playground.jsx 会更好。
 */
import { createElement, render, reactive, ref, refComputed } from 'axii'
import Menu from './src/menu/Menu'
import useLocation from "./src/hooks/useLocation";
import Split from './src/split/Split'
import './src/style/global.less'
import scen from './src/pattern'
const location = useLocation()

/**
 * 0: form/form-items
 * 1: table/tree/calendar/modal/message
 * 2: menu/breadcrumb/steps/popover/tooltip/timeline
 * 3: button/tag/spin/progress
 *
 * 必须/总数 : 21/33
 * 已完成 : 19/21
 */
const availablePlayground = {
  Form: [
    // 'form', 写到 common hooks 里
    'input', // x
    'checkbox', // x 美化
    'datePicker', // x
    'select', // x
    'cascader', // x
    'upload*', // 3
    // 以上是必须要常用的 7
    'timePicker*',
    'radios',
    'autoComplete*',
    'switch*',
    'richText*', // 试用 quill
  ],
  Data: [
    'table', // x
    'tabs', // x
    'calendar', // x
    'tree',  // 5
    // 以上是常用必须的
    'collapse*',
    'tooltip*',
    'timeline*',
    'tag*',
    'avatar*',
    'badge*'
  ],
  Dialog: [
    // 'modal', 直接使用 useLayer 即可
    'message', // x
    // 以上是常用必须的
    'spin*',
    'alert*',
    'notification*',
    'progress*'
  ],
  Navigation: [
    'menu', // x
    'pagination', // x
      // 以上是常用必须的
    'breadcrumb*',
    'steps*',
    'affix*'
  ],
  Misc: [
    'button', // x
    'icon', // x
  ],
  Layout: [
    'grid*', // 7  row/col 实现
    'split'
  ],
  Utilities: [
    'useForm', // x
    'useLayer', // x
    'usePopover', // x,
    'useRouter', // x,
    'useRequest', // x
    'useLocation', // x
    // 以上是常用必须的
    'useHistory*',  // 整合 history

  ]
}


const MenuWithDisabledStyle = Menu.extend(function disabledStyle(fragments) {
  fragments.root.elements.container.style(() => {
    return {
      fontFamily: 'Andale Mono',
      maxWidth: '100%',
    }
  })

  fragments.item.elements.name.style(({ item, level }) => {
    return {
      color: item.disabled ? scen().interactable().inactive().color() : (level > 0 ? scen().color(-5) : scen().color(5))
    }
  })
})


function Choose() {
  const current = ref(location.query.component)

  const onChange = (next) => {
    current.value = next
    location.patchQuery({ component: next })
  }

  window.getCurrent = () => current

  window.onChange = onChange

  const currentComputed = refComputed(() => {
    return current.value
  })


  return (
    <div block block-height="100%">
      <Split asideLeft layout:block-height="100%">
        <div block block-height="100%" block-padding-left-10px block-padding-top-10px block-overflow-y-auto>
          <h1>AXII Components</h1>
          {() => Object.entries(availablePlayground).map(([category, items]) =>
            <div>
              <h2>{category}</h2>
              <MenuWithDisabledStyle data={items.map(name => ({ title: name.replace('*', ''), disabled: /\*$/.test(name), key: name}))} activeKey={current} onSetActive={(item) => onChange(item.key)}/>
            </div>
          )}
        </div>
        <div block block-height="100%">
          {() => {
            if(!current.value) return <div>点击选择一个组件</div>
            return <iframe height="100%" width="100%" src={`./playground.html?component=${current.value}`}/>
          }}
        </div>
      </Split>
    </div>
  )
}

render(<Choose />, document.getElementById('root'))
