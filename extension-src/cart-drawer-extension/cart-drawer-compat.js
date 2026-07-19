(() => {
  const drawerSelector = "[data-cdu-cart-drawer]";
  const originalOpenKey = "__cduOriginalOpen";
  const originalRenderContentsKey =
    "__cduOriginalRenderContents";
  let dawnObserver = null;

  function isCartAddRequest(input, init = {}) {
    const requestUrl =
      input instanceof Request ? input.url : String(input);
    const requestMethod = (
      init.method ||
      (input instanceof Request ? input.method : "GET")
    ).toUpperCase();

    if (requestMethod !== "POST") return false;

    try {
      const url = new URL(requestUrl, window.location.origin);

      return /\/cart\/add(?:\.js)?\/?$/.test(url.pathname);
    } catch {
      return false;
    }
  }

  function announceSuccessfulCartAdd() {
    requestAppDrawerOpen("cart-add");
  }

  function getAppDrawer() {
    return document.querySelector(drawerSelector);
  }

  function shouldReplaceNativeDrawer() {
    return (
      getAppDrawer()?.dataset.cduReplaceNativeDrawer ===
      "true"
    );
  }

  function installCartAddFallbacks() {
    if (window.__cduCartAddFallbackInstalled) return;

    window.__cduCartAddFallbackInstalled = true;

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const isCartAdd = isCartAddRequest(args[0], args[1]);
      const response = await Reflect.apply(
        originalFetch,
        this,
        args,
      );

      if (isCartAdd && response.ok) {
        announceSuccessfulCartAdd();
      }

      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      method,
      url,
      ...remainingArguments
    ) {
      this.__cduIsCartAddRequest = isCartAddRequest(url, {
        method,
      });

      return originalOpen.call(
        this,
        method,
        url,
        ...remainingArguments,
      );
    };

    XMLHttpRequest.prototype.send = function (body) {
      if (this.__cduIsCartAddRequest) {
        this.addEventListener(
          "load",
          () => {
            if (this.status >= 200 && this.status < 300) {
              announceSuccessfulCartAdd();
            }
          },
          { once: true },
        );
      }

      return originalSend.call(this, body);
    };
  }

  function restoreDawnCartDrawer(nativeDrawer) {
    const originalOpen = nativeDrawer[originalOpenKey];
    const originalRenderContents =
      nativeDrawer[originalRenderContentsKey];

    if (typeof originalOpen === "function") {
      nativeDrawer.open = originalOpen;

      delete nativeDrawer[originalOpenKey];
    }

    if (typeof originalRenderContents === "function") {
      nativeDrawer.renderContents = originalRenderContents;

      delete nativeDrawer[originalRenderContentsKey];
    }

    if (
      typeof originalOpen === "function" ||
      typeof originalRenderContents === "function"
    ) {
      delete nativeDrawer.dataset.cduAdapterInstalled;
    }
  }

  function requestAppDrawerOpen(source) {
    const appDrawerApi = window.CartDrawerUpsell;

    if (
      appDrawerApi &&
      typeof appDrawerApi.open === "function"
    ) {
      void appDrawerApi.open();
    } else {
      window.setTimeout(() => {
        if (
          window.CartDrawerUpsell &&
          typeof window.CartDrawerUpsell.open ===
            "function"
        ) {
          void window.CartDrawerUpsell.open();
        }
      }, 50);
    }

    if (shouldReplaceNativeDrawer()) {
      closeNativeCartDrawers();
    }

    document.dispatchEvent(
      new CustomEvent("cdu:native-cart-open-request", {
        detail: {
          source,
        },
      }),
    );
  }

  function closeNativeCartDrawers() {
    document
      .querySelectorAll("cart-drawer")
      .forEach((nativeDrawer) => {
        if (
          nativeDrawer.classList.contains("active") &&
          typeof nativeDrawer.close === "function"
        ) {
          nativeDrawer.close();
        }
      });
  }

  function patchDawnCartDrawers() {
    const appDrawer = getAppDrawer();

    if (!appDrawer) return;

    const replaceNativeDrawer =
      appDrawer.dataset.cduReplaceNativeDrawer === "true";

    document
      .querySelectorAll("cart-drawer")
      .forEach((nativeDrawer) => {
        if (!replaceNativeDrawer) {
          restoreDawnCartDrawer(nativeDrawer);
          return;
        }

        let didPatch = false;

        if (
          typeof nativeDrawer.open === "function" &&
          typeof nativeDrawer[originalOpenKey] !==
            "function"
        ) {
          nativeDrawer[originalOpenKey] =
            nativeDrawer.open;

          nativeDrawer.open = function () {
            requestAppDrawerOpen("dawn-open");
          };

          didPatch = true;
        }

        if (
          typeof nativeDrawer.renderContents ===
            "function" &&
          typeof nativeDrawer[
            originalRenderContentsKey
          ] !== "function"
        ) {
          nativeDrawer[originalRenderContentsKey] =
            nativeDrawer.renderContents;

          nativeDrawer.renderContents = function () {
            requestAppDrawerOpen("dawn-render-contents");
          };

          didPatch = true;
        }

        if (didPatch) {
          nativeDrawer.dataset.cduAdapterInstalled =
            "true";
        }

        closeNativeCartDrawers();
      });
  }

  function observeDawnCartDrawerChanges() {
    if (dawnObserver) return;

    dawnObserver = new MutationObserver(() => {
      patchDawnCartDrawers();
    });

    dawnObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function installDawnCartDrawerAdapter() {
    patchDawnCartDrawers();
    observeDawnCartDrawerChanges();

    if (window.__cduWaitingForDawnCartDrawer) return;

    window.__cduWaitingForDawnCartDrawer = true;

    customElements
      .whenDefined("cart-drawer")
      .then(() => {
        window.__cduWaitingForDawnCartDrawer = false;
        patchDawnCartDrawers();
      })
      .catch((error) => {
        window.__cduWaitingForDawnCartDrawer = false;
        console.error(
          "[Cart Drawer Upsell] Dawn adapter failed:",
          error,
        );
      });
  }

  function initializeCompat() {
    installCartAddFallbacks();
    installDawnCartDrawerAdapter();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeCompat,
      {
        once: true,
      },
    );
  } else {
    initializeCompat();
  }

  document.addEventListener(
    "shopify:section:load",
    installDawnCartDrawerAdapter,
  );
})();
