const express = require('express');
const { auth } = require('express-openid-connect');

const app = express();

app.use(auth());

app.get('/', (req, res) => {
  res.send(`hello ${req.oidc.user.sub}`);
});

app.listen(3000);
