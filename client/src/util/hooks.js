import { useState } from "react";

//We will create a function as a custom hook which takes in the callback and the initialStates of the inputs
export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    callback();
  };

  //Since this is returning the following functions, as a an object then we can destructure them on the components where we will be using useForm
  return {
    onChange,
    onSubmit,
    values,
  };
};
