"use strict";

import * as vscode from "vscode";

class CssClassDefinition {
  public constructor(
    public className: string,
    public declarations?: string,
    public location?: vscode.Location
  ) {}
}

export default CssClassDefinition;
