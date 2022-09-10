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
import { ref } from './reactive/reactive'
import { render } from './jsx/jsxFactory'

const App = () => {
  const [count, setCount] = ref(1)
  const [x, setX] = ref([1, 2, 3])
  return (
    <>
      <button onClick={() => setCount(count => count + 1)}>
        计数器加1
      </button>
      <button onClick={() => setX(() => [...x(), 1])}>
        数组push
      </button>
      <button
        onClick={() =>
          setX(() => [...x().slice(0, x().length - 1)])
        }
      >
        数组delete
      </button>
      <div>非响应式节点:计数器---{count()}</div>
      <div>
        响应式节点:计数器---{count} 数组长度---
        {() => x().length}
      </div>
      {() =>
        x().map(v => (
          <div onClick={() => console.log('惦记')}>
            {v * 2}
          </div>
        ))
      }
    </>
  )
}

render(<App />, document.getElementById('app')!)
```
## 提示

**请将要渲染的动态值全部用函数包裹**

## 其他的

只是基础实现，还有很多很多要做。