import * as babel from "@babel/core";
import * as t from "@babel/types";

export interface Options {
  funcName?: string;
}

const defaultOptions: Required<Options> = {
  funcName: "__VueFC__"
};

/**
 * Build object literal represents functional component.
 *
 * Input: `
 *   ctx => (<div>{ctx.props.text}</div>)
 * `
 * Output: `
 *   {
 *     functional: true,
 *     render(h, ctx) {
 *       return <div>{ctx.props.text}</div>;
 *     }
 *   }
 * `
 */
function buildFunctionalComponentObject(renderFn: t.ArrowFunctionExpression) {
  let body: t.BlockStatement;
  if (t.isBlockStatement(renderFn.body)) {
    body = renderFn.body;
  } else {
    body = t.blockStatement([t.returnStatement(renderFn.body)]);
  }
  const ret = t.objectExpression([
    t.objectProperty(t.identifier("functional"), t.booleanLiteral(true)),
    t.objectMethod(
      "method",
      t.identifier("render"),
      [t.identifier("h"), ...renderFn.params],
      body
    )
  ]);
  return ret;
}

/**
 * Get function name or method name from CallExpression.
 */
function getCalleeName(node: t.CallExpression): string | undefined {
  const callee = node.callee;
  if (t.isIdentifier(callee)) {
    // xxx(...)
    // ^^^
    return callee.name;
  }
  if (t.isMemberExpression(callee)) {
    const property = callee.property;
    if (t.isIdentifier(property)) {
      // xxx.yyy(...)
      //     ^^^
      return property.name;
    }
    if (t.isStringLiteral(property)) {
      // xxx["yyy"](...)
      //      ^^^
      return property.value;
    }
  }
  return undefined;
}

/**
 * Check specified path is assigned to variable or property, or exported
 *
 * expected patterns:
 *  [export] [const|let|var] VariableName = <node>
 *  export default <node>
 *  obj.PropertyName = <node>
 *  obj["PropertyName"] = <node>
 */
function isAssignedOrExported(path: babel.NodePath<t.CallExpression>): boolean {
  const parent = path.parentPath.node;

  if (t.isAssignmentExpression(parent) && parent.right === path.node) {
    return true;
  } else if (t.isVariableDeclarator(parent)) {
    return true;
  } else if (t.isExportDefaultDeclaration(parent)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Replace __VueFC__ call expression by object literal which represents
 * functional component.
 */
function processCallExpression(
  path: babel.NodePath<t.CallExpression>,
  opts: Required<Options>
) {
  const { node } = path;
  const funcname = getCalleeName(node);
  if (funcname !== opts.funcName) {
    return;
  }
  if (node.arguments.length !== 1) {
    throw path.buildCodeFrameError(
      `${opts.funcName} must have exactly 1 argument`
    );
  }
  const arg = node.arguments[0];
  if (!t.isArrowFunctionExpression(arg)) {
    throw path.buildCodeFrameError(
      `argument of ${opts.funcName} must be arrow function`
    );
  }

  if (!isAssignedOrExported(path)) {
    throw path.buildCodeFrameError(
      `result of ${opts.funcName} must be assigned or exported`
    );
  }
  const functionalComponent = buildFunctionalComponentObject(arg);
  path.replaceWith(functionalComponent);
}

export default function(): babel.PluginObj<{ opts: Options }> {
  const plugin: babel.PluginObj<{ opts: Options }> = {
    name: "vue-tsx-functional",
    visitor: {
      Program(path, state) {
        const opts: Required<Options> = { ...defaultOptions, ...state.opts };
        path.traverse({
          CallExpression(path) {
            processCallExpression(path, opts);
          }
        });
      }
    }
  };
  return plugin;
}
