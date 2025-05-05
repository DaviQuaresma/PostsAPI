/** @format */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function gerarCapaEntrada(posts) {
	const outputPath = path.resolve(__dirname, "../output/entrada.png");

	const cardsHTML = posts
		.map(
			(post, index) => `
      <div class="card">
        <div class="card-number">${index + 1}</div>
        <img src="${post.imagem}" alt="Post ${index + 1}" />
        <div class="card-title">${post.titulo_curto || post.titulo}</div>
      </div>
    `
		)
		.join("");

	const html = `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Capa - Notícias de IA</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Arial", sans-serif;
        background: linear-gradient(135deg, #0a0f2c, #1e2749);
        color: white;
        width: 1080px;
        height: 1350px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h1 {
        margin-top: 60px;
        font-size: 50px;
        color: #8ce4ff;
        text-shadow: 0 0 10px #8ce4ff, 0 0 20px #00bcd4;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 40px 40px;
        width: 700px;
        padding: 40px 0;
        box-sizing: border-box;
      }

      .card {
        background-color: #131a2e;
        border-radius: 20px;
        padding: 15px;
        text-align: center;
        position: relative;
        width: 100%;
        height: 300px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 12px;
      }

      .card-title {
        font-size: 30px;
        font-weight: 500;
        margin-top: 10px;
      }

      .card-number {
        position: absolute;
        top: 10px;
        left: 10px;
        background: #0088ff;
        padding: 5px 10px;
        border-radius: 50%;
        font-weight: bold;
      }

      .footer {
        font-size: 28px;
        color: #aaa;
        margin-bottom: 50px;
      }
    </style>
  </head>
  <body>
    <h1>Notícias de IA</h1>
    <div class="grid">
      ${cardsHTML}
    </div>
    <div class="footer">Arraste para entender tudo</div>
  </body>
  </html>
`;

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 1350 }); // exato 4:5
	await page.setContent(html, { waitUntil: "networkidle0" });
	await page.screenshot({ path: outputPath, fullPage: false });

	await browser.close();
	console.log("✅ Capa de entrada gerada:", outputPath);
}

module.exports = gerarCapaEntrada;
