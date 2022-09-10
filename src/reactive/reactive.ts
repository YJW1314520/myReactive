type Pack<T> = () => T
type SetPack<T> = (arg: T | ((arg: T) => T)) => void
type Ref<T> = {
  value: T
}
type readonlyRef = {
  readonly value: void
}
let _untrack = false
let _depFlag = false
let _batch = false
let _trickStack = new Set<Ref<any>>()
const deps = new Set<Ref<any>>()
const refList = new WeakMap<Ref<any>, readonlyRef[]>()
export const ref = <T>(initValue: T) => {
  const getValue = () => ref.value
  const setValue = (value: T | ((arg: T) => T)) => {
    ref.value = isFunction(value) ? value(initValue) : value
  }
  const ref = {
    get value() {
      if (_depFlag && !_untrack) deps.add(ref)
      return initValue
    },
    set value(value) {
      if (equal(value, initValue)) return
      initValue = value
      _batch ? _trickStack.add(ref) : trick(ref)
    },
  } as Ref<T>
  return [getValue, setValue] as [Pack<T>, SetPack<T>]
}
export const effect = <T>(
  func: () => T,
  cacheFlag = false
) => {
  let cache: T
  let rRef = {
    get value() {
      cacheFlag ? (cache = func()) : func()
      return void 0
    },
  } as readonlyRef
  _depFlag = true
  cacheFlag ? (cache = func()) : func()
  if (deps.size === 0) {
    rRef = null as any
    _depFlag = false
    return
  }
  deps.forEach(dep => {
    const ref = refList.get(dep)
    refList.set(dep, ref ? [...ref, rRef] : [rRef])
  })
  deps.clear()
  _depFlag = false
  return cacheFlag ? () => cache : void 0
}
export const untrack = <T>(ref: Pack<T>) => {
  _untrack = true
  const _ = ref()
  _untrack = false
  return _
}
export const memo = <T>(func: () => T) =>
  effect(func, true)!
const trick = <T>(dep: Ref<T>) => {
  const _ = refList.get(dep)
  if (!_) return
  _.forEach(event => {
    event.value
  })
}
/* 实现有问题 */
const batch = (func: () => void) => {
  _batch = true
  func()
  for (let ref of Array.from(_trickStack)) {
    trick(ref)
  }
  _trickStack.clear()
  _batch = false
}
const isFunction = (arg: any): arg is Function => {
  return typeof arg === 'function'
}
const isArray = (value: any): value is any[] =>
  Array.isArray(value)
const equal = (a: any, b: any) => a === b
const shadowEqual = <T extends any[] | {}>(
  oldVal: T,
  newVal: T
) => deepEqual(oldVal, newVal, false)
const deepEqual = <T extends any[] | {}>(
  oldVal: T,
  newVal: typeof oldVal,
  deepFlag = true
) => {
  if (
    Object.keys(oldVal).length !==
    Object.keys(newVal).length
  )
    return false
  for (const i in oldVal) {
    const o = oldVal[i],
      n = newVal[i],
      to = typeof o,
      tn = typeof n
    if (to === 'function') return false
    if (to !== tn) {
      return false
    }
    if (to === 'object') {
      if (isArray(o) !== isArray(n)) {
        return false
      }
      if (deepFlag) {
        if (!deepEqual<any>(o, n)) return false
      }
      continue
    }
    if (o !== n) return false
  }
  return true
}
