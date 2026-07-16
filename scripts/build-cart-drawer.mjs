import { stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const toKb = (bytes) =>
  `${(bytes / 1024).toFixed(1)} KB`;

async function buildAsset(name) {
  const entryPoint = resolve(
    root,
    `extension-src/cart-drawer-extension/${name}.js`,
  );
  const outfile = resolve(
    root,
    `extensions/cart-drawer-extension/assets/${name}.js`,
  );

  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify: true,
    legalComments: "none",
    target: ["es2020"],
  });

  const [{ size: sourceSize }, { size: outputSize }] =
    await Promise.all([stat(entryPoint), stat(outfile)]);

  console.log(
    [
      "Built cart drawer asset:",
      `${relative(root, entryPoint)} (${toKb(sourceSize)})`,
      "->",
      `${relative(root, outfile)} (${toKb(outputSize)})`,
    ].join(" "),
  );
}

await buildAsset("cart-drawer");
await buildAsset("cart-drawer-upsells");
