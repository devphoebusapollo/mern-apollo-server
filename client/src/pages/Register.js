import React, { useContext, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

function Register(props) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({}); //To get the errors

  //We will get the onChange, onSubmit, and values ret
  const { onChange, onSubmit, values } = useForm(registerUser, {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //This is an array destructuring from the useMutation hook, we get the addUser and loading
  //The addUser is a mutate function which is called when the user submits the form and executes the REGISTER_USER mutation. We can call the mutate function whatever we want
  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    //The update function here from the useMutation is used to update the Apollo Client cache after the mutation completes
    //Here, we destructure the data from the result and from the data we get register and called it userData
    update(_, { data: { register: userData } }) {
      //when we register, we login the user so we use the same function (login)
      //Now the user date returned by the mutation will be passed as the payload of the login action
      context.login(userData);
      //redirecty the user to the home component
      props.history.push("/");
    },
    //useMutation also has an onError callback function that is called when the mutation encounters an error/errors
    onError(err) {
      //These are errors from our resolvers
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values,
  });

  //Define a function to call the addUser mutate function. We will pass this as a callback argument to our custom hook useForm
  function registerUser() {
    addUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <h1>Register</h1>
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
          label="Email"
          placeholder="Email.."
          name="email"
          type="email"
          value={values.email}
          error={errors.email ? true : false}
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
        <Form.Input
          label="Confirm Password"
          placeholder="Confirm Password.."
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          error={errors.confirmPassword ? true : false}
          onChange={onChange}
        />
        <Button type="submit" primary>
          Register
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

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Register;
