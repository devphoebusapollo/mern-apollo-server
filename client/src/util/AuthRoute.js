import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthContext } from "../context/auth";

//The property means, look at the component property defined on props and assign it to an new location state called Component. We need this to make a component since components can't be named starting in lowercase basically, this will be the component assigned as the value of the component property of whatever AuthRoute is in the App.js
//Then, take all remaining properties defined on the props object and collect them inside an argument called rest. You are jus pulling off the rest of the properties defined on the props object into a new argument called rest.
function AuthRoute({ component: Component, ...rest }) {
  const { user } = useContext(AuthContext);

  return (
    <Route
      {...rest} //Put all the rest of the properties here already in the ...rest argument
      render={(props) =>
        user ? <Redirect to="/" /> : <Component {...props} />
      }
    />
  );
}

export default AuthRoute;
