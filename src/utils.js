const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt-nodejs');
const readline = require('readline');

const findUser = (url, dbName) => async (username) => {
  const { db, client } = await createConnection(url, dbName);
  const collection = db.collection('users')

  return collection.findOne({ username })
    .then(doc => {
      client.close();
      return doc;
    })
}

const createConnection = (url, dbName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, client) {
      if (err) return reject(err);
      
      const db = client.db(dbName);
      resolve({ db, client });
    })
  })
}

const encryptPassword = password => new Promise((resolve, reject) => {
  bcrypt.hash(password, null, null, (err, hash) => err ? reject(err) : resolve(hash));
});

const promptPassword = q => new Promise((resolve, reject) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(q, answer => {
    resolve(answer);
    rl.close();
  });

  rl._writeToOutput = s => rl.output.write('*');
});

const createPasswordPrompt = () => promptPassword('Password: ')
  .then(pwd => encryptPassword(pwd));

const comparePassword = (password, hash) => new Promise((resolve, reject) => {
  bcrypt.compare(password, hash, (err,res) => resolve(res === true));
});

module.exports = {
  createConnection,
  createPasswordPrompt,
  comparePassword,
  encryptPassword,
  findUser
}