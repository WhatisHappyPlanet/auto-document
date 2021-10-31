import path from "path";

export const isDevelopment = process.env.NODE_ENV === "development";

export const currentExecPath = isDevelopment
  ? path.resolve(process.cwd(), "../../examples/parser-tsInterface")
  : process.cwd();

export const DEV_CONFIG_FILE =
  "../../examples/parser-tsInterface/autoDoc.config.json";
