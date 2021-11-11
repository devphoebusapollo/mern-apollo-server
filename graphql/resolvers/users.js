const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

function generateToken(user) {
  return jwt.sign(
    //Later we will use this as a decodedToken in the auth.js
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

//The underscore (_) represents the parent argument for the resolver. Since we are not using it, we left an underscore as placeholder to it to access the args argument
module.exports = {
  Mutation: {
    //We skip the parent argument so we pass an underscore as placeholder to access the args argument
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });

      //Here, we add another prop to the errors object that we destructured coming from the validators
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      //Match the password given and the password stored from the database
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }

      const token = generateToken(user);

      //return the user data
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      //Here, the register requires the registerInput args (as specified in the typeDefs) so we need to pass the register input values
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data
      //We can destructure this later since validateRegisterInput function returns an object
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      //return the user data
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
