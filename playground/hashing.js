const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc';

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash)
//   });
// });

bcrypt.compare(password, '$2a$10$jVh2twEze9StzuS8Wy7LoO9D/SV2pWlg5Cp8w4Eppaswp./dhalzG', (err, res) => {
  console.log(res);
})

// var data = {
//   id: 5
// }

// var token = jwt.sign(data, '123abc');
// var decodedData = jwt.verify(token, '123abc');

// console.log(token);
// var password = 'something secret';
// var hash = SHA256(password).toString();

// var data = {
//   id: 4
// }

// // Received Token from client
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'some secret').toString()
// }

// // TokenHash or server
// var resultHash = SHA256(JSON.stringify(token.data) + 'some secrets').toString();


// // Verify Result caparing the client and server hash
// if(resultHash == token.hash) console.log('Data is safe');
// else console.log('Data is changed. Do not belive!');