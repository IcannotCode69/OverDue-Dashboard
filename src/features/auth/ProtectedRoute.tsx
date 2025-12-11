import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "./AuthContext";

type ProtectedRouteProps = RouteProps & {
  component: React.ComponentType<any>;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: props.location?.pathname },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
