const bcrypt = require('bcrypt');
const salt = 10;

const encode = async (password) => {
    const hashed = await bcrypt.hash(password, salt)
    return hashed
};

module.exports = {
  encode
};