declare module "@babel/plugin-syntax-jsx";
declare module "babel-plugin-macros" {
  function createMacro(func: Function): any;
  const MacroError: ErrorConstructor;
}
declare module "ast-pretty-print";
