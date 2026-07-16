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

type UpsellProduct = {
  id: string;
  title: string;
  handle: string;
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
              typeof product.handle === "string"
            );
          })
          .slice(0, 4)
      : [],
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query CartDrawerUpsellSettings {
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
  const { config } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [enabled, setEnabled] = useState(config.enabled);
  const [products, setProducts] = useState<UpsellProduct[]>(
    config.products,
  );

  const isSaving = fetcher.state !== "idle";
  const savedConfig =
    fetcher.data && "config" in fetcher.data
      ? fetcher.data.config
      : null;
  const errors =
    fetcher.data && "errors" in fetcher.data
      ? fetcher.data.errors
      : [];

  useEffect(() => {
    if (savedConfig) {
      setEnabled(savedConfig.enabled);
      setProducts(savedConfig.products);
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
      multiple: 4,
      selectionIds: productSelectionIds,
      filter: {
        variants: false,
        archived: false,
      },
    });

    if (!selection) return;

    setProducts(
      selection.selection.map((product) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
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
            Choose products that can appear in the cart drawer. This
            saves the configuration to app data so the theme app
            extension can read it without editing the merchant theme.
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
                  {...(isSaving ? { loading: true } : {})}
                >
                  Save settings
                </s-button>
              </s-stack>
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
                    <s-stack direction="block" gap="small">
                      <s-text>{product.title}</s-text>
                      <s-text color="subdued">
                        {product.handle}
                      </s-text>
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

      <s-section slot="aside" heading="Status">
        <s-unordered-list>
          <s-list-item>
            Drawer replacement is already active through the Theme App
            Extension.
          </s-list-item>
          <s-list-item>
            Upsell configuration is now stored per app installation.
          </s-list-item>
          <s-list-item>
            The next milestone will render these products in the
            storefront drawer.
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
