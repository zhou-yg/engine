/** @jsx createElement */
/** @jsxFrag Fragment */
import {
  createElement,
  propTypes,
  Fragment,
  vnodeComputed,
  createComponent,
  refComputed,
  ref,
  createRef
} from 'axii'
import Icon from '../icon/Icon'
import scen from '../pattern'

/**
 * TODO
 * tab 左右移动的代码怎么写，需要判断渲染后的宽度
 */
function Tabs({ children, activeKey, onChangeActiveKey }, context, fragments) {
  const visibleKey = refComputed(() => {
    if (activeKey.value && children.some((child) => child.props.tabKey === activeKey.value)) {
      return activeKey.value
    } else {
      return children[0].props.tabKey
    }
  })

  const headerRef = createRef()
  const tabHeadersContainerRef = createRef()

  const headerNotOverflow = refComputed(() => {
    return !(headerRef.scrollWidth.value > tabHeadersContainerRef.clientWidth.value)
  })

  const scrollLeft = () => {
    headerRef.current.scrollLeft -= headerRef.current.clientWidth
  }

  const scrollRight = () => {
    headerRef.current.scrollLeft += headerRef.current.clientWidth
  }

  return (
    <container block>
      <tabHeadersContainer
        block
        block-border-bottom-width-1px
        ref={tabHeadersContainerRef}
        flex-display
      >
        <tabHeaderScrollLeft inline flex-grow-0 flex-display flex-align-items-center inline-display-none={headerNotOverflow} onClick={scrollLeft}>
          <Icon type="left" />
        </tabHeaderScrollLeft>
        <tabHeaders block block-white-space-nowrap block-overflow-x-hidden flex-grow-1 ref={headerRef}>
          {fragments.tabHeaders({visibleKey})(() => {
            return children.map(child =>
              fragments.tabHeader({ tabKey: child.props.tabKey})(() =>
                <tabHeader inline inline-padding={scen().spacing()} onClick={() => onChangeActiveKey(child.props.tabKey) }>{child.props.title}</tabHeader>
              )
            )
          })}
        </tabHeaders>
        <tabHeaderScrollRight inline  flex-grow-0 flex-display flex-align-items-center inline-display-none={headerNotOverflow} onClick={scrollRight}>
          <Icon type="right" />
        </tabHeaderScrollRight>
      </tabHeadersContainer>
      <tabContents block>
        {fragments.tabContents()(() => {
          return children.map(child => {
            const hidden = refComputed(() => child.props.tabKey !== visibleKey.value)
            return <tabContent block block-visible-none={hidden}>{child.children}</tabContent>
          })
        })}
      </tabContents>
    </container>
  )
}

Tabs.TabPane = function() {}

Tabs.propTypes = {
  activeKey: propTypes.string.default(() => ref()),
  onChangeActiveKey: propTypes.callback.default(() => (key, { activeKey }) => {
    activeKey.value = key
  })
}


Tabs.Style = (fragments) => {
  const rootElements = fragments.root.elements
  rootElements.tabHeadersContainer.style({
    borderColor: scen().separateColor(),
    borderStyle: 'solid',
  })

  const pointerStyle = {
    cursor: 'pointer'
  }

  rootElements.tabHeaderScrollLeft.style(pointerStyle)
  rootElements.tabHeaderScrollRight.style(pointerStyle)

  fragments.tabHeader.elements.tabHeader.style(({ tabKey, visibleKey }) => ({
    color: tabKey === visibleKey.value ? scen().interactable().active().color() : scen().color(),
    fontWeight: tabKey === visibleKey.value ? scen().stressed().weight() : scen().weight(),
    boxShadow: tabKey === visibleKey.value ?
      `0 1px 0 0 ${scen().interactable().active().color()}` :
      undefined,
    cursor: 'pointer'
  }))

}

export default createComponent(Tabs, [])