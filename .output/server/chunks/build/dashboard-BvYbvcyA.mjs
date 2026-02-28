import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { u as useRouter, d as defineStore } from './server.mjs';
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

const useCreditsStore = defineStore("credits", () => {
  const balance = ref("0");
  const lastRechargedAt = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const balanceNumeric = computed(() => parseFloat(balance.value) || 0);
  const balanceStatus = computed(() => {
    const value = balanceNumeric.value;
    if (value > 20) return "good";
    if (value >= 10) return "warning";
    return "critical";
  });
  async function fetchBalance() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch("/api/credits/balance");
      balance.value = data.balance;
      lastRechargedAt.value = data.lastRechargedAt;
    } catch (err) {
      const e = err;
      error.value = e.message || "Fehler beim Laden des Guthabens";
    } finally {
      isLoading.value = false;
    }
  }
  async function recharge(amount) {
    var _a;
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch("/api/credits/recharge", {
        method: "POST",
        body: { amount }
      });
      if (data.success) {
        balance.value = data.newBalance;
        lastRechargedAt.value = (/* @__PURE__ */ new Date()).toISOString();
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const e = err;
      const errorMessage = ((_a = e.data) == null ? void 0 : _a.message) || "Fehler beim Aufladen";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  }
  async function receiveMonthly() {
    var _a;
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch("/api/credits/monthly", {
        method: "POST"
      });
      if (data.success) {
        balance.value = data.newBalance;
        lastRechargedAt.value = (/* @__PURE__ */ new Date()).toISOString();
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const e = err;
      const errorMessage = ((_a = e.data) == null ? void 0 : _a.message) || "Fehler bei Monatspauschale";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  }
  return {
    balance,
    lastRechargedAt,
    isLoading,
    error,
    balanceNumeric,
    balanceStatus,
    fetchBalance,
    recharge,
    receiveMonthly
  };
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const authStore = useAuthStore();
    const creditsStore = useCreditsStore();
    const showRechargeModal = ref(false);
    const selectedAmount = ref(null);
    const isRecharging = ref(false);
    const rechargeSuccess = ref(false);
    const RECHARGE_OPTIONS = [
      { amount: "10", label: "10 \u20AC", description: "Klein" },
      { amount: "25", label: "25 \u20AC", description: "Standard" },
      { amount: "50", label: "50 \u20AC", description: "Gro\xDF" }
    ];
    const balanceColorClass = computed(() => {
      switch (creditsStore.balanceStatus) {
        case "good":
          return "bg-green-100 border-green-300 text-green-800";
        case "warning":
          return "bg-yellow-100 border-yellow-300 text-yellow-800";
        case "critical":
          return "bg-red-100 border-red-300 text-red-800";
        default:
          return "bg-gray-100 border-gray-300 text-gray-800";
      }
    });
    const balanceDotClass = computed(() => {
      switch (creditsStore.balanceStatus) {
        case "good":
          return "bg-green-500";
        case "warning":
          return "bg-yellow-500";
        case "critical":
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-background p-8" }, _attrs))}><div class="max-w-4xl mx-auto"><div class="flex justify-between items-center mb-8"><div><h1 class="text-3xl font-bold text-primary">Dashboard</h1>`);
      if (unref(authStore).user) {
        _push(`<p class="text-sm text-muted-foreground mt-1"> Angemeldet als ${ssrInterpolate(unref(authStore).user.name)} `);
        if (unref(authStore).user.location) {
          _push(`<span>(${ssrInterpolate(unref(authStore).user.location)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">${ssrInterpolate(unref(authStore).user.role)}</span></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><button class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"> Abmelden </button></div><div class="grid gap-6 mb-8"><div class="${ssrRenderClass(["rounded-lg p-6 border-2 transition-all", unref(balanceColorClass)])}" role="status" aria-live="polite"><div class="flex items-center justify-between mb-4"><div><p class="text-sm font-medium opacity-80" id="balance-label">Guthaben</p><p class="text-4xl font-bold" aria-labelledby="balance-label"><span aria-live="polite">${ssrInterpolate(unref(creditsStore).balance)}</span> \u20AC </p></div><div class="${ssrRenderClass(["w-4 h-4 rounded-full", unref(balanceDotClass)])}" role="img"${ssrRenderAttr("aria-label", "Guthaben-Status: " + unref(creditsStore).balanceStatus)}></div></div><div class="flex gap-3"><button${ssrIncludeBooleanAttr(unref(creditsStore).isLoading) ? " disabled" : ""} aria-label="Guthaben aufladen" class="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"> Guthaben aufladen </button><button${ssrIncludeBooleanAttr(unref(creditsStore).isLoading) ? " disabled" : ""} aria-label="Monatspauschale erhalten, erh\xF6ht Guthaben um 25 Euro" class="flex-1 py-3 px-4 border-2 border-current rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(unref(creditsStore).isLoading ? "Wird geladen..." : "Monatspauschale +25\u20AC")}</button></div>`);
      if (unref(creditsStore).lastRechargedAt) {
        _push(`<p class="text-xs mt-3 opacity-70"> Zuletzt aufgeladen: ${ssrInterpolate(new Date(unref(creditsStore).lastRechargedAt).toLocaleDateString("de-DE"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(creditsStore).error) {
        _push(`<p class="text-xs mt-3 text-red-600 bg-red-50 p-2 rounded" role="alert">${ssrInterpolate(unref(creditsStore).error)} <button class="ml-2 underline" aria-label="Fehlermeldung schlie\xDFen">\u2715</button></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="bg-card rounded-lg p-6 border"><p class="text-foreground">Willkommen im Admin-Dashboard!</p><p class="text-muted-foreground mt-2">Hier werden sp\xE4ter die Admin-Funktionen angezeigt.</p></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showRechargeModal)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl"><div class="flex justify-between items-center mb-6"><h2 id="modal-title" class="text-xl font-bold">Guthaben aufladen</h2><button class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schlie\xDFen"> \u2715 </button></div>`);
          if (unref(rechargeSuccess)) {
            _push2(`<div class="text-center py-8" role="status" aria-live="polite"><div class="text-4xl mb-4" aria-hidden="true">\u2713</div><p class="text-lg font-medium text-green-600">Guthaben erfolgreich aufgeladen!</p></div>`);
          } else if (unref(isRecharging)) {
            _push2(`<div class="text-center py-8"><div class="mb-4"><div class="h-2 bg-gray-200 rounded-full overflow-hidden"><div class="h-full bg-primary transition-all duration-300" style="${ssrRenderStyle({ "width": "100%" })}"></div></div></div><p class="text-lg font-medium">Wird aufgeladen...</p></div>`);
          } else {
            _push2(`<div><p class="text-sm text-muted-foreground mb-4">W\xE4hle einen Betrag:</p>`);
            if (unref(creditsStore).error) {
              _push2(`<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">${ssrInterpolate(unref(creditsStore).error)} <button class="ml-2 underline" aria-label="Fehlermeldung schlie\xDFen">\u2715</button></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="grid grid-cols-3 gap-3 mb-6" role="group" aria-label="Auflade-Betr\xE4ge ausw\xE4hlen"><!--[-->`);
            ssrRenderList(RECHARGE_OPTIONS, (option) => {
              _push2(`<button${ssrRenderAttr("aria-pressed", unref(selectedAmount) === option.amount)} class="${ssrRenderClass([
                "p-4 rounded-lg border-2 transition-all text-center",
                unref(selectedAmount) === option.amount ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              ])}"><p class="text-2xl font-bold">${ssrInterpolate(option.label)}</p><p class="text-xs text-muted-foreground">${ssrInterpolate(option.description)}</p></button>`);
            });
            _push2(`<!--]--></div><button${ssrIncludeBooleanAttr(!unref(selectedAmount) || unref(isRecharging)) ? " disabled" : ""} aria-label="Guthaben mit gew\xE4hlten Betrag aufladen" class="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(unref(isRecharging) ? "Wird aufgeladen..." : "Jetzt aufladen")}</button></div>`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-BvYbvcyA.mjs.map
