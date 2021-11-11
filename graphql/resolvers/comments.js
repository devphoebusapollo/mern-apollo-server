const { AuthenticationError, UserInputError } = require("apollo-server");

const checkAuth = require("../../util/check-auth");
const Post = require("../../models/Post");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not empty",
          },
        });
      }
      //find the post the user wants to comment at by its ID (postId)
      const post = await Post.findById(postId);

      if (post) {
        //We include the comment in the comments array, we used unshift to put it in the beginning
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        //Find the comment in the comments array using the commentId, this (findIndex()) returns the index of that particular comment because this method returns the index of that element that satisfies the testing function
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        //We will use the returned index of the commentIndex to chackl if the username of that comment is similar to the username of the user to make sure that the user is the owner of the comment
        if (post.comments[commentIndex].username === username) {
          //Then remove that comment from the array using the splice method
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
