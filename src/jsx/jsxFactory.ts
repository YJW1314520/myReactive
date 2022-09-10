import { effect } from '../reactive/reactive'

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
    | bigint
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
      typeof child === 'boolean' ||
      typeof child === 'bigint'
    ) {
      let element = document.createTextNode(
        child.toString()
      )
      result.push(element)
    } else if (typeof child === 'function') {
      const _ = child()
      if (Array.isArray(_)) {
        // 还需要完善
        const template = document.createElement('div')
        template.replaceChildren(..._)
        effect(() => {
          let count: number[] = []
          let _ = (child as any)() as HTMLElement[]
          enum DiffType {
            Add,
            Delete,
          }
          const diffType =
            _.length >= template.children.length
              ? DiffType.Add
              : DiffType.Delete
          if (diffType === DiffType.Add) {
            _.forEach((v, i) => {
              if (!template.children[i]?.isEqualNode(v))
                count.push(i)
            })
            for (const i of count) {
              if (template.children[i]) {
                template.replaceChild(
                  _[i],
                  template.children[i]
                )
              } else {
                template.appendChild(_[i])
              }
            }
          } else {
            Array.from(template.children).forEach(
              (v, i) => {
                if (!v.isEqualNode(_[i])) count.push(i)
              }
            )
            for (const i of count) {
              template.removeChild(
                template.children.item(i) as Node
              )
            }
          }
        })
        result.push(template)
      } else {
        result.push(...(addChildren(undefined, _) as []))
        let __ = result.length
        effect(
          () =>
            ((result[__ - 1] as Text).data = (
              child as () => string
            )())
        )
      }
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
