const express = require("express");
const session = require("express-session");
const log4js = require("log4js");
const passport = require("passport");
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;

const app = express();
const logger = log4js.getLogger("testApp");

app.use(passport.initialize());

// Below URLs will be used for App ID OAuth flows
const LANDING_PAGE_URL = "/web-app-sample.html";
const LOGIN_URL = "/ibm/bluemix/appid/login";
const CALLBACK_URL = "/ibm/bluemix/appid/callback";
const LOGOUT_URL = "/ibm/bluemix/appid/logout";

// Setup express application to use express-session middleware
// Must be configured with proper session storage for production
// environments. See https://github.com/expressjs/session for
// additional documentation.

// Also, if you plan on explicitly stating cookie usage with the
// "sameSite" attribute, you can set the value to "Lax" or "None"
// depending on your preferences. However, note that setting the
// value to "true" will assign the value "Strict" to the sameSite
// attribute which will result into an authentication error because
// setting the "Strict" value will cause your browser not to send your
// cookies after the redirect that happens during the authentication process.

app.use(
  session({
    secret: "123456",
    resave: true,
    saveUninitialized: true,
  })
);

// Use static resources from /samples directory
app.use(express.static("samples"));

// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());

// Below configuration can be obtained from Service Credentials
// tab in the App ID Dashboard. You're not required to manually provide below
// configuration if your node.js application runs on IBM Cloud and is bound to the
// App ID service instance. In this case App ID configuration will be obtained
// automatically using VCAP_SERVICES environment variable.
//
// The redirectUri value can be supplied in three ways:
// 1. Manually in new WebAppStrategy({redirectUri: "...."})
// 2. As environment variable named `redirectUri`
// 3. If none of the above was supplied the App ID SDK will try to retrieve
//    application_uri of the application running on IBM Cloud and append a
//    default suffix "/ibm/bluemix/appid/callback"
passport.use(
  new WebAppStrategy({
    tenantId: process.env.TENANT_ID,
    clientId: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    oauthServerUrl: process.env.OAUTH_SRV_URL,
    redirectUri: process.env.HOST + CALLBACK_URL,
  })
);

// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence across HTTP requests. See passportjs docs
// for additional information http://passportjs.org/docs
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Explicit login endpoint. Will always redirect browser to login widget due to {forceLogin: true}. If forceLogin is set to false the redirect to login widget will not occur if user is already authenticated
app.get(
  LOGIN_URL,
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: LANDING_PAGE_URL,
    forceLogin: true,
  })
);

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from App ID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// Logout endpoint. Clears authentication information from session
app.get(LOGOUT_URL, function (req, res) {
  WebAppStrategy.logout(req);
  res.redirect(LANDING_PAGE_URL);
});

// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.
app.get(
  "/protected",
  passport.authenticate(WebAppStrategy.STRATEGY_NAME),
  function (req, res) {
    res.json(req.user);
  }
);

// Start the server!
app.listen(process.env.PORT || 1234);
