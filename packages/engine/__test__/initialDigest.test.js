const { default: createPainter, createCnode }= require('../createPainter')
const createElement = require('../createElement').default
const createDOMView = require('../DOMView/createDOMView').default

const {
  PATCH_ACTION_INSERT,
  PATCH_ACTION_MOVE_FROM,
  PATCH_ACTION_REMAIN,
  PATCH_ACTION_REMOVE,
  PATCH_ACTION_TO_MOVE,
  DEV_MAX_LOOP,
} = require('../constant')

describe('initialDigest', () => {
  let painter
  let view
  let rootElement
  const renderer = {
    rootRender(cnode) {
      return cnode.type.render()
    },
    initialRender(cnode) {
      return cnode.type.render()
    }
  }

  beforeEach(() => {
    painter = createPainter(renderer)
    rootElement = document.createElement('div')
    view = createDOMView({ invoke: () => {} }, rootElement)
  })

  test('initialDigest', () => {
    const App = {
      render() {
        return <div>app</div>
      }
    }

    const ctree = createCnode(<App/>)
    painter.paint(ctree)
    view.initialDigest(ctree)

    const refs = ctree.view.getViewRefs()
    expect(refs[0].outerHTML).toBe('<div>app</div>')
  })
})