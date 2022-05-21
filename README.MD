- create .env with AppID data

```
PORT=3000
TENANT_ID=xxx
CLIENT_ID=xxx
SECRET=xxx
OAUTH_SRV_URL=xxx
HOST="http://localhost:3000"
```

- register redirectUri with appID `http://localhost:3000/ibm/bluemix/appid/callback`
- start with `node -r dotenv/config server.js`
- navigate to `http://localhost:3000/protected`
