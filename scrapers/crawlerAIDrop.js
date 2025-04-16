/**
 * crawlerAIDrop.js - Retorna um array de objetos com dados prontos para gerar imagem de post
 * @format
 */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

module.exports = async function scrapingAirdrop(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const posts = [];

	await page.goto("https://www.aidrop.news", { waitUntil: "networkidle2" });
	await page.waitForSelector(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3"
	);

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

	const total = Math.min(maxPosts, cardsData.length);

	for (let i = 0; i < total; i++) {
		const { link, img } = cardsData[i];

		try {
			await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });
			await page.waitForSelector("#content-blocks");

			const texto = await page.$eval("#content-blocks", (el) =>
				el.innerText.trim()
			);
			const { titulo, resumo } = await resumirComIA(texto.slice(0, 8000));

			const imagePath = path.join(
				__dirname,
				`../imgs/airdrop/airdrop-post-${i + 1}.jpg`
			);
			if (img) {
				const res = await fetch(img);
				if (!res.ok)
					throw new Error(`Erro ao baixar imagem: ${res.statusText}`);
				const buffer = await res.buffer();
				fs.mkdirSync(path.dirname(imagePath), { recursive: true });
				fs.writeFileSync(imagePath, buffer);
			}

			posts.push({
				titulo,
				resumo,
				imagem: `data:image/jpeg;base64,${fs.readFileSync(imagePath, {
					encoding: "base64",
				})}`,
				fonte: "AIDrop News",
				autor: "Felipe Karimata",
				username: "@eyes.bot",
				avatar: `file://${path.join(__dirname, "../imgs/autor.jpg")}`,
			});
		} catch (err) {
			console.error(`❌ Erro ao processar post ${i + 1}:`, err.message);
		}
	}

	await browser.close();
	return posts;
};
