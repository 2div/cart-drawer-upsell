(() => {
  const rootSelector = "[data-cdu-cart-drawer]";

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

  function readConfig(root) {
    try {
      return JSON.parse(
        root.querySelector("[data-cdu-upsell-config]")
          ?.textContent || "{}",
      );
    } catch {
      return {
        enabled: false,
        products: [],
      };
    }
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

  function renderUpsells(root, cart) {
    const container = root.querySelector(
      "[data-cdu-upsells]",
    );
    const config = readConfig(root);

    if (!container || !config.enabled || !cart) {
      if (container) container.innerHTML = "";
      return;
    }

    const cartProductIds = new Set(
      (cart.items || []).map((item) =>
        String(item.product_id),
      ),
    );
    const cartHandles = new Set(
      (cart.items || []).map((item) => item.handle),
    );
    const products = Array.isArray(config.products)
      ? config.products.filter((product) => {
          return (
            product?.variantId &&
            !cartProductIds.has(
              getIdNumber(product.id),
            ) &&
            !cartHandles.has(product.handle)
          );
        })
      : [];

    container.innerHTML = products.length
      ? `<section class="cdu-u"><h3 class="cdu-u__h">You may also like</h3>${products
          .map((product) => {
            const title = escapeHtml(product.title);
            const image = product.image?.originalSrc
              ? `<img class="cdu-u__img" src="${escapeHtml(
                  product.image.originalSrc,
                )}" alt="${escapeHtml(
                  product.image.altText || product.title,
                )}" width="56" height="56" loading="lazy">`
              : "";

            return `<article class="cdu-u__i">${image}<div><p class="cdu-u__t">${title}</p><button type="button" class="cdu-u__b" data-cdu-upsell-add="${escapeHtml(
              getIdNumber(product.variantId),
            )}">Add</button></div></article>`;
          })
          .join("")}</section>`
      : "";
  }

  async function refreshUpsells(root) {
    renderUpsells(root, await getCart());
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

      button.disabled = true;

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

      button.disabled = false;

      if (response.ok) {
        await refreshUpsells(root);
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
