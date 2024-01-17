const jwt = require('jsonwebtoken');

const createJwt = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN,{
    expiresIn : '1h'
  });
  return token;
};

const verifyJwt = async (token) => {
  const user = jwt.verify(token, process.env.ACCESS_TOKEN);
  return user;
};

module.exports = {
  createJwt,
  verifyJwt,
};