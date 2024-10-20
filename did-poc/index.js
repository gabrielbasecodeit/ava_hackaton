const express = require("express");
const axios = require("axios");

const app = express();
const port = 8888;
const CLIENT_ID = "wiw-test-client";
const CLIENT_SECRET = "wiw-test-secret";

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/login", (req, res) => {
  const accessToken = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];

  if (accessToken && refreshToken) {
    res.send("Hello, authenticated world!");
  } else {
    res.redirect(
      `https://api.wiw.io/oidc/authorize` +
        `?response_type=code` +
        `&client_id=${CLIENT_ID}` +
        `&scope=offline_access openid read:token` +
        `&redirect_uri=http://localhost:${port}/authorize_success`
    ); // Redirect to another website
  }
});

app.get("/authorize_success", async (req, res) => {
  const authorizationCode = req.query.code;

  if (authorizationCode) {
    // Handle the authorization code, e.g., exchange it for an access token
    try {
      const response = await axios.post(
        "https://api.wiw.io/oidc/oauth/token",
        {
          grant_type: "authorization_code",
          code: authorizationCode,
          redirect_uri: `http://localhost:${port}/authorize_success`,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const { access_token, refresh_token } = response.data;
      // Store or use the tokens as needed
      console.log("Access Token:", access_token);
      console.log("Refresh Token:", refresh_token);
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

app.get("/balances", async (req, res) => {
  const accessToken = req.query.accessToken;

  //   const accessToken = req.headers["authorization"];

  if (!accessToken) {
    return res.status(401).send("Access token is missing");
  }

  try {
    // const [tagsResponse, nftsResponse, tokensResponse] = await Promise.all([
    //   axios.get("https://api.wiw.io/user/tags/balance?id=20033a13e1199dced2cb59ab150e5fef1857141acd6b012ac53fb60760379222,5e2206643ff28b4b139c5b7ae60ac41cc4550ccda579f26f09dce5b76ec209c0", {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   }),
    //   axios.get("https://api.wiw.io/user/nfts/balance?addr=0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258,0x97ed92e744c10fdd5d403a756239c4069e415e79-1", {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   }),
    //   axios.get("https://api.wiw.io/user/tokens/balance?addr=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   }),
    // ]);
    const tagsResponse = { data: "" };
    const nftsResponse = { data: "" };
    const tokensResponse = await axios.get(
      "https://api.wiw.io/user/tokens/balance?addr=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json({
      tagsBalance: tagsResponse.data,
      nftsBalance: nftsResponse.data,
      tokensBalance: tokensResponse.data,
    });
  } catch (error) {
    console.error("Error retrieving balances:", error);
    res.status(500).send("Error retrieving balances");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
