import chalk from "chalk";
import { promises as fsPromise } from "fs";
import traverse from "@babel/traverse";
import path from "path";
const parser = require("@babel/parser");
import { handlePath, parseComment } from "./utils";
import { ConfigObjectType, PluginType } from "@autodocument/shared";

const getDocData = async (
  componentPath: string,
  options?: PluginType["options"]
) => {
  const { interfaceName = "PropsType" } = options || {};

  const code = await fsPromise.readFile(componentPath, "utf8").catch((e) => {
    return "";
  });

  if (!code) {
    return Promise.reject("error"); //TODO: error message
  }

  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["typescript", "jsx"],
  });

  const documents: Array<string[]> = [];

  traverse(ast, {
    TSInterfaceDeclaration(path) {
      if (path?.node?.id?.name === interfaceName) {
        const interfacePropertyNodePaths = path.get("body").get("body");
        Array.isArray(interfacePropertyNodePaths) &&
          interfacePropertyNodePaths.forEach((interfacePropertyNodePaths) => {
            const interfacePropertyNode = interfacePropertyNodePaths?.node;
            const leadingComments =
              interfacePropertyNode?.leadingComments || [];

            const handleLeadingComments = leadingComments
              .map((leadingComment) => parseComment(leadingComment?.value))
              .reduce((result, comment) => {
                // TODO: type check
                // @ts-ignore
                const handleComment = comment?.description || "";
                if (handleComment === "") return result;
                return result !== ""
                  ? `${result}\n${handleComment}`
                  : handleComment;
              }, "");
            documents.push([
              //TODO: check type
              // @ts-ignore
              interfacePropertyNode?.key?.name,
              handleLeadingComments,
            ]);
          });
        path.stop();
      }
    },
  });

  return documents;
};

const parserPlugin = async (
  parserConfig: PluginType,
  configObject: ConfigObjectType
) => {
  // 读取配置，获取到entryFile
  // 处理 entryFile
  const currentExecPath = process.cwd();
  const entryFile = configObject.parser.entry || "";
  const handleEntryFile = await handlePath(entryFile, {
    currentExecPath,
    directoryToFilePath: true,
  }).catch((e) => {
    console.log(chalk.red(e)); // TODO: error message
  });

  if (!handleEntryFile) {
    return;
  }
  // 读取解析 entryFile
  // 处理组件及其路径
  const code = fsPromise.readFile(handleEntryFile, "utf8").catch((e) => {
    console.log(chalk.red("error"), e); // TODO: error message
  });

  if (!code) {
    return;
  }

  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["typescript"],
  });

  const componentNames: string[] = [];
  const componentPaths: string[] = [];

  traverse(ast, {
    ExportNamedDeclaration(path) {
      // TODO: type check
      // @ts-ignore
      componentNames.push(path?.node?.specifiers?.[0]?.exported.name);
      componentPaths.push(path?.node?.source?.value || "");
    },
  });

  for (let i = 0; i < componentPaths.length; i++) {
    componentPaths[i] = await handlePath(path.resolve(handleEntryFile, "../"), {
      currentExecPath,
    }).catch((e) => {
      return "";
    });
  }

  const documents = await Promise.all(
    componentPaths.map((componentPath) => {
      return getDocData(componentPath, parserConfig.options);
    })
  ).catch((e) => {
    console.log(chalk.red(`can not get comments from ${e}`)); // TODO: error message
  });

  if (!documents) {
    return Promise.reject();
  }

  return {
    componentNames,
    documents,
  };
};

export default parserPlugin;
