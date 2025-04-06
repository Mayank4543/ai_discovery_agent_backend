const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
dotenv= require('dotenv')
const app = express(); 
app.use(cors());

app.get("/scrape/github-developers", async (req, res) => {
  const result = [];
  const { date = "daily" } = req.query;

  try {
    const { data } = await axios.get(
      `https://github.com/trending/developers?since=${date}`
    );
    const $ = cheerio.load(data);

    $("article.Box-row").each((i, elem) => {
      const name = $(elem).find("h1.h3.lh-condensed a").text().trim();
      const username = $(elem).find("p.f4.text-normal.mb-1 a").text().trim();
      const avatar = $(elem).find("img").attr("src");

      const repo = $(elem).find("h1.h4.lh-condensed a").text().trim();
      const repo_url = $(elem).find("h1.h4.lh-condensed a").attr("href");
      const description = $(elem)
        .find("div.f6.color-fg-muted.mt-1")
        .text()
        .trim();

      result.push({
        name,
        username,
        avatar,
        repo: repo || "N/A",
        repo_url: repo_url ? `https://github.com${repo_url}` : "N/A",
        description: description || "N/A",
      });
    });

    res.json(result);
  } catch (err) {
    console.error("Scraping failed:", err.message);
    res.status(500).send("Error scraping developers");
  }
});

app.get("/scrape/github-repositories", async (req, res) => {
  const result = [];
  const { date = "daily" } = req.query;

  try {
    const { data } = await axios.get(
      `https://github.com/trending?since=${date}`
    );
    const $ = cheerio.load(data);

    $("article.Box-row").each((i, elem) => {
      const title = $(elem)
        .find("h2.h3.lh-condensed a")
        .text()
        .trim()
        .replace(/\s/g, "");
      const repo_url =
        "https://github.com" +
        $(elem).find("h2.h3.lh-condensed a").attr("href");
      const description = $(elem)
        .find("p.col-9.color-fg-muted.my-1.pr-4")
        .text()
        .trim();
      const language = $(elem)
        .find("span[itemprop='programmingLanguage']")
        .text()
        .trim();
      const stars = $(elem)
        .find("a.Link--muted.d-inline-block.mr-3")
        .first()
        .text()
        .trim();
      const forks = $(elem)
        .find("a.Link--muted.d-inline-block.mr-3")
        .eq(1)
        .text()
        .trim();
      const todayStars = $(elem)
        .find("span.d-inline-block.float-sm-right")
        .text()
        .trim();

      result.push({
        title,
        repo_url,
        description: description || "No description",
        language: language || "N/A",
        stars,
        forks,
        todayStars,
      });
    });

    res.json(result);
  } catch (err) {
    console.error("Scraping failed:", err.message);
    res.status(500).send("Error scraping trending repositories");
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
