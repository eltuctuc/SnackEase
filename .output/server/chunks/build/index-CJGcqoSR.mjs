import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
import { u as useRouter } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const progress = ref(0);
    ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-background flex flex-col items-center justify-center p-8" }, _attrs))}><div class="text-center max-w-md"><div class="mb-8"><h1 class="text-5xl font-bold text-primary">SnackEase</h1></div><p class="text-xl text-primary/80 mb-12"> Dein Weg zu Gesundheit und Genuss </p><div class="w-full"><div class="h-2 bg-accent/20 rounded-full overflow-hidden mb-2"><div class="h-full bg-accent transition-all duration-300 ease-out rounded-full" style="${ssrRenderStyle({ width: `${unref(progress)}%` })}"></div></div><p class="text-sm text-muted-foreground">${ssrInterpolate(unref(progress))}% geladen </p></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CJGcqoSR.mjs.map
