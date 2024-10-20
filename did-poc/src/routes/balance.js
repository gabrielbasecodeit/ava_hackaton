const express = require("express");
const axios = require("axios");
const config = require("../config/config");

const router = express.Router();

router.get("/balances", async (req, res) => {
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

module.exports = router;
