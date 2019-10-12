# babel-plugin-vue-tsx-functional

Inspired by [babel-sugar-functional-vue](https://github.com/vuejs/jsx/tree/dev/packages/babel-sugar-functional-vue), and TypeScript friendly.

## Motivation

`babel-sugar-functiona-vue` allows us writing functional component as pure arrow function like below.

```javascript
const MyComponent = ctx => <div>{ctx.props.text}</div>;
```

But this is not suitable for TypeScript. First parameter must be `RenderContext<Props>`, though TypeScript supposes it as `Props`.

This plugin does almost same thing by more TypeScript-friendly way.
Wrap arrow function by marker function `__VueFC__` which provides appropriate type conversion and will removed by transpilation.

```typescript
const MyComponent = __VueFC__<{ text: string }>(ctx => <div>{ctx.props.text}</div>);
```

## Requirements

- TypeScript >= 3.5
- Vue >= 2.6
- vue-tsx-support >= 2.3.2
- @vue/babel-preset-app (or @vue/babel-preset-jsx and babel-helper-vue-jsx-merge-props)

## Installation

1. Configure basic JSX transpilation according to [vuejs/jsx](https://github.com/vuejs/jsx)

2. Install from npm.

  ```
  yarn add babel-plugin-vue-tsx-functional -D
  ```

3. And add to plugins list in your .babelrc (Don't forget `lib/plugin`)

```json
"plugins": ["babel-plugin-vue-tsx-functional/lib/plugin"]
```

4. Configure TSX type checking according to [vue-tsx-support](https://github.com/wonderful-panda/vue-tsx-support)

## Example

### Original code (TypeScript)

```typescript
import { __VueFC__ } from "babel-plugin-vue-tsx-functional";

const MyComponent = __VueFC__<{ foo: string }>(ctx => {
  return <div>{ctx.props.foo}</div>;
})
```

### Intermidiate output (transpiled by tsc --module es6 --jsx preserve)

```javascript
import { __VueFC__ } from "babel-plugin-vue-tsx-functional";

const MyComponent = __VueFC__(ctx => {
  return <div class="test">{ctx.props.foo}</div>;
})
```

NOTE: ---module es6 is recomended, but other settings (amd, umd, commonjs) also work.

### Intermidiate output (transpiled by this plugin)

```javascript
import { __VueFC__ } from "babel-plugin-vue-tsx-functional";

const MyComponent = {
  functional: true,
  render(h, ctx) {
    return <div class="test">{ctx.props.foo}</div>;
  }
};
```

### Final output (transpiled by @vue/preset-jsx, etc)

```javascript
import { __VueFC__ } from "babel-plugin-vue-tsx-functional";

const MyComponent = {
  functional: true,
  render(h, ctx) {
    return h(
      "div", {
        class: "test"
      },
      [ctx.props.foo]
    );
  }
};
```

## Options

### funcName (string)

Specify marker function name. (default: `__VueFC__`)

## Tips

You can declare marker function globally.
You can use marker function without import by this.

```typescript
declare global {
  const __VueFC__: typeof import("babel-plugin-vue-tsx-functional").__VueFC__;
}
```

## License

MIT
