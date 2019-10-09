import pp from "ast-pretty-print";
import * as babel from "@babel/core";
import * as t from "@babel/types";
import { createMacro, MacroError } from "babel-plugin-macros";

const makeError = (msg: string, nodePath: babel.NodePath) => {
  const p = nodePath.findParent(p => p.isProgram());
  let locString = "unknown";
  if (nodePath.node.loc) {
    const { line, column } = nodePath.node.loc.start;
    locString = `${line}:${column}`;
  }
  return new MacroError(`[vue-functional.macro] (at ${locString}) ${msg}`);
};

const processRef = (ref: babel.NodePath, _b: typeof babel) => {
  const parent = ref.parentPath.node;
  if (!t.isCallExpression(parent)) {
    throw makeError("macro must be callee of CallExpression", ref);
  }
  if (ref.node !== parent.callee) {
    throw makeError("macro must be callee of CallExpression", ref);
  }
};

const functionalComponentMacro = (arg: {
  references: Record<string, babel.NodePath[]>;
  babel: typeof babel;
}) => {
  for (const key in arg.references) {
    for (const ref of arg.references[key]) {
      processRef(ref, arg.babel);
    }
  }
};

export default createMacro(functionalComponentMacro);
