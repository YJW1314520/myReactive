import { createEffect } from '../reactive/reactive'

type renderFunc = (...args: any[]) => JSX.Element
export const h = (
  type: string | renderFunc,
  attr: {
    class?: string
    id?: string
    style?: string
    [x: string]: any
  } | null,
  ...children: (string | JSX.Element)[]
): JSX.Element => {
  let x: { [x: string]: any } = {}
  for (let key in attr) {
    if (
      key === 'class' ||
      key === 'style' ||
      key === 'id' ||
      key.match(/on/)
    ) {
      x[key] = attr[key]
      delete attr.key
    }
  }
  if (typeof type === 'string') {
    let element = document.createElement(type)
    for (let key in x) {
      if (key.match(/on/)) {
        let matchString = key
          .match(/on([A-Z][a-z]+)/)![1]
          .toLowerCase()
        element.addEventListener(matchString, x[key])
      } else {
        element.setAttribute(key, x[key])
      }
    }
    element = addChildren(
      element,
      ...children
    ) as HTMLElement
    return element
  } else {
    let element =
      type === Fragment
        ? type(...children)
        : addChildren(
            type({ attr, children }) as HTMLElement
          )
    return element
  }
}
export const Fragment = (
  ...children: (string | renderFunc)[]
) => {
  // for (let element of render(...children)){
  //   element
  // }
  return addChildren(
    document.createDocumentFragment() as any as HTMLElement,
    ...children
  )
}
const addChildren = (
  par?: HTMLElement,
  ...children: (
    | string
    | number
    | boolean
    | Function
    | JSX.Element
    | JSX.Element[]
  )[]
) => {
  let result: JSX.Element[] = []
  for (let child of children) {
    if (child === undefined || child === null) {
    } else if (
      typeof child === 'string' ||
      typeof child === 'number' ||
      typeof child === 'boolean'
    ) {
      let element = document.createTextNode(
        child.toString()
      )
      result.push(element)
    } else if (typeof child === 'function') {
      result.push(
        ...(addChildren(undefined, child()) as [])
      )
      let p = result.length
      createEffect(() => (result[p - 1].data = child()))
    } else if (Array.isArray(child)) {
      result = [
        ...result,
        ...(addChildren(undefined, ...child) as []),
      ]
    } else {
      result.push(child)
    }
  }
  return par ? mount(par, result) : result
}
const mount = (
  target: HTMLElement,
  children: JSX.Element[]
) => {
  if (Array.isArray(target) || children.length === 0)
    return target
  for (let child of children) {
    target.appendChild(child as Node)
  }
  return target
}
export const render = (
  element: JSX.Element,
  dom: HTMLElement
) => {
  dom.appendChild(element as HTMLElement)
}
