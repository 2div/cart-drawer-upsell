(() => {

  const LOG_PREFIX = "[Cart Drawer Upsell]";
  const ORIGINAL_DAWN_OPEN = "__cduOriginalOpen";
  const CART_UPDATE_ERROR =
    "The cart could not be updated.";

  function getRouteRoot() {
    return window.Shopify?.routes?.root || "/";
  }

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
      new CustomEvent("cdu:cart:add-success"),
    );
  }

  function formatCartErrorMessage(message) {
    return /already sold out/i.test(message)
      ? "Sold out."
      : message || CART_UPDATE_ERROR;
  }

  function installCartAddFallbacks() {
    if (window.__cduCartAddFallbackInstalled) return;

    window.__cduCartAddFallbackInstalled = true;

    /*
     * Fetch fallback.
     * Dawn and many modern themes use fetch() for Add to Cart.
     */
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

    /*
     * XMLHttpRequest fallback.
     * Some older or custom themes still use XHR.
     */
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
  const originalOpen =
    nativeDrawer[ORIGINAL_DAWN_OPEN];

  if (typeof originalOpen !== "function") {
    return;
  }

  nativeDrawer.open = originalOpen;

  delete nativeDrawer[ORIGINAL_DAWN_OPEN];
  delete nativeDrawer.dataset.cduAdapterInstalled;
}

function patchDawnCartDrawers() {
  const appDrawer = document.querySelector(
    "[data-cdu-cart-drawer]",
  );

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
        "true"
      ) {
        return;
      }

      /*
       * The HTML element can exist before Dawn registers
       * the cart-drawer custom element.
       */
      if (typeof nativeDrawer.open !== "function") {
        return;
      }

      nativeDrawer.dataset.cduAdapterInstalled =
        "true";

      nativeDrawer[ORIGINAL_DAWN_OPEN] =
        nativeDrawer.open;

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
  /*
   * Try immediately in case Dawn is already initialized.
   */
  patchDawnCartDrawers();

  /*
   * Also retry after Dawn defines its custom element.
   * whenDefined resolves immediately if it is already defined.
   */
  if (window.__cduWaitingForDawnCartDrawer) {
    return;
  }

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
        `${LOG_PREFIX} Dawn adapter failed:`,
        error,
      );
    });
}

  function escapeHtml(value = "") {
    const element = document.createElement("div");

    element.textContent = String(value);

    return element.innerHTML;
  }

  function formatMoney(amount, currency) {
    try {
      return new Intl.NumberFormat(
        document.documentElement.lang || "en",
        {
          style: "currency",
          currency: currency || "USD",
        },
      ).format(Number(amount) / 100);
    } catch {
      return `${(Number(amount) / 100).toFixed(2)} ${
        currency || ""
      }`.trim();
    }
  }

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])",
      ),
    ).filter((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      return (
        !element.hidden &&
        element.offsetParent !== null
      );
    });
  }

    function updateDawnCartIcon(cart) {
    const sectionHtml =
      cart?.sections?.["cart-icon-bubble"];

    const currentCartIcon = document.querySelector(
      "#cart-icon-bubble",
    );

    if (
      typeof sectionHtml !== "string" ||
      !currentCartIcon
    ) {
      return false;
    }

    const parsedDocument =
      new DOMParser().parseFromString(
        sectionHtml,
        "text/html",
      );

    const updatedCartIcon =
      parsedDocument.querySelector(
        "#cart-icon-bubble",
      );

    if (!updatedCartIcon) {
      return false;
    }

    /*
    * Keep Dawn's existing <a> element so its click listener
    * remains connected. Replace only its internal markup.
    */
    currentCartIcon.innerHTML =
      updatedCartIcon.innerHTML;

    const updatedAriaLabel =
      updatedCartIcon.getAttribute("aria-label");

    if (updatedAriaLabel) {
      currentCartIcon.setAttribute(
        "aria-label",
        updatedAriaLabel,
      );
    }

    return true;
  }

  function updateGenericCartCount(cart) {
    const itemCount = Number(
      cart?.item_count || 0,
    );

    /*
    * Generic fallback for themes that expose a simple
    * data-cart-count element.
    */
    document
      .querySelectorAll("[data-cart-count]")
      .forEach((countElement) => {
        if (countElement.children.length === 0) {
          countElement.textContent =
            String(itemCount);
        }

        countElement.hidden =
          itemCount === 0;
      });

    /*
    * Common fallback used by Dawn-derived themes.
    */
    document
      .querySelectorAll(".cart-count-bubble")
      .forEach((bubble) => {
        bubble.hidden = itemCount === 0;

        const visibleCount =
          bubble.querySelector(
            "span:not(.visually-hidden)",
          );

        if (visibleCount) {
          visibleCount.textContent =
            String(itemCount);
        }
      });
  }

  function updateThemeCartUI(cart) {
    const dawnUpdated =
      updateDawnCartIcon(cart);

    if (!dawnUpdated) {
      updateGenericCartCount(cart);
    }
  }

  function initializeCartDrawer(root) {
    if (root.dataset.cduInitialized === "true") return;

    const getElement = (name) =>
      root.querySelector(`[data-cdu-${name}]`);

    const openButton = getElement("open");
    const closeButton = getElement("close");
    const overlay = getElement("overlay");
    const panel = getElement("panel");
    const content = getElement("content");
    const footer = getElement("footer");
    const subtotal = getElement("subtotal");
    const status = getElement("status");
    const shippingProgress = getElement(
      "shipping-progress",
    );
    const shippingMessageElement = getElement(
      "shipping-message",
    );
    const shippingTrack = getElement(
      "shipping-track",
    );
    const shippingBar = getElement("shipping-bar");
    const listenerController = new AbortController();
    const abortSignal = listenerController.signal;
    const listen = (
      target,
      eventName,
      handler,
      options = {},
    ) => {
      target.addEventListener(eventName, handler, {
        ...options,
        signal: abortSignal,
      });
    };

    listen(
      document,
      "pointerdown",
      (event) => {
        if (!root.classList.contains("is-open")) {
          return;
        }

        const eventPath = event.composedPath();

        // Clicking anywhere inside the drawer should not close it.
        if (eventPath.includes(panel)) {
          return;
        }

        closeDrawer();
      },
      {
        capture: true,
      },
    );

    const showShippingProgress =
      root.dataset.cduShowShippingProgress === "true";

    const shippingGoalMajor = Number(
      root.dataset.cduShippingGoal || 0,
    );

    const shippingMessage =
      root.dataset.cduShippingMessage ||
      "You are {{ amount }} away from free shipping";

    const shippingSuccessMessage =
      root.dataset.cduShippingSuccessMessage ||
      "You have unlocked free shipping!";

    if (
      !openButton ||
      !closeButton ||
      !overlay ||
      !panel ||
      !content ||
      !footer ||
      !subtotal
    ) {
      console.error(
        `${LOG_PREFIX} Required drawer markup is missing.`,
      );

      return;
    }

    root.dataset.cduInitialized = "true";

    let previouslyFocusedElement = null;
    let isUpdating = false;
    let lastExternalOpenHandledAt = 0;
    let itemError = null;

    function focusElement(element) {
      element.focus({
        preventScroll: true,
      });
    }

    function announce(message) {
      if (!status) return;

      status.textContent = "";

      window.requestAnimationFrame(() => {
        status.textContent = message;
      });
    }

    function setUpdating(updating) {
      isUpdating = updating;

      root.classList.toggle(
        "is-updating",
        updating,
      );

      content.setAttribute(
        "aria-busy",
        String(updating),
      );

      root
        .querySelectorAll("[data-cdu-action]")
        .forEach((button) => {
          button.disabled = updating;
        });
    }

    function renderShippingProgress(cart) {
  if (
    !shippingProgress ||
    !shippingMessageElement ||
    !shippingTrack ||
    !shippingBar ||
    !showShippingProgress ||
    !Number.isFinite(shippingGoalMajor) ||
    shippingGoalMajor <= 0
  ) {
    if (shippingProgress) {
      shippingProgress.hidden = true;
    }

    return;
  }

  const goalMinor = Math.round(
    shippingGoalMajor * 100,
  );

  const cartTotal = Number(
    cart?.total_price || 0,
  );

  const remaining = Math.max(
    goalMinor - cartTotal,
    0,
  );

  const progress = Math.min(
    (cartTotal / goalMinor) * 100,
    100,
  );

  shippingProgress.hidden = false;

  shippingBar.style.width = `${progress}%`;

  shippingTrack.setAttribute(
    "aria-valuenow",
    String(Math.round(progress)),
  );

  if (remaining === 0) {
    shippingProgress.classList.add(
      "is-complete",
    );

    shippingMessageElement.textContent =
      shippingSuccessMessage;

    return;
  }

  shippingProgress.classList.remove(
    "is-complete",
  );

  const formattedRemaining = formatMoney(
    remaining,
    cart.currency,
  );

  shippingMessageElement.textContent =
    shippingMessage.replace(
       "[amount]",
      formattedRemaining,
    );
}

    function renderCart(cart) {
      renderShippingProgress(cart);
      if (!cart || cart.item_count === 0) {
        content.innerHTML =
          '<div class="cdu-cart-drawer__empty"><p>Your cart is empty.</p></div>';

        footer.hidden = true;

        return;
      }

      content.innerHTML = `<div class="cdu-cart-drawer__items">${cart.items
            .map((item) => {
              const productTitle =
                item.product_title ||
                item.title ||
                "Product";
              const escapedTitle =
                escapeHtml(productTitle);
              const escapedLineKey =
                escapeHtml(item.key);
              const lineMessage =
                itemError?.lineKey === item.key
                  ? itemError.message
                  : "";
              const escapedItemError =
                escapeHtml(lineMessage);

              const lowerQuantity = Math.max(
                item.quantity - 1,
                0,
              );

              const imageHtml = item.image
                ? `<img class="cdu-ci__img" src="${escapeHtml(
                    item.image,
                  )}" alt="${escapedTitle}" width="88" height="88" loading="lazy">`
                : "";

              const variantHtml =
                item.variant_title &&
                item.variant_title !== "Default Title"
                  ? `<p class="cdu-ci__v">${escapeHtml(
                      item.variant_title,
                    )}</p>`
                  : "";

              return `<article class="cdu-ci">${imageHtml}<div class="cdu-ci__d"><h3 class="cdu-ci__t">${escapedTitle}</h3>${variantHtml}<p class="cdu-ci__p">${formatMoney(
                item.final_line_price,
                cart.currency,
              )}</p><div class="cdu-ci__b"><div class="cdu-q" role="group" aria-label="Quantity for ${escapedTitle}"><button type="button" class="cdu-q__b" data-cdu-action="decrease" data-key="${escapedLineKey}" data-qty="${lowerQuantity}" aria-label="Decrease quantity of ${escapedTitle}">&minus;</button><span class="cdu-q__v">${item.quantity}</span><button type="button" class="cdu-q__b" data-cdu-action="increase" data-key="${escapedLineKey}" data-qty="${
                item.quantity + 1
              }" aria-label="Increase quantity of ${escapedTitle}">+</button></div><button type="button" class="cdu-ci__r" data-cdu-action="remove" data-key="${escapedLineKey}" data-qty="0" aria-label="Remove ${escapedTitle}" title="Remove"></button></div><p class="cdu-ci__m" role="status" aria-live="polite"${
                lineMessage ? "" : " hidden"
              }>${escapedItemError}</p></div></article>`;
            })
            .join("")}</div>`;

      subtotal.textContent = formatMoney(
        cart.total_price,
        cart.currency,
      );

      footer.hidden = false;
    }

    async function readErrorMessage(response) {
      try {
        const errorData = await response.json();

        return (
          errorData.description ||
          errorData.message ||
          CART_UPDATE_ERROR
        );
      } catch {
        return CART_UPDATE_ERROR;
      }
    }

    async function postCart(path, payload) {
      const response = await fetch(
        `${getRouteRoot()}cart/${path}.js`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...payload,
            sections: [
              "cart-icon-bubble",
            ],
            sections_url:
              window.location.pathname,
          }),
        },
      );

      if (!response.ok) {
        const error = new Error(
          await readErrorMessage(response),
        );
        error.status = response.status;
        throw error;
      }

      return response.json();
    }

    async function refreshCart({
      showLoading = true,
    } = {}) {
      if (showLoading) {
        content.innerHTML =
          '<p class="cdu-cart-drawer__loading">Loading cart...</p>';

        footer.hidden = true;
      }

      try {
        const response = await fetch(
          `${getRouteRoot()}cart.js`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Cart request failed: ${response.status}`,
          );
        }

        const cart = await response.json();

        renderCart(cart);
        
        updateThemeCartUI(cart);

        return cart;
      } catch (error) {
        console.error(
          LOG_PREFIX,
          error,
        );

        content.innerHTML =
          '<p class="cdu-cart-drawer__error">We could not load your cart. Please try again.</p>';

        footer.hidden = true;

        return null;
      }
    }

    async function changeCartLine({
      lineKey,
      quantity,
      action,
    }) {
      if (isUpdating) return;

      setUpdating(true);

      try {
        itemError = null;

        const cart = await postCart("change", {
          id: lineKey,
          quantity,
        });

        renderCart(cart);
        updateThemeCartUI(cart);

        if (
          action === "remove" ||
          quantity === 0
        ) {
          announce(
            "Item removed from the cart.",
          );
        } else {
          announce(
            "Cart quantity updated.",
          );
        }

        document.dispatchEvent(
          new CustomEvent("cdu:cart:updated", {
            detail: {
              cart,
              action,
            },
          }),
        );
      } catch (error) {
        const message =
          formatCartErrorMessage(
            error instanceof Error
              ? error.message
              : CART_UPDATE_ERROR,
          );
        const isExpectedCartError =
          error?.status >= 400 && error.status < 500;

        if (!isExpectedCartError) {
          console.error(
            LOG_PREFIX,
            error,
          );
        }

        itemError = {
          lineKey,
          message,
        };

        announce(
          message,
        );

        await refreshCart({
          showLoading: false,
        });
      } finally {
        setUpdating(false);
      }
    }

    async function openDrawer({
      refresh = true,
    } = {}) {
      const wasOpen =
        root.classList.contains("is-open");

      if (!wasOpen) {
        previouslyFocusedElement =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
      }

      root.classList.add("is-open");

      document.documentElement.classList.add(
        "cdu-cart-drawer-open",
      );

      openButton.setAttribute(
        "aria-expanded",
        "true",
      );

      panel.setAttribute(
        "aria-hidden",
        "false",
      );

      if (!wasOpen) {
        focusElement(closeButton);
      }

      if (refresh) {
        await refreshCart();
      }
    }

    function closeDrawer() {
      if (!root.classList.contains("is-open")) {
        return;
      }

      root.classList.remove("is-open");

      document.documentElement.classList.remove(
        "cdu-cart-drawer-open",
      );

      openButton.setAttribute(
        "aria-expanded",
        "false",
      );

      panel.setAttribute(
        "aria-hidden",
        "true",
      );

      if (previouslyFocusedElement?.isConnected) {
        focusElement(previouslyFocusedElement);
      }
    }

    function keepFocusInsideDrawer(event) {
      if (
        event.key !== "Tab" ||
        !root.classList.contains("is-open")
      ) {
        return;
      }

      const focusableElements =
        getFocusableElements(panel);
      const firstFocusableElement =
        focusableElements[0];
      const lastFocusableElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (!firstFocusableElement) {
        event.preventDefault();
        focusElement(panel);

        return;
      }

      if (
        !panel.contains(document.activeElement) ||
        (event.shiftKey &&
          document.activeElement ===
            firstFocusableElement) ||
        (!event.shiftKey &&
          document.activeElement ===
            lastFocusableElement)
      ) {
        event.preventDefault();

        focusElement(
          event.shiftKey
            ? lastFocusableElement
            : firstFocusableElement,
        );
      }
    }

    async function openFromExternalRequest({
      delay = 0,
    } = {}) {
      const now = Date.now();

      /*
       * Prevent duplicate opening when Dawn, Fetch/XHR,
       * and Shopify standard events fire for one request.
       */
      if (
        now - lastExternalOpenHandledAt <
        500
      ) {
        return;
      }

      lastExternalOpenHandledAt = now;

      if (delay > 0) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, delay);
        });
      }

      await refreshCart();

      await openDrawer({
        refresh: false,
      });
    }

    async function handleSuccessfulCartAdd() {
      await openFromExternalRequest({
        delay: 100,
      });
    }

    async function handleNativeCartOpenRequest() {
      await openFromExternalRequest();
    }

    async function handleStandardCartUpdate(
      event,
    ) {
      try {
        if (event.promise) {
          await event.promise;
        }

        if (event.action === "add") {
          await openFromExternalRequest();

          return;
        }

        if (
          root.classList.contains("is-open")
        ) {
          await refreshCart({
            showLoading: false,
          });
        }
      } catch (error) {
        console.error(
          `${LOG_PREFIX} Standard cart update failed:`,
          error,
        );
      }
    }

    listen(
      content,
      "click",
      (event) => {
        if (
          !(event.target instanceof Element)
        ) {
          return;
        }

        const button =
          event.target.closest(
            "[data-cdu-action]",
          );

        if (
          !button ||
          !content.contains(button)
        ) {
          return;
        }

        const lineKey =
          button.dataset.key;

        const quantity = Number(
          button.dataset.qty,
        );

        const action =
          button.dataset.cduAction;

        if (
          !lineKey ||
          !Number.isInteger(quantity) ||
          quantity < 0
        ) {
          return;
        }

        void changeCartLine({
          lineKey,
          quantity,
          action,
        });
      },
    );

    listen(
      document,
      "shopify:cart:lines-update",
      handleStandardCartUpdate,
    );

    listen(
      document,
      "cdu:cart:add-success",
      handleSuccessfulCartAdd,
    );

    listen(
      document,
      "cdu:native-cart-open-request",
      handleNativeCartOpenRequest,
    );

    listen(
      openButton,
      "click",
      () => {
        void openDrawer();
      },
    );

    listen(
      closeButton,
      "click",
      closeDrawer,
    );

    listen(
      overlay,
      "click",
      closeDrawer,
    );

    listen(
      document,
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          root.classList.contains("is-open")
        ) {
          closeDrawer();
        }

        keepFocusInsideDrawer(event);
      },
    );

    /*
     * Clean up listeners when Shopify's Theme Editor
     * removes this app embed from the page.
     */
    listen(
      document,
      "shopify:section:unload",
      () => {
        window.setTimeout(() => {
          if (!root.isConnected) {
            closeDrawer();
            listenerController.abort();
            installDawnCartDrawerAdapter();
          }
        }, 0);
      },
    );
  }

  function initializeAllCartDrawers() {
    document
      .querySelectorAll(
        "[data-cdu-cart-drawer]",
      )
      .forEach(initializeCartDrawer);

    installDawnCartDrawerAdapter();
  }

  installCartAddFallbacks();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAllCartDrawers,
      {
        once: true,
      },
    );
  } else {
    initializeAllCartDrawers();
  }

  document.addEventListener(
    "shopify:section:load",
    initializeAllCartDrawers,
  );
})();
