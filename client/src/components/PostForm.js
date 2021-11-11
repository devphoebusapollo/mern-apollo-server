import React from "react";
import { Button, Form } from "semantic-ui-react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import { useForm } from "../util/hooks";
import { FETCH_POSTS_QUERY } from "../util/graphql";

function PostForm() {
  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: "",
  });

  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    //update is a function used to update the cache after a mutation occurs. This applies manual changes to the cached data after a mutation
    update(proxy, result) {
      //Store all the data in our cache in a data variable. The readQuery method enables you to execute a graphql query directly on your cache. We use this to read or access all the data as an object in the cache. It requires a query and a variables object if the query requires variables

      //1. read and access all the data on the cache
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY,
      });

      //2. Modify the data and include the data (post) we just created accessible through the result.data.createPost in the existing data from the cache
      //Get the data from the createPost mutation and spread the existing data to modify the data
      data.getPosts = [result.data.createPost, ...data.getPosts];

      //Now, we persist this. The writeQuery is used to update data in the cache or write data in the cache that matches the shape of the query. It requires the query, and the data to write

      //3. Update the data in the cache by writing the modified data using writeQuery
      proxy.writeQuery({ query: FETCH_POSTS_QUERY, data });
      //empty the body field of the values into empty once we submitted the form
      values.body = "";
    },
  });

  function createPostCallback() {
    createPost();
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <h2>Create a post:</h2>
        <Form.Field>
          <Form.Input
            placeholder="Hi World!"
            name="body"
            onChange={onChange}
            value={values.body}
            error={error ? true : false}
          />
          <Button type="submit" color="teal">
            Submit
          </Button>
        </Form.Field>
      </Form>
      {error && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      )}
    </>
  );
}

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`;

export default PostForm;
