(() => {
  const drawerSelector = "[data-cdu-cart-drawer]";
  const originalOpenKey = "__cduOriginalOpen";

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
    document.dispatchEvent(
      new Event("cdu:cart:add-success"),
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

    if (typeof originalOpen !== "function") return;

    nativeDrawer.open = originalOpen;

    delete nativeDrawer[originalOpenKey];
    delete nativeDrawer.dataset.cduAdapterInstalled;
  }

  function patchDawnCartDrawers() {
    const appDrawer =
      document.querySelector(drawerSelector);

    if (!appDrawer) return;

    const shouldReplaceNativeDrawer =
      appDrawer.dataset.cduReplaceNativeDrawer === "true";

    document
      .querySelectorAll("cart-drawer")
      .forEach((nativeDrawer) => {
        if (!shouldReplaceNativeDrawer) {
          restoreDawnCartDrawer(nativeDrawer);
          return;
        }

        if (
          nativeDrawer.dataset.cduAdapterInstalled ===
            "true" ||
          typeof nativeDrawer.open !== "function"
        ) {
          return;
        }

        nativeDrawer.dataset.cduAdapterInstalled = "true";
        nativeDrawer[originalOpenKey] = nativeDrawer.open;

        nativeDrawer.open = function () {
          document.dispatchEvent(
            new CustomEvent(
              "cdu:native-cart-open-request",
              {
                detail: {
                  source: "dawn",
                },
              },
            ),
          );
        };

        if (
          nativeDrawer.classList.contains("active") &&
          typeof nativeDrawer.close === "function"
        ) {
          nativeDrawer.close();
        }
      });
  }

  function installDawnCartDrawerAdapter() {
    patchDawnCartDrawers();

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
