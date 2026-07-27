import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Cart Drawer Upsell</h1>
        <p className={styles.text}>
          Manage your Shopify cart drawer, upsell products, and cart conversion
          settings from one embedded app.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Independent drawer</strong>. Replace theme cart drawers
            without editing merchant theme files.
          </li>
          <li>
            <strong>Manual upsells</strong>. Choose product variants that appear
            inside the storefront cart drawer.
          </li>
          <li>
            <strong>Cart tools</strong>. Show free-shipping progress, order
            notes, discount codes, and checkout actions.
          </li>
        </ul>
      </div>
    </div>
  );
}
