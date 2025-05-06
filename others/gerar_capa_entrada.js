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
      @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap");

      body {
        margin: 0;
        padding: 0;
        font-family: "Orbitron", sans-serif;
        background: linear-gradient(135deg, #041837, #0a0f2c);
        color: white;
        width: 1080px;
        height: 1350px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }

      h1 {
        margin-top: 60px;
        font-size: 74px;
        color: #00f0ff;
        text-shadow: 0 0 10px #00e0ff, 0 0 20px #00e0ff, 0 0 40px #00e0ff;
        letter-spacing: 2px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 40px 40px;
        width: 750px;
        padding: 0 0 20px;
        box-sizing: border-box;
      }

      .card {
        background: linear-gradient(180deg, #131a2e 0%, #0a0f2c 100%);
        border: 1px solid #00e0ff;
        backdrop-filter: blur(2px);
        border-radius: 20px;
        padding: 15px;
        text-align: center;
        position: relative;
        width: 100%;
        height: 300px;
        box-shadow: 0 0 10px rgba(0, 221, 255, 0.4),
          0 0 20px rgba(0, 221, 255, 0.2), 0 0 30px rgba(0, 221, 255, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 12px;
        border: 1px solid #5fdfff;
      }

      .card-title {
        font-size: 30px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 0 4px #00f0ff;
      }

      .card-number {
        position: absolute;
        top: 10px;
        left: 10px;
        background: #00bcd4;
        padding: 6px 12px;
        border-radius: 30px;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 0 10px #00bcd4;
      }

      .footer {
        font-size: 36px;
        color: #8ce4ff;
        margin-bottom: 10px;
        text-shadow: 0 0 10px #00f0ff;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }

      .footer svg {
        width: 180px;
        height: 180px;
        fill: #00f0ff;
        filter: drop-shadow(0 0 5px #00f0ff);
        animation: slideRight 1.6s infinite ease-in-out;
      }

      @keyframes slideRight {
        0%, 100% {
          transform: translateX(0);
        }
        50% {
          transform: translateX(10px);
        }
      }
    </style>
  </head>
  <body>
    <h1>NOTÍCIAS DE IA</h1>
    <div class="grid">
      ${cardsHTML}
    </div>
    <div class="footer">
      ARRASTE E ENTENDA TUDO
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M10 17l5-5-5-5v10z" />
      </svg>
    </div>
  </body>
  </html>
`;

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 1350 }); // 4:5
	await page.setContent(html, { waitUntil: "networkidle0" });
	await page.screenshot({ path: outputPath, fullPage: false });

	await browser.close();
	console.log("✅ Capa de entrada gerada:", outputPath);
}

module.exports = gerarCapaEntrada;
