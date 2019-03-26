const { comparePassword, findUser } = require('./utils');

module.exports = (core, options = {}) => {
  options = options || {};
  const { url, dbName } = options

  return {
    logout: () => Promise.resolve(true),
    login: async (req, res) => {
      try {
        const { username, password } = req.body;
        const user = await findUser(url, dbName)(username);
        
        if (user) {
          user['id'] = user._id;
          return comparePassword(password, user.password)
            .then(result => result ? user : false);
        } else return false;
      } catch(err) {
        return err
      }
    }
  }
}