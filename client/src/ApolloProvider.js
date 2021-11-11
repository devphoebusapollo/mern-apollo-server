import React from "react";
import App from "./App";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { ApolloProvider } from "@apollo/react-hooks";
import { setContext } from "apollo-link-context";

//We should point this to our GraphQL server
const httpLink = createHttpLink({
  uri: "http://localhost:5000",
});

//This will automatically get and add the authorization token each time we make a request
const authLink = setContext(() => {
  const token = localStorage.getItem("jwtToken");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

//ApolloClient is what we will use to fecth, cache, and modify the data. Like axios in rest api calls
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

//We will wrap the App component here with the ApolloProvider and in index.js we will remove the App component and use the ApolloProvider instead
export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
