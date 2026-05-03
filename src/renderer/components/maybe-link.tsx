import React from "react";
import * as ReactRouterDom from "react-router-dom";

const { Link } = ReactRouterDom;

export function MaybeLink(props: React.ComponentProps<typeof Link>): React.ReactElement {
  const { children, to, ...rest } = props;
  if (to) {
    return (
      <Link to={to} {...rest}>
        {children}
      </Link>
    );
  } else {
    return <>{children}</>;
  }
}
