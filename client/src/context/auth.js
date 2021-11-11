import React, { useReducer, createContext } from "react";
import jwtDecode from "jwt-decode"; //Used to decode the token

const initialState = {
  user: null,
};

if (localStorage.getItem("jwtToken")) {
  const decodedToken = jwtDecode(localStorage.getItem("jwtToken"));
  console.log(decodedToken);

  //exp is where the expiration is stored
  //If it is smaller than the date now, meaning it is expired then remove it
  if (decodedToken.exp * 1000 < Date.now()) {
    localStorage.removeItem("jwtToken");
  } else {
    //If the token is not expired then we set the initialState (user) to the decodedToken. The decodedToken is an object of the user's creadentials that we used to sign the token in the users.js
    initialState.user = decodedToken;
  }
}

const AuthContext = createContext({
  user: null,
  //These two aren't necessary because they are just placeholders but a good practice to have
  login: (userData) => {},
  logout: () => {},
});

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  function login(userData) {
    localStorage.setItem("jwtToken", userData.token);
    dispatch({
      type: "LOGIN",
      payload: userData,
    });
  }

  function logout() {
    localStorage.removeItem("jwtToken");
    dispatch({ type: "LOGOUT" });
  }

  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
      {...props}
    />
  );
}

export { AuthContext, AuthProvider };
