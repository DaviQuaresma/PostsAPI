/** @format */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

async function downloadImage(url, filename) {
    const dir = path.join(__dirname, "../imgs/techctudo");
    fs.mkdirSync(dir, { recursive: true });

    const res = await fetch(url);
    const buffer = await res.buffer();
    fs.writeFileSync(path.join(dir, filename), buffer);
}

module.exports = async function scrapingTechtudo(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto("https://www.techtudo.com.br/busca/?q=IA", {
		waitUntil: "networkidle2",
	});

	await page.waitForSelector(".results__list");

	// Coleta links e imagens dos cards
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

	for (let i = 0; i < total; i++) {
		const { link, image } = cards[i];
		console.log(`🔗 [${i + 1}] Navegando para: ${link}`);

		if (image) {
			const filename = `techtudo-post-${i + 1}.jpg`;
			await downloadImage(image, filename);
			console.log(`🖼️ Imagem salva: ./imgs/${filename}`);
		}

		await page.goto(link, { waitUntil: "networkidle2" });

		await page.waitForSelector(".mrf-article-body");

		const titulo = await page.$eval(".content-head__title", (el) =>
			el.innerText.trim()
		);

		const texto = await page.$eval(".mrf-article-body", (el) =>
			el.innerText.trim()
		);

		console.log(`🧾 Capturado: ${titulo} \n🔄 Resumindo com IA...`);

		const resumo = await resumirComIA(texto.slice(0, 3000));

		console.log(`📢 RESUMO ${i + 1}:\n${resumo}`);
	}

	await browser.close();
}