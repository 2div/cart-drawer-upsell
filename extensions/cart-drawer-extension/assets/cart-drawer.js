(() => {

  const ORIGINAL_DAWN_OPEN = "__cduOriginalOpen";

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
        "[Cart Drawer Upsell] Dawn adapter failed:",
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

    const openButton = root.querySelector(
      "[data-cdu-open]",
    );
    const closeButton = root.querySelector(
      "[data-cdu-close]",
    );
    const overlay = root.querySelector(
      "[data-cdu-overlay]",
    );
    const panel = root.querySelector(
      "[data-cdu-panel]",
    );
    const content = root.querySelector(
      "[data-cdu-content]",
    );
    const footer = root.querySelector(
      "[data-cdu-footer]",
    );
    const subtotal = root.querySelector(
      "[data-cdu-subtotal]",
    );
    const status = root.querySelector(
      "[data-cdu-status]",
    );
    const shippingProgress = root.querySelector(
      "[data-cdu-shipping-progress]",
    );

    const shippingMessageElement = root.querySelector(
      "[data-cdu-shipping-message]",
    );

    const shippingTrack = root.querySelector(
      "[data-cdu-shipping-track]",
    );

    const shippingBar = root.querySelector(
      "[data-cdu-shipping-bar]",
    );

    document.addEventListener(
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
        signal,
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
        "[Cart Drawer Upsell] Required drawer markup is missing.",
      );

      return;
    }

    root.dataset.cduInitialized = "true";

    const listenerController = new AbortController();
    const { signal } = listenerController;

    let previouslyFocusedElement = null;
    let isUpdating = false;
    let lastExternalOpenHandledAt = 0;

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
        .querySelectorAll("[data-cdu-cart-action]")
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
        content.innerHTML = `
          <div class="cdu-cart-drawer__empty">
            <p>Your cart is empty.</p>
          </div>
        `;

        footer.hidden = true;

        return;
      }

      content.innerHTML = `
        <div class="cdu-cart-drawer__items">
          ${cart.items
            .map((item) => {
              const productTitle =
                item.product_title ||
                item.title ||
                "Product";

              const lowerQuantity = Math.max(
                item.quantity - 1,
                0,
              );

              return `
                <article class="cdu-cart-item">
                  ${
                    item.image
                      ? `
                        <img
                          class="cdu-cart-item__image"
                          src="${escapeHtml(item.image)}"
                          alt="${escapeHtml(productTitle)}"
                          width="88"
                          height="88"
                          loading="lazy"
                        >
                      `
                      : ""
                  }

                  <div class="cdu-cart-item__details">
                    <h3 class="cdu-cart-item__title">
                      ${escapeHtml(productTitle)}
                    </h3>

                    ${
                      item.variant_title &&
                      item.variant_title !==
                        "Default Title"
                        ? `
                          <p class="cdu-cart-item__variant">
                            ${escapeHtml(
                              item.variant_title,
                            )}
                          </p>
                        `
                        : ""
                    }

                    <p class="cdu-cart-item__price">
                      ${formatMoney(
                        item.final_line_price,
                        cart.currency,
                      )}
                    </p>

                    <div class="cdu-cart-item__bottom">
                      <div
                        class="cdu-quantity"
                        role="group"
                        aria-label="Quantity for ${escapeHtml(
                          productTitle,
                        )}"
                      >
                        <button
                          type="button"
                          class="cdu-quantity__button"
                          data-cdu-cart-action="decrease"
                          data-cdu-line-key="${escapeHtml(
                            item.key,
                          )}"
                          data-cdu-quantity="${lowerQuantity}"
                          aria-label="Decrease quantity of ${escapeHtml(
                            productTitle,
                          )}"
                        >
                          &minus;
                        </button>

                        <span
                          class="cdu-quantity__value"
                          aria-label="Current quantity"
                        >
                          ${item.quantity}
                        </span>

                        <button
                          type="button"
                          class="cdu-quantity__button"
                          data-cdu-cart-action="increase"
                          data-cdu-line-key="${escapeHtml(
                            item.key,
                          )}"
                          data-cdu-quantity="${
                            item.quantity + 1
                          }"
                          aria-label="Increase quantity of ${escapeHtml(
                            productTitle,
                          )}"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        class="cdu-cart-item__remove"
                        data-cdu-cart-action="remove"
                        data-cdu-line-key="${escapeHtml(
                          item.key,
                        )}"
                        data-cdu-quantity="0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      `;

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
          "The cart could not be updated."
        );
      } catch {
        return "The cart could not be updated.";
      }
    }

    async function refreshCart({
      showLoading = true,
    } = {}) {
      if (showLoading) {
        content.innerHTML = `
          <p class="cdu-cart-drawer__loading">
            Loading cart...
          </p>
        `;

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
          "[Cart Drawer Upsell]",
          error,
        );

        content.innerHTML = `
          <p class="cdu-cart-drawer__error">
            We could not load your cart. Please try again.
          </p>
        `;

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
        const response = await fetch(
          `${getRouteRoot()}cart/change.js`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
              body: JSON.stringify({
              id: lineKey,
              quantity,
              sections: [
                "cart-icon-bubble",
              ],
              sections_url:
                window.location.pathname,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response),
          );
        }

        const cart = await response.json();

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
        console.error(
          "[Cart Drawer Upsell]",
          error,
        );

        announce(
          error instanceof Error
            ? error.message
            : "The cart could not be updated.",
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
        closeButton.focus();
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
        previouslyFocusedElement.focus();
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
          window.setTimeout(
            resolve,
            delay,
          );
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
          "[Cart Drawer Upsell] Standard cart update failed:",
          error,
        );
      }
    }

    content.addEventListener(
      "click",
      (event) => {
        if (
          !(event.target instanceof Element)
        ) {
          return;
        }

        const button =
          event.target.closest(
            "[data-cdu-cart-action]",
          );

        if (
          !button ||
          !content.contains(button)
        ) {
          return;
        }

        const lineKey =
          button.dataset.cduLineKey;

        const quantity = Number(
          button.dataset.cduQuantity,
        );

        const action =
          button.dataset.cduCartAction;

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
      {
        signal,
      },
    );

    document.addEventListener(
      "shopify:cart:lines-update",
      handleStandardCartUpdate,
      {
        signal,
      },
    );

    document.addEventListener(
      "cdu:cart:add-success",
      handleSuccessfulCartAdd,
      {
        signal,
      },
    );

    document.addEventListener(
      "cdu:native-cart-open-request",
      handleNativeCartOpenRequest,
      {
        signal,
      },
    );

    openButton.addEventListener(
      "click",
      () => {
        void openDrawer();
      },
      {
        signal,
      },
    );

    closeButton.addEventListener(
      "click",
      closeDrawer,
      {
        signal,
      },
    );

    overlay.addEventListener(
      "click",
      closeDrawer,
      {
        signal,
      },
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          root.classList.contains("is-open")
        ) {
          closeDrawer();
        }
      },
      {
        signal,
      },
    );

    /*
     * Clean up listeners when Shopify's Theme Editor
     * removes this app embed from the page.
     */
    document.addEventListener(
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
      {
        signal,
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