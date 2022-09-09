import { defineConfig } from 'vite'
import { jsxPlugin } from './src/vite-jsx-plugin/plugin'
export default defineConfig({
  plugins: [jsxPlugin()],
  esbuild: {
    jsxInject:
      "import { h, Fragment } from './jsx/jsxFactory'",
  },
})
