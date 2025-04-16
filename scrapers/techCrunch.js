/** @format */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

async function downloadImage(url, filename) {
    const dir = path.join(__dirname, "../imgs/techcrunch");
    fs.mkdirSync(dir, { recursive: true });

    const res = await fetch(url);
    const buffer = await res.buffer();
    fs.writeFileSync(path.join(dir, filename), buffer);
}

async function scrapingPages(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto("https://techcrunch.com/category/artificial-intelligence/", {
		waitUntil: "networkidle2",
	});

	await page.waitForSelector(".wp-block-query");

	// Captura os links dos artigos
	const cardsData = await page.$$eval("h3.loop-card__title a", (elements) =>
		elements.map((el) => ({
			link: el.href,
			title: el.innerText,
		}))
	);

	// Captura imagens dos cards (pode não estar alinhado 100%, mas serve bem)
	const images = await page.$$eval(".loop-card", (cards) =>
		cards.map((card) => card.querySelector("img")?.src || null)
	);

	const total = Math.min(maxPosts, cardsData.length);

	for (let i = 0; i < total; i++) {
		const { link, title } = cardsData[i];
		const img = images[i];

		console.log(`🔗 [${i + 1}] Navegando para: ${link}`);

		if (img) {
			const filename = `post-${i + 1}.jpg`;
			await downloadImage(img, filename);
			console.log(`🖼️ Imagem salva: ./imgs/${filename}`);
		}

		await page.goto(link, { waitUntil: "networkidle2" });

		await page.waitForSelector(".wp-block-column.is-layout-flow");

		const texto = await page.$eval(
			".wp-block-column.is-layout-flow",
			(el) => el.innerText
		);

		console.log(`🧾 Capturado conteúdo do post ${i + 1}, resumindo com IA...`);

		const textoLimpo = texto.slice(0, 3000);
		const resumo = await resumirComIA(textoLimpo);

		console.log(`📢 RESUMO ${i + 1}:\n${resumo}`);
	}

	await browser.close();
}

scrapingPages(5);
