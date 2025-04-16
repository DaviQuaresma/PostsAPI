/** @format */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const fs = require("fs");
const fetch = require("node-fetch"); // com letra minúscula
const path = require("path");

async function downloadImage(url, filename) {
	const dir = path.join(__dirname, "../imgs/airdrop");
	fs.mkdirSync(dir, { recursive: true });

	const res = await fetch(url);
	const buffer = await res.buffer();
	fs.writeFileSync(path.join(dir, filename), buffer);
}
module.exports = async function scrapingPages(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto("https://www.aidrop.news", { waitUntil: "networkidle2" });

	await page.waitForSelector(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3"
	);

	// Extrai todos os hrefs logo após carregar a página principal
	const cardsData = await page.$$eval(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3 > div",
		(cards) =>
			cards
				.map((card) => {
					const link = card.querySelector("a")?.href || null;
					const img = card.querySelector("img")?.src || null;
					return { link, img };
				})
				.filter((c) => c.link?.includes("/p/"))
	);

	// console.log(`🔎 Total de links capturados: ${hrefs.length}`);
	const total = Math.min(maxPosts, cardsData.length);

	for (let i = 0; i < total; i++) {
		const { link: href, img } = cardsData[i];

		console.log(`🔗 [${i + 1}] Navegando para: ${href}`);

		// Baixa a imagem do card
		if (img) {
			const filename = `post-${i + 1}.jpg`;
			await downloadImage(img, filename);
			console.log(`🖼️ Imagem salva: ./imgs/${filename}`);
		}

		await page.goto(href, { waitUntil: "networkidle2" });

		await page.waitForSelector("#content-blocks");
		const texto = await page.$eval("#content-blocks", (el) => el.innerText);

		console.log(`🧾 Capturado conteúdo do post ${i + 1}, resumindo com IA...`);

		const textoLimpo = texto.slice(0, 3000);
		const resumo = await resumirComIA(textoLimpo);

		console.log(`📢 RESUMO ${i + 1}:\n${resumo}`);
	}

	await browser.close();
}