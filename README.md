# 响应式库，搭配jsx
拷贝本项目,然后
```bash
# 安装依赖
pnpm i 
# 运行
pnpm dev
```
## 示例：
```tsx
import { createRef } from './reactive/reactive'
import { render } from './jsx/jsxFactory'
const App = () => {
  const [count, setCount] = createRef(1)
  return (
    <div id="ap" style="color:red">
      <button
        onClick={() => {
          setCount(p => p + 1)
        }}
      ></button>
      <>
        {[<div>非响应式节点</div>, <br />]}
        响应式节点---{count()}
      </>
    </div>
  )
}
render(<App />, document.getElementById('app')!)
```
## 其他的

基础实现，还有很多很多要做。