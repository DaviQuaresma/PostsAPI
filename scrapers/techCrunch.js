/**
 * techcrunch.js - Retorna um array de objetos com dados prontos para gerar imagem de post
 *
 * @format
 */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

module.exports = async function techcrunchScraper(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const posts = [];

	await page.goto("https://techcrunch.com/category/artificial-intelligence/", {
		waitUntil: "networkidle2",
		timeout: 60000,
	});

	await page.waitForSelector(".wp-block-query");

	const cardsData = await page.$$eval("h3.loop-card__title a", (elements) =>
		elements.map((el) => ({
			link: el.href,
			title: el.innerText,
		}))
	);

	const images = await page.$$eval(".loop-card img", (imgs) =>
		imgs.map((el) => el.src || null)
	);

	const total = Math.min(maxPosts, cardsData.length);
	const shuffled = cardsData.sort(() => 0.5 - Math.random());
	const selecionados = shuffled.slice(0, total);

	for (let i = 0; i < selecionados.length; i++) {
		const { link } = selecionados[i];

		const img = images[i];

		try {
			await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });
			try {
				await page.waitForSelector(".wp-block-column.is-layout-flow", {
					timeout: 8000,
				});
			} catch (err) {
				console.warn(`⚠️ Conteúdo não encontrado no post ${i + 1}, pulando...`);
				continue;
			}

			const texto = await page.evaluate(() => {
				const el =
					document.querySelector(".wp-block-column.is-layout-flow") ||
					document.querySelector(".article-content") ||
					document.querySelector("article");
				return el ? el.innerText.trim() : "";
			});

			if (!texto) {
				console.warn(`⚠️ Texto vazio no post ${i + 1}, pulando...`);
				continue;
			}

			const { titulo, resumo } = await resumirComIA(texto.slice(0, 8000));

			const imagePath = path.join(
				__dirname,
				`../imgs/techcrunch/techcrunch-post-${i + 1}.jpg`
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
				fonte: "TechCrunch",
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
