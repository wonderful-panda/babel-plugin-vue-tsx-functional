import * as t from "@babel/types";
import { createMacro } from "babel-plugin-macros";

const processRef = (_ref: t.Node, _babel: typeof import("@babel/core")) => {};

const functionalComponentMacro = (arg: {
  references: Record<string, t.Node[]>;
  babel: typeof import("@babel/core");
}) => {
  for (const key in Object.keys(arg.references)) {
    for (const ref of arg.references[key]) {
      processRef(ref, arg.babel);
    }
  }
};

export default createMacro(functionalComponentMacro);
