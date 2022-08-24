/** Adapted from https://github.com/graphql/graphiql **/
import React from "react";
import { GraphQLArgument, DirectiveNode, isType } from "graphql";
import { useExplorerContext } from "@graphiql/react";
import { Typography, List, ListItem } from "@mui/material";

import Argument from "./Argument";
import Directive from "./Directive";
import MarkdownContent from "./MarkdownContent";
import TypeLink from "./TypeLink";

export default function FieldDoc() {
  const { explorerNavStack } = useExplorerContext({ nonNull: true });
  const [showDeprecated, handleShowDeprecated] = React.useState(false);

  const navItem = explorerNavStack[explorerNavStack.length - 1];
  const field = navItem.def;
  if (!field || isType(field)) {
    return null;
  }

  let argsDef;
  let deprecatedArgsDef;
  if (field && "args" in field && field.args.length > 0) {
    argsDef = (
      <div id="doc-args" className="doc-category">
        <div className="doc-category-title"><Typography fontWeight="bold" sx={{mt: 1}}>arguments</Typography></div>
        <List dense>
        {field.args
          .filter((arg) => !arg.deprecationReason)
          .map((arg: GraphQLArgument) => (
            <ListItem>
            <div key={arg.name} className="doc-category-item">
              <div>
                <Argument arg={arg} />
              </div>
              <MarkdownContent
                className="doc-value-description"
                markdown={arg.description}
              />
              {arg && "deprecationReason" in arg && (
                <MarkdownContent
                  className="doc-deprecation"
                  markdown={arg?.deprecationReason}
                />
              )}
            </div>
            </ListItem>
          ))}
          </List>
      </div>
    );
    const deprecatedArgs = field.args.filter((arg) =>
      Boolean(arg.deprecationReason)
    );
    if (deprecatedArgs.length > 0) {
      deprecatedArgsDef = (
        <div id="doc-deprecated-args" className="doc-category">
          <div className="doc-category-title">deprecated arguments</div>
          {!showDeprecated ? (
            <button
              type="button"
              className="show-btn"
              onClick={() => handleShowDeprecated(!showDeprecated)}
            >
              Show deprecated arguments...
            </button>
          ) : (
            deprecatedArgs.map((arg, i) => (
              <div key={i}>
                <div>
                  <Argument arg={arg} />
                </div>
                <MarkdownContent
                  className="doc-value-description"
                  markdown={arg.description}
                />
                {arg && "deprecationReason" in arg && (
                  <MarkdownContent
                    className="doc-deprecation"
                    markdown={arg?.deprecationReason}
                  />
                )}
              </div>
            ))
          )}
        </div>
      );
    }
  }

  let directivesDef;
  if (field?.astNode?.directives && field.astNode.directives.length > 0) {
    directivesDef = (
      <div id="doc-directives" className="doc-category">
        <div className="doc-category-title">directives</div>
        {field.astNode.directives.map((directive: DirectiveNode) => (
          <div key={directive.name.value} className="doc-category-item">
            <div>
              <Directive directive={directive} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <MarkdownContent
        className="doc-type-description"
        markdown={field.description || "No Description"}
      />
      {field && "deprecationReason" in field && (
        <MarkdownContent
          className="doc-deprecation"
          markdown={field.deprecationReason}
        />
      )}
      <div className="doc-category">
        <div className="doc-category-title">
          <Typography fontWeight="bold" display="inline">type: </Typography>
          <TypeLink type={field.type} />
        </div>
      </div>
      {argsDef}
      {directivesDef}
      {deprecatedArgsDef}
    </div>
  );
}
