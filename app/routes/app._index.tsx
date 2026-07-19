import { useEffect, useMemo, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

const UPSELL_CONFIG_NAMESPACE = "cart_drawer_upsell";
const UPSELL_CONFIG_KEY = "settings";
const MAX_UPSELL_PRODUCTS = 4;

type UpsellProduct = {
  id: string;
  title: string;
  handle: string;
  status?: string;
  variantId?: string;
  variantTitle?: string;
  availableForSale?: boolean;
  price?: {
    amount: string;
    currencyCode?: string;
  } | null;
  image?: {
    altText?: string | null;
    originalSrc: string;
  } | null;
};

type UpsellConfig = {
  enabled: boolean;
  products: UpsellProduct[];
};

type GraphQlUserError = {
  field?: string[] | null;
  message: string;
};

type UpsellProductNode = {
  id: string;
  title?: string | null;
  handle?: string | null;
  status?: string | null;
  featuredImage?: {
    altText?: string | null;
    url?: string | null;
  } | null;
  variants?: {
    nodes?: {
      id?: string | null;
      title?: string | null;
      availableForSale?: boolean | null;
      price?: string | null;
    }[];
  } | null;
};

const DEFAULT_UPSELL_CONFIG: UpsellConfig = {
  enabled: false,
  products: [],
};

function parseUpsellConfig(value: unknown): UpsellConfig {
  if (!value || typeof value !== "object") {
    return DEFAULT_UPSELL_CONFIG;
  }

  const parsed = value as Partial<UpsellConfig>;

  return {
    enabled: parsed.enabled === true,
    products: Array.isArray(parsed.products)
      ? parsed.products
          .filter((product): product is UpsellProduct => {
            return (
              typeof product?.id === "string" &&
              typeof product.title === "string" &&
              typeof product.handle === "string" &&
              (typeof product.status === "string" ||
                typeof product.status === "undefined") &&
              (typeof product.variantId === "string" ||
                typeof product.variantId === "undefined") &&
              (typeof product.variantTitle === "string" ||
                typeof product.variantTitle ===
                  "undefined") &&
              (typeof product.availableForSale === "boolean" ||
                typeof product.availableForSale ===
                  "undefined") &&
              (typeof product.price === "object" ||
                typeof product.price === "undefined")
            );
          })
          .slice(0, MAX_UPSELL_PRODUCTS)
      : [],
  };
}

function dedupeProducts(products: UpsellProduct[]) {
  const productsById = new Map<string, UpsellProduct>();

  for (const product of products) {
    if (!productsById.has(product.id)) {
      productsById.set(product.id, product);
    }
  }

  return [...productsById.values()].slice(0, MAX_UPSELL_PRODUCTS);
}

function formatProductPrice(price: UpsellProduct["price"]) {
  if (!price?.amount) return "";

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: price.currencyCode || "USD",
    }).format(Number(price.amount));
  } catch {
    return price.amount;
  }
}

function getComparableConfig(config: UpsellConfig) {
  return JSON.stringify({
    enabled: config.enabled,
    products: config.products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      variantId: product.variantId,
      variantTitle: product.variantTitle,
      availableForSale: product.availableForSale,
      price: product.price,
      image: product.image,
    })),
  });
}

async function enrichProductsWithVariants(
  admin: Awaited<
    ReturnType<typeof authenticate.admin>
  >["admin"],
  products: UpsellProduct[],
) {
  if (products.length === 0) return products;

  const response = await admin.graphql(
    `#graphql
      query CartDrawerUpsellProducts($ids: [ID!]!) {
        shop {
          currencyCode
        }
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            handle
            status
            featuredImage {
              altText
              url
            }
            variants(first: 50) {
              nodes {
                id
                title
                availableForSale
                price
              }
            }
          }
        }
      }`,
    {
      variables: {
        ids: products.map((product) => product.id),
      },
    },
  );
  const responseJson = await response.json();
  const currencyCode = responseJson.data?.shop?.currencyCode;
  const productsById = new Map<string, UpsellProductNode>();

  for (const node of responseJson.data?.nodes ?? []) {
    if (node?.id) {
      productsById.set(node.id, node);
    }
  }

  return products.flatMap((product) => {
    const node = productsById.get(product.id);

    if ((node?.status || product.status) !== "ACTIVE") {
      return [];
    }

    const variants = node?.variants?.nodes ?? [];
    const selectedVariant =
      variants.find(
        (variant) => variant.availableForSale === true,
      ) ||
      variants.find((variant) => Boolean(variant.id));
    const variantId =
      selectedVariant?.id || product.variantId || undefined;
    const variantTitle =
      selectedVariant?.title || product.variantTitle || undefined;
    const amount = selectedVariant?.price;
    const availableForSale =
      typeof selectedVariant?.availableForSale === "boolean"
        ? selectedVariant.availableForSale
        : product.availableForSale;
    const price = amount
      ? {
          amount,
          currencyCode,
        }
      : product.price || null;
    const hasImage =
      Boolean(product.image) ||
      Boolean(node?.featuredImage?.url);
    const image = hasImage
      ? {
          altText:
            product.image?.altText ??
            node?.featuredImage?.altText,
          originalSrc:
            product.image?.originalSrc ||
            node?.featuredImage?.url ||
            "",
        }
      : null;

    return {
      id: product.id,
      title: node?.title || product.title,
      handle: node?.handle || product.handle,
      status: node?.status || product.status,
      variantId,
      variantTitle,
      availableForSale,
      price,
      image,
    };
  });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query CartDrawerUpsellSettings {
        shop {
          myshopifyDomain
        }
        currentAppInstallation {
          id
          metafield(
            namespace: "${UPSELL_CONFIG_NAMESPACE}"
            key: "${UPSELL_CONFIG_KEY}"
          ) {
            jsonValue
          }
        }
      }`,
  );
  const responseJson = await response.json();
  const appInstallation =
    responseJson.data?.currentAppInstallation;

  return {
    shopDomain:
      typeof responseJson.data?.shop?.myshopifyDomain === "string"
        ? responseJson.data.shop.myshopifyDomain
        : null,
    config: parseUpsellConfig(
      appInstallation?.metafield?.jsonValue,
    ),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const enabled = formData.get("enabled") === "true";
  const productsValue = formData.get("products");

  let products: UpsellProduct[] = [];

  if (typeof productsValue === "string") {
    try {
      products = parseUpsellConfig({
        enabled,
        products: JSON.parse(productsValue),
      }).products;
    } catch {
      return {
        ok: false,
        errors: ["Selected products could not be saved."],
      };
    }
  }

  products = dedupeProducts(products);

  if (enabled && products.length === 0) {
    return {
      ok: false,
      errors: [
        "Select at least one upsell product or turn upsells off.",
      ],
    };
  }

  products = await enrichProductsWithVariants(admin, products);

  if (enabled && products.length === 0) {
    return {
      ok: false,
      errors: [
        "Select at least one active upsell product or turn upsells off.",
      ],
    };
  }

  const appInstallationResponse = await admin.graphql(
    `#graphql
      query CartDrawerUpsellAppInstallation {
        currentAppInstallation {
          id
        }
      }`,
  );
  const appInstallationJson =
    await appInstallationResponse.json();
  const ownerId =
    appInstallationJson.data?.currentAppInstallation?.id;

  if (!ownerId) {
    return {
      ok: false,
      errors: ["Could not find the current app installation."],
    };
  }

  const config: UpsellConfig = {
    enabled,
    products,
  };

  const response = await admin.graphql(
    `#graphql
      mutation CartDrawerUpsellSettingsSave(
        $metafields: [MetafieldsSetInput!]!
      ) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: UPSELL_CONFIG_NAMESPACE,
            key: UPSELL_CONFIG_KEY,
            type: "json",
            value: JSON.stringify(config),
          },
        ],
      },
    },
  );
  const responseJson = await response.json();
  const userErrors: GraphQlUserError[] =
    responseJson.data?.metafieldsSet?.userErrors ?? [];

  if (userErrors.length > 0) {
    return {
      ok: false,
      errors: userErrors.map((error) => error.message),
    };
  }

  return {
    ok: true,
    config,
  };
};

export default function Index() {
  const { config, shopDomain } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [enabled, setEnabled] = useState(config.enabled);
  const [products, setProducts] = useState<UpsellProduct[]>(
    config.products,
  );
  const [savedBaseline, setSavedBaseline] =
    useState<UpsellConfig>(config);

  const isSaving = fetcher.state !== "idle";
  const savedConfig =
    fetcher.data && "config" in fetcher.data
      ? fetcher.data.config
      : null;
  const errors =
    fetcher.data && "errors" in fetcher.data
      ? fetcher.data.errors
      : [];
  const selectedProductCount = products.length;
  const hasEnabledWithoutProducts =
    enabled && selectedProductCount === 0;
  const hasUnsavedChanges =
    getComparableConfig({
      enabled,
      products,
    }) !== getComparableConfig(savedBaseline);
  const storeHandle = shopDomain?.replace(
    ".myshopify.com",
    "",
  );
  const themeEditorUrl = storeHandle
    ? `https://admin.shopify.com/store/${storeHandle}/themes/current/editor?context=apps`
    : null;
  const storefrontPreviewUrl = shopDomain
    ? `https://${shopDomain}/collections/all`
    : null;

  useEffect(() => {
    if (savedConfig) {
      setEnabled(savedConfig.enabled);
      setProducts(savedConfig.products);
      setSavedBaseline(savedConfig);
      shopify.toast.show("Upsell settings saved");
    }
  }, [savedConfig, shopify]);

  useEffect(() => {
    if (errors?.length) {
      shopify.toast.show(errors[0], {
        isError: true,
      });
    }
  }, [errors, shopify]);

  const productSelectionIds = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
    }));
  }, [products]);

  async function chooseProducts() {
    const selection = await shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: MAX_UPSELL_PRODUCTS,
      selectionIds: productSelectionIds,
      filter: {
        variants: false,
        draft: false,
        archived: false,
        hidden: false,
      },
    });

    if (!selection) return;

    const activeProducts = selection.selection.filter(
      (product) => product.status === "ACTIVE",
    );

    if (activeProducts.length < selection.selection.length) {
      shopify.toast.show(
        "Draft products cannot be used as upsells.",
        {
          isError: true,
        },
      );
    }

    setProducts(
      activeProducts.map((product) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        status: product.status,
        variantId: product.variants?.[0]?.id,
        variantTitle: product.variants?.[0]?.title,
        availableForSale:
          product.variants?.[0]?.availableForSale,
        image: product.images?.[0]
          ? {
              altText: product.images[0].altText,
              originalSrc: product.images[0].originalSrc,
            }
          : null,
      })),
    );
  }

  function removeProduct(productId: string) {
    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== productId,
      ),
    );
  }

  return (
    <s-page heading="Cart Drawer Upsell">
      <s-section heading="Upsell products">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Choose up to {MAX_UPSELL_PRODUCTS} products that can
            appear in the cart drawer. This saves the configuration
            to app data so the theme app extension can read it
            without editing the merchant theme.
          </s-paragraph>

          <fetcher.Form method="post">
            <input
              type="hidden"
              name="enabled"
              value={enabled ? "true" : "false"}
            />
            <input
              type="hidden"
              name="products"
              value={JSON.stringify(products)}
            />

            <s-stack direction="block" gap="base">
              <s-checkbox
                checked={enabled}
                label="Enable upsells in the cart drawer"
                onChange={(event) => {
                  setEnabled(event.currentTarget.checked);
                }}
              />

              {hasEnabledWithoutProducts && (
                <s-box
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                  background="subdued"
                >
                  <s-text>
                    Select at least one product before enabling
                    upsells.
                  </s-text>
                </s-box>
              )}

              {hasUnsavedChanges && (
                <s-box
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                  background="subdued"
                >
                  <s-text>
                    You have unsaved upsell settings.
                  </s-text>
                </s-box>
              )}

              <s-stack direction="inline" gap="base">
                <s-button
                  type="button"
                  onClick={chooseProducts}
                >
                  Select products
                </s-button>
                <s-button
                  type="submit"
                  variant="primary"
                  disabled={!hasUnsavedChanges || isSaving}
                  {...(isSaving ? { loading: true } : {})}
                >
                  Save settings
                </s-button>
              </s-stack>

              <s-text color="subdued">
                {selectedProductCount} of {MAX_UPSELL_PRODUCTS}{" "}
                products selected.
              </s-text>
            </s-stack>
          </fetcher.Form>

          {products.length === 0 ? (
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-paragraph>
                No upsell products selected yet.
              </s-paragraph>
            </s-box>
          ) : (
            <s-stack direction="block" gap="small">
              {products.map((product) => (
                <s-box
                  key={product.id}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <s-stack
                    direction="inline"
                    gap="base"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <s-stack
                      direction="inline"
                      gap="base"
                      alignItems="center"
                    >
                      {product.image?.originalSrc && (
                        <s-thumbnail
                          src={product.image.originalSrc}
                          alt={
                            product.image.altText ||
                            product.title
                          }
                          size="large"
                        />
                      )}

                      <s-stack direction="block" gap="small">
                        <s-text>{product.title}</s-text>
                        <s-text color="subdued">
                          {product.handle}
                        </s-text>

                        {product.price && (
                          <s-text color="subdued">
                            {formatProductPrice(product.price)}
                          </s-text>
                        )}

                        {product.variantTitle &&
                          product.variantTitle !==
                            "Default Title" && (
                            <s-text color="subdued">
                              Variant: {product.variantTitle}
                            </s-text>
                          )}

                        <s-stack direction="inline" gap="small">
                          {product.variantId ? (
                            <s-badge
                              tone={
                                product.availableForSale === false
                                  ? "warning"
                                  : "success"
                              }
                            >
                              {product.availableForSale === false
                                ? "Sold out"
                                : "Ready"}
                            </s-badge>
                          ) : (
                            <s-badge tone="warning">
                              Needs reselect
                            </s-badge>
                          )}
                        </s-stack>

                        {!product.variantId && (
                          <s-text color="subdued">
                            Select this product again before it can
                            be added from the drawer.
                          </s-text>
                        )}
                        {product.availableForSale === false && (
                          <s-text color="subdued">
                            No variants are currently available, so
                            this upsell will appear disabled in the
                            drawer.
                          </s-text>
                        )}
                      </s-stack>
                    </s-stack>

                    <s-button
                      type="button"
                      variant="tertiary"
                      onClick={() => {
                        removeProduct(product.id);
                      }}
                    >
                      Remove
                    </s-button>
                  </s-stack>
                </s-box>
              ))}
            </s-stack>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Setup checklist">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Use this after saving settings to confirm the Theme App
            Extension is enabled and the storefront drawer is taking
            over the theme cart.
          </s-paragraph>

          <s-unordered-list>
            <s-list-item>
              Enable the Cart Drawer app embed in the current theme.
            </s-list-item>
            <s-list-item>
              Open the storefront preview and add a product to cart.
            </s-list-item>
            <s-list-item>
              Confirm only this drawer opens, not the native theme
              drawer.
            </s-list-item>
            <s-list-item>
              Confirm upsells, quantity controls, note, discount, and
              checkout are working.
            </s-list-item>
          </s-unordered-list>

          <s-stack direction="inline" gap="base">
            {themeEditorUrl && (
              <s-button
                href={themeEditorUrl}
                target="_blank"
                type="button"
              >
                Open theme editor
              </s-button>
            )}

            {storefrontPreviewUrl && (
              <s-button
                href={storefrontPreviewUrl}
                target="_blank"
                type="button"
                variant="secondary"
              >
                Open storefront
              </s-button>
            )}
          </s-stack>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Status">
        <s-unordered-list>
          <s-list-item>
            Drawer replacement is already active through the Theme App
            Extension.
          </s-list-item>
          <s-list-item>
            Upsell products are stored per app installation.
          </s-list-item>
          <s-list-item>
            The storefront drawer reads these products without theme
            file edits.
          </s-list-item>
          <s-list-item>
            Sold-out upsells appear disabled in the drawer.
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
