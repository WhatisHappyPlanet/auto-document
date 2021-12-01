import chalk from "chalk";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { tableHead, allowFileExtensions } from "./constants";
import {
  ConfigObjectType,
  ParserResultType,
  currentExecPath,
  handlePath,
} from "@autodocument/shared";

const write = async (
  writePlugin: ConfigObjectType["write"],
  configObject: ConfigObjectType,
  parserResult: ParserResultType
) => {
  const { options } = writePlugin;
  const { componentNames, documents } = parserResult;
  let docText = "";
  if (options?.headerContent) {
    const headerContent = await readFile(
      path.resolve(currentExecPath, options.headerContent),
      "utf8"
    ).catch((e) => {
      console.log(chalk.red("[failed to get the header markdown content]"), e);
    });

    docText = `${headerContent || ""}\n`;
  }
  docText += "# Components\n";

  componentNames.forEach((componentName, index) => {
    if (componentName) {
      docText += `<a href="#doc${index}"><font size=2 color=#00f>${
        index + 1
      }.${componentName}</font></a>\n\n`;
    }
  });

  componentNames.forEach((componentName, index) => {
    const document = documents[index];
    if (componentName) {
      docText += `## <a id="doc${index}">${index + 1}.${componentName}</a>\n`;
      docText += tableHead;
      document.forEach((item) => {
        docText += `| ${item[0]} | ${item[1]} |\n`;
      });
    }
  });

  if (options?.footerContent) {
    const footerContent = await readFile(
      path.resolve(currentExecPath, options.footerContent),
      "utf8"
    ).catch((e) => {
      console.log(chalk.red("[failed to get the footer markdown content]"), e);
    });

    docText += `\n${footerContent || ""}\n`;
  }

  const handleEndPath = await handlePath(configObject?.write?.end || "", {
    currentExecPath,
    directoryToFilePath: true,
  }).catch((e) => {
    console.log(
      chalk.red(
        "[The end file path cannot be processed correctly, please check]"
      ),
      e
    );
  });

  if (!handleEndPath) {
    return;
  }

  try {
    await writeFile(handleEndPath, docText);
  } catch (e) {
    console.log(chalk.red("[Failed to write document]"), e);
    return Promise.reject();
  }
};

export default write;
