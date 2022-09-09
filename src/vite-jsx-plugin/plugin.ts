import { type Plugin } from 'vite'
import parser from '@babel/parser'
import { default as trans } from '@babel/traverse'

const tr = (trans as any).default as typeof trans

export const jsxPlugin = (): Plugin => {
  return {
    name: 'tsxPlugin',
    transform(context, id) {
      if (id.match(/\.tsx/)) {
        let result: any[] = []
        tr(
          parser.parse(context, {
            sourceType: 'module',
            attachComment: false,
          }),
          {
            CallExpression(path) {
              if (
                path.node.callee.type === 'Identifier' &&
                path.node.callee.name === 'h'
              ) {
                const _ = path.node.arguments.slice(2)
                result = result.concat(
                  _.filter(
                    arg =>
                      arg.type === 'CallExpression' &&
                      arg.callee.type === 'Identifier' &&
                      arg.callee.name !== 'h'
                  ).map(arg => [arg.callee.name, arg.start])
                )
              }
            },
          }
        )
        let count = false
        result.map(v => {
          context =
            context.slice(0, count ? v[1] + 4 : v[1]) +
            '()=>' +
            context.slice(count ? v[1] + 4 : v[1])
          count = true
        })
        return context
      }
    },
  }
}
