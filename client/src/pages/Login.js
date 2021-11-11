import React, { useContext, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

function Login(props) {
  //Access the context
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  //We will get the onChange, onSubmit, and values returned by the useForm hook
  const { onChange, onSubmit, values } = useForm(loginUserCallback, {
    username: "",
    password: "",
  });

  //The logUser is a mutate function which is called when the user submits the form and executes the LOGIN_USER mutation. We can name the mutate function whatever we want
  //Also mutate functions doesn't execute its operation automatically upon render, instead we call this mutation function which is the loginUserCallback
  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    //From the result, we get the data and from the data we get the login and gave it an alias of userData
    update(_, { data: { login: userData } }) {
      //Now the user date returned by the mutation will be passed as the payload of the login action
      context.login(userData);
      props.history.push("/");
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values,
  });

  //Define a function to call the loginUser mutate function. We will pass this as a callback argument to our custom hook useForm
  function loginUserCallback() {
    loginUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <h1>Login</h1>
        <Form.Input
          label="Username"
          placeholder="Username.."
          name="username"
          type="text"
          value={values.username}
          error={errors.username ? true : false}
          onChange={onChange}
        />
        <Form.Input
          label="Password"
          placeholder="Password.."
          name="password"
          type="password"
          value={values.password}
          error={errors.password ? true : false}
          onChange={onChange}
        />
        <Button type="submit" primary>
          Login
        </Button>
      </Form>
      {/* Here, we will check if there are errors by looking at their keys, if this returns true then we have an error and we will list those error values */}
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Login;
