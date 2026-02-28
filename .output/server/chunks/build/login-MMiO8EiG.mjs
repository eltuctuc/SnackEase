import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useRouter } from './server.mjs';
import { u as useAuthStore } from './auth-B6d3gal2.mjs';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    useAuthStore();
    const email = ref("");
    const password = ref("demo123");
    const error = ref("");
    const isLoading = ref(false);
    const selectedPersona = ref(null);
    const personas = [
      { email: "nina@demo.de", name: "Nina Neuanfang", location: "N\xFCrnberg", initial: "N" },
      { email: "maxine@demo.de", name: "Maxine Snackliebhaber", location: "Berlin", initial: "M" },
      { email: "lucas@demo.de", name: "Lucas Gesundheitsfan", location: "N\xFCrnberg", initial: "L" },
      { email: "alex@demo.de", name: "Alex Gelegenheitsk\xE4ufer", location: "Berlin", initial: "A" },
      { email: "tom@demo.de", name: "Tom Schnellk\xE4ufer", location: "N\xFCrnberg", initial: "T" },
      { email: "admin@demo.de", name: "Admin", location: "N\xFCrnberg", initial: "A", isAdmin: true }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-background flex flex-col items-center justify-center p-8" }, _attrs))}><div class="text-center max-w-md w-full"><h1 class="text-4xl font-bold text-primary mb-2">SnackEase</h1><p class="text-muted-foreground mb-8">Willkommen zur\xFCck!</p><div class="mb-6"><p class="text-sm font-medium mb-3">W\xE4hle dein Profil:</p><div class="grid grid-cols-2 gap-3"><!--[-->`);
      ssrRenderList(personas, (persona) => {
        _push(`<button${ssrRenderAttr("aria-pressed", unref(selectedPersona) === persona.email)} class="${ssrRenderClass([
          "p-3 rounded-lg border transition-all text-left",
          unref(selectedPersona) === persona.email ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-input hover:border-primary/50 bg-card"
        ])}"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">${ssrInterpolate(persona.initial)}</div><div><div class="font-medium text-sm">${ssrInterpolate(persona.name)}</div><div class="text-xs text-muted-foreground">${ssrInterpolate(persona.location)}</div></div></div></button>`);
      });
      _push(`<!--]--></div></div><form class="space-y-4"><div><input${ssrRenderAttr("value", unref(email))} type="email" placeholder="Email" required aria-label="E-Mail-Adresse"${ssrIncludeBooleanAttr(!!unref(selectedPersona)) ? " readonly" : ""} class="${ssrRenderClass([{ "bg-muted": !!unref(selectedPersona) }, "w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"])}"></div><div><input${ssrRenderAttr("value", unref(password))} type="password" placeholder="Passwort" required aria-label="Passwort" class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"></div>`);
      if (unref(error)) {
        _push(`<p role="alert" class="text-red-500 text-sm">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""} class="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">${ssrInterpolate(unref(isLoading) ? "Anmeldung..." : "Anmelden")}</button></form><p class="text-sm text-muted-foreground mt-4">`);
      if (unref(selectedPersona) === "admin@demo.de") {
        _push(`<span>Admin-Passwort: admin123</span>`);
      } else {
        _push(`<span>Demo-Passwort: demo123</span>`);
      }
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-MMiO8EiG.mjs.map
