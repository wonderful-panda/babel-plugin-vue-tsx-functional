import * as babel from "@babel/core";
import * as t from "@babel/types";

const FUNCNAME = "__VueFC__";

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
function buildFunctionalComponentObject(
  renderFn: t.ArrowFunctionExpression,
  componentName: string | undefined
) {
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
  if (componentName) {
    ret.properties.push(
      t.objectProperty(t.identifier("name"), t.stringLiteral(componentName))
    );
  }
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
 * Guess component name from __VueFC__ call expression.
 *
 * expected patterns:
 *  1) const ComponentName = xxx.__VueFC__(...);
 *  2) obj.ComponentName = xxx.__VueFC__(...);
 *  3) ComponentName = xxx.__VueFC__(...);
 *  4) export const ComponentName = xxx.__VueFC__(...);
 */
function guessComponentName(
  path: babel.NodePath<t.CallExpression>
): string | undefined {
  const parent = path.parentPath.node;

  let componentName: string | undefined;
  if (t.isAssignmentExpression(parent) && parent.right === path.node) {
    const left = parent.left;
    if (t.isIdentifier(left)) {
      componentName = left.name;
    } else if (t.isMemberExpression(left)) {
      componentName = t.isIdentifier(left.property)
        ? left.property.name
        : undefined;
    }
  } else if (t.isVariableDeclarator(parent)) {
    componentName = t.isIdentifier(parent.id) ? parent.id.name : undefined;
  } else if (t.isExportDefaultDeclaration(parent)) {
    // no name
  } else {
    throw path.buildCodeFrameError(
      `result of ${FUNCNAME} must be assigned or exported`
    );
  }
  if (componentName && /^[A-Z]/.test(componentName)) {
    return componentName;
  } else {
    return undefined;
  }
}

/**
 * Replace __VueFC__ call expression by object literal which represents
 * functional component.
 */
function processCallExpression(path: babel.NodePath<t.CallExpression>) {
  const { node } = path;
  const funcname = getCalleeName(node);
  if (funcname !== FUNCNAME) {
    return;
  }
  if (node.arguments.length !== 1) {
    throw path.buildCodeFrameError(`${FUNCNAME} must have exactly 1 argument`);
  }
  const arg = node.arguments[0];
  if (!t.isArrowFunctionExpression(arg)) {
    throw path.buildCodeFrameError(
      `argument of ${FUNCNAME} must be arrow function`
    );
  }
  const componentName = guessComponentName(path);
  const functionalComponent = buildFunctionalComponentObject(
    arg,
    componentName
  );
  path.replaceWith(functionalComponent);
}

export = function(): babel.PluginObj {
  const plugin: babel.PluginObj = {
    name: "vue-tsx-functional",
    visitor: {
      Program(path) {
        path.traverse({
          CallExpression(path) {
            processCallExpression(path);
          }
        });
      }
    }
  };
  return plugin;
};
