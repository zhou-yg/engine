import {
  createVnodePath, getVnodeNextIndex, resolveFirstElement,
  resolveFirstLayerElements,
  resolveLastElement,
} from '../common'
import {
  handleInitialVnode,
} from './initialDigest'
import {
  PATCH_ACTION_INSERT,
  PATCH_ACTION_MOVE_FROM,
  PATCH_ACTION_REMAIN,
  PATCH_ACTION_REMOVE,
  PATCH_ACTION_TO_MOVE,
} from '../constant'

function handleRemainPatchNode(p, nextPatch, parentNode, prevSiblingNode, parentPath, cnode, view) {
  nextPatch.push(p)
  if (typeof p.type === 'object') return

  if (p.type === Array) {
    /* eslint-disable no-use-before-define */
    p.children = handlePatchVnodeChildren(p.children, parentNode, prevSiblingNode, createVnodePath(p, parentPath), cnode, view)
    /* eslint-enable no-use-before-define */
  } else if (typeof p.type === 'string' || p.type === String) {
    if (p.patch !== undefined) {
      view.updateElement(p, p.element)
      delete p.patch
    }

    if (typeof p.type === 'string' && p.children !== undefined) {
      /* eslint-disable no-use-before-define */
      p.children = handlePatchVnodeChildren(p.children, p.element, null, createVnodePath(p, parentPath), cnode, view)
      /* eslint-enable no-use-before-define */
    }
  }
}

function handleRemovePatchNode(p, parentPath, toDestroy, view) {
  const elements = resolveFirstLayerElements([p], parentPath, toDestroy)
  elements.forEach((ele) => {
    ele.parentNode.removeChild(ele)
  })

  if (view.isComponentVnode(p)) {
    // remove placeholder
    const nextCnode = toDestroy.next[getVnodeNextIndex(p, parentPath)]
    nextCnode.view.placeholder.parentNode.removeChild(nextCnode.view.placeholder)
  }
}

export function handleMoveFromPatchNode(p, nextPatch, parentPath, cnode, toInsert, view) {
  const elements = resolveFirstLayerElements([p], parentPath, cnode)
  elements.forEach((ele) => {
    toInsert.appendChild(ele)
  })

  // Only component vnode or normal vnode can be marked as 'moveFrom',
  // because user can only use 'key' attribute on this two types in jsx.
  if (typeof p.type === 'string' && p.children !== undefined) {
    /* eslint-disable no-use-before-define */
    p.children = handlePatchVnodeChildren(p.children, p.element, null, createVnodePath(p, parentPath), cnode, view)
    /* eslint-enable no-use-before-define */
  }

  nextPatch.push(p)
  // if (cnodesToUpdateParentNode && isComponentVnode(p)) {
  //   cnodesToUpdateParentNode.push(cnode.next[vnodePathToString(createVnodePath(p, parentPath))])
  // }
  return elements.length
}

// CAUTION No more handle `toMove`, trust `moveFrom` will handle every node.
// In dom manipulation, appendChild will  automatically detach the dom node from its original parent.
function handleToMovePatchNode() {
// function handleToMovePatchNode(p, parentPath, cnode, toMove) {
  // const elements = resolveFirstLayerElements([p], parentPath, cnode)
  // elements.forEach((ele) => {
  //   toMove.appendChild(ele)
  // })
}

/**
 * Consume the patch.
 * During the procedure, we do not handle "remove" type, because if it is component vnode,
 * the real dom ref was attached to the cnode, but the cnode may be removed already,
 * so we can not find the right reference to remove.
 * The patch method only deal with type of "remain", "insert", and "moveFrom".
 *
 * The algorithm can be shortly described as:
 * 1) Find the remained vnode first.
 * 2) Delete every vnode between them.
 * 3) Insert vnode of "insert" type and "moveFrom" type to the right place.
 */
function handlePatchVnodeChildren(patch, parentNode, lastStableSiblingNode, parentPath, cnode, view) {
  const nextPatch = []
  let toInsert = view.createFragment()
  // Save "toMove" type vnode to a fragment for later check if the algorithm is right.
  const toMove = view.createFragment()
  let currentLastStableSiblingNode = lastStableSiblingNode

  patch.forEach((p) => {
    if (p.action.type === PATCH_ACTION_TO_MOVE) {
      handleToMovePatchNode(p, parentPath, cnode, toMove)
    } else if (p.action.type === PATCH_ACTION_MOVE_FROM) {
      p.action.type = PATCH_ACTION_REMAIN
      handleMoveFromPatchNode(p, nextPatch, parentPath, cnode, toInsert, view)
    } else if (p.action.type === PATCH_ACTION_INSERT) {
      p.action.type = PATCH_ACTION_REMAIN
      handleInitialVnode(p, cnode, view, nextPatch, parentPath, toInsert, nextPatch.length)
    } else if (p.action.type === PATCH_ACTION_REMOVE) {
      handleRemovePatchNode(p, parentPath, { next: cnode.toDestroyPatch }, view)
    } else if (p.action.type === PATCH_ACTION_REMAIN) {
      // Handle "toInsert" type first.
      // Trying to insert all new element between two remained elements, So we need to find last remained element first.
      if (toInsert.childNodes.length !== 0) {
        const toInsertBefore = currentLastStableSiblingNode ? currentLastStableSiblingNode.nextSibling : parentNode.childNodes[0]
        currentLastStableSiblingNode = toInsertBefore || toInsert.childNodes[toInsert.childNodes.length - 1]
        parentNode.insertBefore(toInsert, toInsertBefore)
        // toInsert is empty now
        // toInsert = view.createFragment()
      }

      // Only "p.type === Array" condition needs previousSibling
      handleRemainPatchNode(p, nextPatch, parentNode, currentLastStableSiblingNode, parentPath, cnode, view)
      // Find last element in patch node to update currentLastStableSiblingNode
      // debugger
      const lastElement = resolveLastElement(p, parentPath, cnode, view.isComponentVnode)
      if (lastElement) {
        currentLastStableSiblingNode = lastElement
      }
    }
  })

  /**
   * TODO 当前没处理完的 toInsert, 说明一直没有没有 remain 节点。
   *  这时候插到 currentLastStableSibling 的后面。
   *  如果也没有，既不能插到最后面: 后面可能还有 数组
   *  也不能插到最前面: 前面有。
   *  只要是当前组件返回的是个数组就会出现找不到头尾的情况。
   */
  if (toInsert.childNodes.length !== 0) {
    parentNode.insertBefore(toInsert, currentLastStableSiblingNode ? currentLastStableSiblingNode.nextSibling : parentNode.childNodes[0])
    toInsert = null
  }

  // for debug
  if (toMove.childNodes.length !== 0) throw new Error('to move length not 0')

  return nextPatch
}

// updateDigest only handle one cnode and its new child cnodes.
export default function updateDigest(cnode, view) {
  if (cnode.view.parentNode === undefined) throw new Error(`cnode has not been initial digested ${cnode.type.displayName}`)
  // TODO placeholder 的问题
  cnode.patch = handlePatchVnodeChildren(cnode.patch, cnode.view.parentNode, cnode.view.placeholder, [], cnode, view)
  // CAUTION toDestroyPatch should be reset after update digest.
  cnode.toDestroyPatch = {}
}