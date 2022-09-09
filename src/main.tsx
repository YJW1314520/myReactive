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
