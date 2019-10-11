# babel-plugin-vue-tsx-functional

Inspired by [babel-sugar-functional-vue](https://github.com/vuejs/jsx/tree/dev/packages/babel-sugar-functional-vue), and TypeScript friendly.

## Prerequisite

- TypeScript >= 3.5
- Vue >= 2.6
- vue-tsx-support >= 2.3.2

## Install

Install from npm.

```
yarn add babel-plugin-vue-tsx-functional -D
```

And add to plugins list in your .babelrc

```json
"plugins": ["babel-plugin-vue-tsx-functional/lib/plugin"]
```


## Example

Input

```typescript
import { __VueFC__ } from "babel-plugin-vue-tsx-functional";

const MyComponent = __VueFC__<{ foo: string }>(ctx => {
  return <div>{ctx.props.foo}</div>;
})
```

Output (transpiled by tsc and this plugin)

```javascript
import { __VueFC__ } from "babel-plugin-vue-tsx-functional";

const MyComponent = {
  functional: true,
  render(h, ctx) {
    return <div>{ctx.props.foo}</div>;
  }
};
```
