import * as css from "css";
import CssClassDefinition from "../../common/css-class-definition";

export default class CssClassExtractor {
  /**
   * @description Extracts class names from CSS AST
   */
  public static extract(ast: css.Stylesheet): CssClassDefinition[] {
    const classNameRegex = /[.]([-\w\\%:/]+)/g;

    const definitions: CssClassDefinition[] = [];

    // go through each of the selectors of the current rule
    const addRule = (rule: css.Rule) => {
      rule.selectors?.forEach((selector: string) => {
        let item: RegExpExecArray | null = classNameRegex.exec(
          selector.replace(/\\/g, "")
        );

        const property = rule.declarations?.reduce(
          (accumulator, currentValue) => {
            if ("property" in currentValue && "value" in currentValue) {
              return `${accumulator}${currentValue.property}: ${currentValue.value};`;
            }
            return accumulator;
          },
          ""
        );

        const cssCode = `${selector}{${property}}`;

        while (item) {
          definitions.push(
            new CssClassDefinition(item[1], cssCodeFormat(cssCode))
          );
          item = classNameRegex.exec(selector);
        }
      });
    };

    // go through each of the rules or media query...
    ast.stylesheet?.rules.forEach((rule: css.Rule & css.Media) => {
      // ...of type rule
      if (rule.type === "rule") {
        addRule(rule);
      }
      // of type media queries
      if (rule.type === "media") {
        // go through rules inside media queries
        rule.rules?.forEach((rule: css.Rule) => addRule(rule));
      }
    });
    return definitions;
  }
}

function cssCodeFormat(inputText: string): string {
  let formattedText = "";
  let indent = "  ";
  let lastSemiCloneIndex = inputText.lastIndexOf(";");

  for (let i = 0; i < inputText.length; i++) {
    const char = inputText[i];

    if (i === lastSemiCloneIndex) {
      indent = "";
    }

    if (char === "{") {
      formattedText += " {\n";
      formattedText += indent; // 들여쓰기 추가
    } else if (char === ";") {
      formattedText += ";\n";
      formattedText += indent; // 들여쓰기 추가
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}
