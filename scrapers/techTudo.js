/**
 * techTudo.js - Retorna um array de objetos com dados prontos para gerar imagem de post
 * @format
 */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

module.exports = async function scrapingTechtudo(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const posts = [];

	await page.goto("https://www.techtudo.com.br/busca/?q=IA", {
		waitUntil: "networkidle2",
	});

	await page.waitForSelector(".results__list");

	const cards = await page.$$eval("li.widget--card.widget--info", (nodes) =>
		nodes.map((el) => {
			const a = el.querySelector("a[href]");
			const img = el.querySelector("img");
			const link = a?.href?.startsWith("//") ? "https:" + a.href : a?.href;
			const image = img?.src?.startsWith("//") ? "https:" + img.src : img?.src;
			return { link, image };
		})
	);

	const total = Math.min(maxPosts, cards.length);
	const shuffled = cards.sort(() => 0.5 - Math.random());
	const selecionados = shuffled.slice(0, total);

	for (let i = 0; i < selecionados.length; i++) {
		const { link, image } = selecionados[i];

		try {
			await page.goto(link, { waitUntil: "networkidle2" });
			await page.waitForSelector(".mrf-article-body");

			const texto = await page.$eval(".mrf-article-body", (el) =>
				el.innerText.trim()
			);

			const { titulo, resumo } = await resumirComIA(texto.slice(0, 8000));

			const imagePath = path.join(
				__dirname,
				`../imgs/techctudo/techtudo-post-${i + 1}.jpg`
			);
			if (image) {
				const res = await fetch(image);
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
				fonte: "TechTudo",
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
