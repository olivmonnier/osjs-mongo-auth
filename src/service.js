const { createConnection, encryptPassword, findUser } = require('./utils');

const addUser = (url, dbName) => async (username, password, groups = 'admin') => {
  try {
    if (!username) {
      throw new Error('You need to specify username');
    }
  
    const user = await findUser(url, dbName)(username)
  
    if (user) throw new Error('User already exists');
  
    const { db, client } = await createConnection(url, dbName);
    const collection = db.collection('users');
    const pwdCrypt = await encryptPassword(password);
  
    const newDoc = {
      groups,
      username,
      name: username,
      password: pwdCrypt
    }
  
    await collection.insertOne(newDoc);
    await client.close();

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = {
  addUser
}