(() => {
  const rootSelector = "[data-cdu-cart-drawer]";
  const unavailableVariants = new Map();

  function getRouteRoot() {
    return window.Shopify?.routes?.root || "/";
  }

  function escapeHtml(value = "") {
    const element = document.createElement("div");

    element.textContent = String(value);

    return element.innerHTML;
  }

  function getIdNumber(id = "") {
    return String(id).split("/").pop();
  }

  function formatPrice(price) {
    if (!price?.amount) return "";

    try {
      return new Intl.NumberFormat(
        document.documentElement.lang || "en",
        {
          style: "currency",
          currency: price.currencyCode || "USD",
        },
      ).format(Number(price.amount));
    } catch {
      return price.amount;
    }
  }

  function readConfig(root) {
    try {
      const parsed = JSON.parse(
        root.querySelector("[data-cdu-upsell-config]")
          ?.textContent || "{}",
      );

      return typeof parsed === "string"
        ? JSON.parse(parsed)
        : parsed;
    } catch {
      return {
        enabled: false,
        products: [],
      };
    }
  }

  function getUpsellHeading(root) {
    return (
      root.dataset.cduUpsellHeading?.trim() ||
      "You may also like"
    );
  }

  function getUpsellLimit(root) {
    const limit = Number(root.dataset.cduUpsellLimit || 0);

    return Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), 4)
      : 4;
  }

  async function getCart() {
    const response = await fetch(
      `${getRouteRoot()}cart.js`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) return null;

    return response.json();
  }

  async function readAddError(response) {
    try {
      const data = await response.json();

      return data.description || data.message || "";
    } catch {
      return "";
    }
  }

  function isAvailabilityError(message) {
    return /sold|stock|inventory|available/i.test(message);
  }

  function getAvailabilityMessage(message) {
    if (/already sold out/i.test(message)) {
      return "This item is already sold out.";
    }

    return message || "This item is currently unavailable.";
  }

  function setUpsellMessage(button, message) {
    const item = button.closest(".cdu-u__i");
    const messageElement = item?.querySelector(".cdu-u__m");

    if (messageElement) {
      messageElement.textContent = message;
      return;
    }

    item
      ?.querySelector(".cdu-u__d")
      ?.insertAdjacentHTML(
        "beforeend",
        `<p class="cdu-u__m">${escapeHtml(message)}</p>`,
      );
  }

  function renderUpsells(root, cart) {
    const container = root.querySelector(
      "[data-cdu-upsells]",
    );
    const config = readConfig(root);

    if (!container || !config.enabled || !cart) {
      if (container) container.innerHTML = "";
      return;
    }

    const cartItems = (cart.items || []).filter(
      (item) => Number(item.quantity) > 0,
    );
    const cartProductIds = new Set(
      cartItems.map((item) =>
        String(item.product_id),
      ),
    );
    const cartHandles = new Set(
      cartItems.map((item) => item.handle),
    );
    const products = Array.isArray(config.products)
      ? config.products
          .filter((product) => {
            return (
              product?.variantId &&
              !cartProductIds.has(
                getIdNumber(product.id),
              ) &&
              !cartHandles.has(product.handle)
            );
          })
          .slice(0, getUpsellLimit(root))
      : [];
    const heading = escapeHtml(getUpsellHeading(root));

    container.innerHTML = products.length
      ? `<section class="cdu-u"><h3 class="cdu-u__h">${heading}</h3>${products
          .map((product) => {
            const title = escapeHtml(product.title);
            const variantTitle =
              product.variantTitle &&
              product.variantTitle !== "Default Title"
                ? escapeHtml(product.variantTitle)
                : "";
            const price = formatPrice(product.price);
            const variantId = getIdNumber(product.variantId);
            const isUnavailable =
              product.availableForSale === false ||
              unavailableVariants.has(variantId);
            const unavailableMessage =
              unavailableVariants.get(variantId) ||
              "This item is sold out.";
            const image = product.image?.originalSrc
              ? `<img class="cdu-u__img" src="${escapeHtml(
                  product.image.originalSrc,
                )}" alt="${escapeHtml(
                  product.image.altText || product.title,
                )}" width="56" height="56" loading="lazy">`
              : '<span class="cdu-u__img cdu-u__img--empty" aria-hidden="true"></span>';

            return `<article class="cdu-u__i${
              isUnavailable ? " is-unavailable" : ""
            }">${image}<div class="cdu-u__d"><p class="cdu-u__t">${title}</p>${variantTitle ? `<p class="cdu-u__v">${variantTitle}</p>` : ""}${price ? `<p class="cdu-u__p">${escapeHtml(price)}</p>` : ""}${isUnavailable ? `<p class="cdu-u__m">${escapeHtml(unavailableMessage)}</p>` : ""}</div><button type="button" class="cdu-u__b" data-cdu-upsell-add="${escapeHtml(
              variantId,
            )}" ${isUnavailable ? "disabled" : ""}>${
              isUnavailable ? "Sold out" : "Add"
            }</button></article>`;
          })
          .join("")}</section>`
      : "";
  }

  async function refreshUpsells(root) {
    renderUpsells(root, await getCart());
  }

  function dispatchCartUpdated(cart) {
    document.dispatchEvent(
      new CustomEvent("cdu:cart:updated", {
        detail: {
          cart,
          action: "upsell-add",
        },
      }),
    );
  }

  function initializeUpsells(root) {
    if (root.dataset.cduUpsellsInitialized === "true") {
      return;
    }

    root.dataset.cduUpsellsInitialized = "true";

    root.addEventListener("click", async (event) => {
      const button = event.target?.closest?.(
        "[data-cdu-upsell-add]",
      );

      if (!button || !root.contains(button)) return;

      const label = button.textContent;
      button.disabled = true;
      button.classList.add("is-loading");
      button.setAttribute("aria-busy", "true");
      button.textContent = "Adding...";

      try {
        const response = await fetch(
          `${getRouteRoot()}cart/add.js`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id: button.dataset.cduUpsellAdd,
              quantity: 1,
            }),
          },
        );

        if (response.ok) {
          button.textContent = "Added";
          const cart = await getCart();

          if (cart) {
            dispatchCartUpdated(cart);
          } else {
            await refreshUpsells(root);
          }

          return;
        }

        const errorMessage = await readAddError(response);

        if (isAvailabilityError(errorMessage)) {
          const message =
            getAvailabilityMessage(errorMessage);

          unavailableVariants.set(
            button.dataset.cduUpsellAdd,
            message,
          );
          button.disabled = true;
          button.classList.add("is-unavailable");
          button.textContent = "Sold out";
          button
            .closest(".cdu-u__i")
            ?.classList.add("is-unavailable");
          setUpsellMessage(button, message);
          return;
        }

        button.disabled = false;
        button.textContent = "Try again";
        setUpsellMessage(
          button,
          errorMessage || "This item could not be added.",
        );
        window.setTimeout(() => {
          button.textContent = label;
        }, 1500);
      } catch {
        button.disabled = false;
        button.textContent = "Try again";
        setUpsellMessage(
          button,
          "This item could not be added. Please try again.",
        );
        window.setTimeout(() => {
          button.textContent = label;
        }, 1500);
      } finally {
        button.classList.remove("is-loading");
        button.removeAttribute("aria-busy");
      }
    });

    document.addEventListener(
      "cdu:cart:updated",
      (event) => {
        renderUpsells(root, event.detail?.cart);
      },
    );

    document.addEventListener(
      "cdu:cart:add-success",
      () => {
        window.setTimeout(() => {
          void refreshUpsells(root);
        }, 150);
      },
    );

    new MutationObserver(() => {
      if (root.classList.contains("is-open")) {
        void refreshUpsells(root);
      }
    }).observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (root.classList.contains("is-open")) {
      void refreshUpsells(root);
    }
  }

  function initializeAllUpsells() {
    document
      .querySelectorAll(rootSelector)
      .forEach(initializeUpsells);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAllUpsells,
      {
        once: true,
      },
    );
  } else {
    initializeAllUpsells();
  }

  document.addEventListener(
    "shopify:section:load",
    initializeAllUpsells,
  );
})();
