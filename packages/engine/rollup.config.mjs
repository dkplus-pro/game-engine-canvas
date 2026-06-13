import typescript from "@rollup/plugin-typescript";

const config = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named"
    }
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json"
    })
  ]
};

export default config;
