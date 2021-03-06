import chalk from "chalk";
import { readFile } from "fs/promises";
import traverse from "@babel/traverse";
import path from "path";
const parser = require("@babel/parser");
import { handlePath, parseComment } from "./utils";
import { ConfigObjectType, currentExecPath } from "@autodocument/shared";

const getDocData = async (
  componentPath: string,
  options?: { [key: string]: any }
) => {
  const { interfaceName = "PropsType" } = options || {};

  const code = await readFile(componentPath, "utf8").catch((e) => {
    return;
  });

  if (!code) {
    return Promise.reject();
  }

  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["typescript", "jsx"],
  });

  const documents: Array<string[]> = [];

  // TODO: 为了解析类型需要使用 typescript compiler 进行重构 ast 解析以获取类型
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
  parserConfig: ConfigObjectType["parser"],
  configObject: ConfigObjectType
) => {
  const entryFile = parserConfig.entry;

  const handleEntryFile = await handlePath(entryFile, {
    currentExecPath,
    directoryToFilePath: true,
  }).catch((e) => {
    console.log(
      chalk.red(
        "[The entry file path cannot be processed correctly, please check]"
      ),
      e
    );
  });

  if (!handleEntryFile) {
    return Promise.reject();
  }

  const code = await readFile(handleEntryFile, "utf8").catch((e) => {
    console.log(chalk.red("[Failed to read entry file]"), e);
  });

  if (!code) {
    return Promise.reject();
  }

  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["typescript"],
  });

  const componentNames: string[] = [];
  const componentPaths: string[] = [];

  traverse(ast, {
    ExportNamedDeclaration(path) {
      //@ts-ignore
      componentNames.push(path?.node?.specifiers?.[0]?.exported.name);
      componentPaths.push(path?.node?.source?.value || "");
    },
  });

  for (let i = 0; i < componentPaths.length; i++) {
    componentPaths[i] = await handlePath(
      path.resolve(handleEntryFile, "../", componentPaths[i]),
      {
        currentExecPath,
        directoryToFilePath: true,
      }
    ).catch((e) => {
      return "";
    });
  }

  const documents = await Promise.all(
    componentPaths.map((componentPath) => {
      return getDocData(componentPath, parserConfig.options);
    })
  ).catch((e) => {
    console.log(chalk.red("Failed to parse document data"), e);
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
