(() => {
  function getRouteRoot() {
    return window.Shopify?.routes?.root || "/";
  }

  function escapeHtml(value = "") {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
  }

  function formatMoney(amount, currency) {
    return new Intl.NumberFormat(
      document.documentElement.lang || "en",
      {
        style: "currency",
        currency: currency || "USD",
      },
    ).format(amount / 100);
  }

  function initializeCartDrawer(root) {
    if (root.dataset.cduInitialized === "true") return;

    root.dataset.cduInitialized = "true";

    const openButton = root.querySelector("[data-cdu-open]");
    const closeButton = root.querySelector("[data-cdu-close]");
    const overlay = root.querySelector("[data-cdu-overlay]");
    const panel = root.querySelector("[data-cdu-panel]");
    const content = root.querySelector("[data-cdu-content]");
    const footer = root.querySelector("[data-cdu-footer]");
    const subtotal = root.querySelector("[data-cdu-subtotal]");
    const status = root.querySelector("[data-cdu-status]");

    if (
      !openButton ||
      !closeButton ||
      !overlay ||
      !panel ||
      !content ||
      !footer ||
      !subtotal
    ) {
      return;
    }

    let previouslyFocusedElement = null;
    let isUpdating = false;

    function announce(message) {
      if (!status) return;

      status.textContent = "";

      window.requestAnimationFrame(() => {
        status.textContent = message;
      });
    }

    function setUpdating(updating) {
      isUpdating = updating;

      root.classList.toggle("is-updating", updating);
      content.setAttribute("aria-busy", String(updating));

      root
        .querySelectorAll("[data-cdu-cart-action]")
        .forEach((button) => {
          button.disabled = updating;
        });
    }

    function renderCart(cart) {
      if (cart.item_count === 0) {
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
            .map((item, index) => {
              const line = index + 1;
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
                          alt="${escapeHtml(item.product_title)}"
                          width="88"
                          height="88"
                          loading="lazy"
                        >
                      `
                      : ""
                  }

                  <div class="cdu-cart-item__details">
                    <h3 class="cdu-cart-item__title">
                      ${escapeHtml(item.product_title)}
                    </h3>

                    ${
                      item.variant_title &&
                      item.variant_title !== "Default Title"
                        ? `
                          <p class="cdu-cart-item__variant">
                            ${escapeHtml(item.variant_title)}
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
                        aria-label="Quantity for ${escapeHtml(
                          item.product_title,
                        )}"
                      >
                        <button
                          type="button"
                          class="cdu-quantity__button"
                          data-cdu-cart-action="decrease"
                          data-cdu-line="${line}"
                          data-cdu-quantity="${lowerQuantity}"
                          aria-label="Decrease quantity of ${escapeHtml(
                            item.product_title,
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
                          data-cdu-line="${line}"
                          data-cdu-quantity="${item.quantity + 1}"
                          aria-label="Increase quantity of ${escapeHtml(
                            item.product_title,
                          )}"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        class="cdu-cart-item__remove"
                        data-cdu-cart-action="remove"
                        data-cdu-line="${line}"
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

    async function refreshCart() {
      content.innerHTML = `
        <p class="cdu-cart-drawer__loading">
          Loading cart...
        </p>
      `;

      footer.hidden = true;

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
      } catch (error) {
        console.error("[Cart Drawer Upsell]", error);

        content.innerHTML = `
          <p class="cdu-cart-drawer__error">
            We could not load your cart. Please try again.
          </p>
        `;
      }
    }

    async function changeCartLine({
      line,
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
              line,
              quantity,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const cart = await response.json();

        renderCart(cart);

        if (action === "remove" || quantity === 0) {
          announce("Item removed from the cart.");
        } else {
          announce("Cart quantity updated.");
        }

        document.dispatchEvent(
          new CustomEvent("cdu:cart:updated", {
            detail: { cart },
          }),
        );
      } catch (error) {
        console.error("[Cart Drawer Upsell]", error);

        announce(
          error instanceof Error
            ? error.message
            : "The cart could not be updated.",
        );

        await refreshCart();
      } finally {
        setUpdating(false);
      }
    }

    async function openDrawer() {
      previouslyFocusedElement = document.activeElement;

      root.classList.add("is-open");
      document.documentElement.classList.add(
        "cdu-cart-drawer-open",
      );

      openButton.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");

      closeButton.focus();

      await refreshCart();
    }

    function closeDrawer() {
      root.classList.remove("is-open");
      document.documentElement.classList.remove(
        "cdu-cart-drawer-open",
      );

      openButton.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");

      previouslyFocusedElement?.focus();
    }

    content.addEventListener("click", (event) => {
      const button = event.target.closest(
        "[data-cdu-cart-action]",
      );

      if (!button || !content.contains(button)) return;

      const line = Number(button.dataset.cduLine);
      const quantity = Number(button.dataset.cduQuantity);
      const action = button.dataset.cduCartAction;

      if (
        !Number.isInteger(line) ||
        line < 1 ||
        !Number.isInteger(quantity) ||
        quantity < 0
      ) {
        return;
      }

      changeCartLine({
        line,
        quantity,
        action,
      });
    });

    openButton.addEventListener("click", openDrawer);
    closeButton.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        root.classList.contains("is-open")
      ) {
        closeDrawer();
      }
    });
  }

  function initializeAllCartDrawers() {
    document
      .querySelectorAll("[data-cdu-cart-drawer]")
      .forEach(initializeCartDrawer);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAllCartDrawers,
    );
  } else {
    initializeAllCartDrawers();
  }

  document.addEventListener(
    "shopify:section:load",
    initializeAllCartDrawers,
  );
})();