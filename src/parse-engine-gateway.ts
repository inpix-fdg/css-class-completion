import * as fs from "fs";
import VError = require("verror");
import * as vscode from "vscode";

import CssClassDefinition from "./common/css-class-definition";
import IParseEngine from "./parse-engines/common/parse-engine";
import ISimpleTextDocument from "./parse-engines/common/simple-text-document";
import ParseEngineRegistry from "./parse-engines/parse-engine-registry";

async function readFile(file: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.toString());
    });
  });
}

async function createSimpleTextDocument(
  uri: vscode.Uri
): Promise<ISimpleTextDocument> {
  const text = await readFile(uri.fsPath);
  const simpleDocument: ISimpleTextDocument = {
    languageId: uri.fsPath.split(".").pop() || "",
    getText(): string {
      return text;
    },
  };
  return simpleDocument;
}

class ParseEngineGateway {
  public static async callParser(
    uri: vscode.Uri
  ): Promise<CssClassDefinition[]> {
    const textDocument = await createSimpleTextDocument(uri);
    const parseEngine: IParseEngine = ParseEngineRegistry.getParseEngine(
      textDocument.languageId
    );
    const cssClassDefinitions: CssClassDefinition[] = await parseEngine.parse(
      textDocument
    );

    // CssClassDefinition 배열에 URI 값을 할당
    for (const definition of cssClassDefinitions) {
      definition.location = new vscode.Location(
        uri,
        new vscode.Range(0, 0, 0, 0)
      );
      // 위 예시에서는 Range가 비어있으므로 원하는 범위로 설정해야 합니다.
      // 예를 들어, 문서 내의 특정 위치로 설정할 수 있습니다.
    }

    return cssClassDefinitions;
  }
}

export default ParseEngineGateway;
