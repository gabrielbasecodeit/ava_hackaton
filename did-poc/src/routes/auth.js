const express = require("express");
const axios = require("axios");
const config = require("../config/config");

const router = express.Router();

router.get("/login", (req, res) => {
  const accessToken = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];

  if (accessToken && refreshToken) {
    res.send("Hello, authenticated world!");
  } else {
    res.redirect(
      `${config.authorizationUrl}` +
        `?response_type=code` +
        `&client_id=${config.clientId}` +
        `&scope=offline_access openid read:token` +
        `&redirect_uri=${config.redirectUri}`
    );
  }
});

router.get("/authorize_success", async (req, res) => {
  const authorizationCode = req.query.code;

  if (authorizationCode) {
    try {
      const response = await axios.post(
        config.tokenUrl,
        {
          grant_type: "authorization_code",
          code: authorizationCode,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const { access_token, refresh_token } = response.data;
      res.json({
        message: "Authorization successful!",
        access_token: access_token,
        refresh_token: refresh_token,
      });
    } catch (error) {
      console.error("Error retrieving tokens:", error);
      res.status(500).send("Error retrieving tokens");
    }
  } else {
    res.status(400).send("Authorization failed!");
  }
});

module.exports = router;
