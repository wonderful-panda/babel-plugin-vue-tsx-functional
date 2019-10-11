import * as babel from "@babel/core";
import jsx from "@babel/plugin-syntax-jsx";
import plugin, { Options } from "../lib/plugin";

function transform(code: string, opts?: Options): string | undefined {
  const transformOpts: babel.TransformOptions = {
    plugins: [[plugin, opts], jsx]
  };
  const ret = babel.transform(code, transformOpts);
  return ret ? ret.code || undefined : undefined;
}

describe("Forms of render functions: ", () => {
  it("() => <div />", () => {
    const code = transform(
      `const MyComponent = __VueFC__(() => <div class='test' />)`
    );
    expect(code).toMatchSnapshot();
  });
  it("ctx => <div>...</div>", () => {
    const code = transform(
      `const MyComponent = __VueFC__(ctx => <div class='test'>{ctx.props.foo}</div>)`
    );
    expect(code).toMatchSnapshot();
  });
  it("({ ...complex... }) => <div>...</div>", () => {
    const code = transform(
      `const MyComponent = __VueFC__(({ props: { foo }, data }) => <div class='test'>{foo}</div>)`
    );
    expect(code).toMatchSnapshot();
  });

  it("() => { return <div /> }", () => {
    const code = transform(
      `const MyComponent = __VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });
});

describe("Forms of marker function: ", () => {
  it("xxx.__VueFC__(...)", () => {
    const code = transform(
      `const MyComponent = babel_plugin_vue_tsx_functional_1.__VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });
  it("xxx.yyy.__VueFC__(...)", () => {
    const code = transform(
      `const MyComponent = xxx.yyy.__VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });
  it("xxx['__VueFC__'](...)", () => {
    const code = transform(
      `const MyComponent = xxx["__VueFC__"](() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });
  it("Changing marker name", () => {
    const code = transform(
      `const MyComponent1 = _f(() => <div />);
      const MyComponent2 = xx._f(() => <div />);
      const MyComponent3 = __VueFC__(() => <div />);`,
      { funcName: "_f" }
    );
    expect(code).toMatchSnapshot();
  });
});

describe("Export or assignment: ", () => {
  it("export const MyComponent = ...", () => {
    const code = transform(
      `export const MyComponent = __VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });

  it("export default ...", () => {
    const code = transform(
      `export default __VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });

  it("exports.MyCompoent = ...", () => {
    const code = transform(
      `exports.MyComponent = __VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });

  it("let MyCompoent; MyComponent = ...", () => {
    const code = transform(
      `let MyComponent;
      MyComponent = __VueFC__(() => {
        return <div class='test' />;
      })`
    );
    expect(code).toMatchSnapshot();
  });
});
