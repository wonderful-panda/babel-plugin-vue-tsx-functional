import Vue, { VNode, RenderContext } from "vue";
import { TsxComponent } from "vue-tsx-support";

export function __VueFC__<P>(
  _func: (ctx: RenderContext<P>) => VNode
): TsxComponent<Vue, P> {
  throw new Error(
    "[babel-plugin-vue-functional] This function must be removed by babel"
  );
}
