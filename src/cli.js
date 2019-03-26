const { createConnection, createPasswordPrompt, findUser } = require('./utils');

module.exports = (cfg = {}) => cli => {
  const { url, dbName } = cfg;

  /**
   * CLI: user:list
   */
  const listUsers = async () => {
    const { db, client } = await createConnection(url, dbName);
    const collection = db.collection('users')

    return new Promise((resolve, reject) => {
      collection.find({}).toArray(function(err, docs) {
        if (err) return reject(err);
        docs.forEach(doc => console.log(`id: ${doc._id} username: ${doc.username}`))
        client.close();
        resolve()
      })
    })
  }

  /**
   * CLI: user:add
   * @param {string} username 
   */
  const addUser = async ({ options, args }) => {
    if (!args) {
      return Promise.reject('You need to specify --username');
    }

    const user = await findUser(url, dbName)(args)

    if (user) return Promise.reject('User already exists');

    const { db, client } = await createConnection(url, dbName);
    const collection = db.collection('users');

    return createPasswordPrompt()
      .then(password => {
        const newDoc = {
          groups: args.groups || 'admin',
          username: args,
          name: args,
          password
        }
        return collection.insertOne(newDoc)
      })
      .then(() => client.close());
  }

  /**
   * CLI: user:pwd
   * @param {string} username 
   */
  const pwdUser = async ({ options, args }) => {
    if (!args) {
      return Promise.reject('You need to specify --username');
    }

    const user = await findUser(url, dbName)(args)

    if (!user) return Promise.reject('User not found');

    const { db, client } = await createConnection(url, dbName);
    const collection = db.collection('users');

    return createPasswordPrompt()
      .then(password => 
        collection.updateOne({ username: args }, { $set: { password } })
      )
      .then(() => client.close());
  }

  /**
   * CLI: user:remove
   * @param {string} username 
   */
  const removeUser = async ({ options, args }) => {
    if (!args) {
      return Promise.reject('You need to specify --username');
    }

    const user = await findUser(url, dbName)(args);

    if (user) {
      const { db, client } = await createConnection(url, dbName);
      const collection = db.collection('users');

      return collection.deleteOne({ username: args })
        .then(() => client.close());
    }
  }

  return {
    'user:list': listUsers,
    'user:add': {
      options: {
        '--username': 'user name'
      },
      action: addUser
    },
    'user:pwd': {
      options: {
        '--username': 'user name'
      },
      action: pwdUser
    },
    'user:remove': {
      options: {
        '--username': 'user name'
      },
      action: removeUser
    }
  };
}