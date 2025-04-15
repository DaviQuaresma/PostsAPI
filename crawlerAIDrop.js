/** @format */

const puppeteer = require("puppeteer");
const resumirComIA = require("./API/resumeIA");

async function scrapingPages() {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto("https://www.aidrop.news", { waitUntil: "networkidle2" });

	await page.waitForSelector(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3"
	);

	const cards = await page.$$(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3 > div"
	);

	console.log(`🔎 Número de cards encontrados: ${cards.length}`);

	// Clica no primeiro card
	if (cards.length > 0) {
		const firstCard = cards[0];
		const link = await firstCard.$("a");

		if (link) {
			const href = await link.evaluate((el) => el.href);
			console.log("🔗 Navegando para:", href);

			await page.goto(href, { waitUntil: "networkidle2" });
			console.log("📄 Página nova:", page.url());

			// Aguarda o conteúdo da notícia aparecer
			await page.waitForSelector("#content-blocks");

			// Extrai o conteúdo do post
			const texto = await page.$eval("#content-blocks", (el) => el.innerText);

			console.log("🧾 Texto capturado, resumindo com IA...");

			// Chamada para função de resumo com IA
			const resumo = await resumirComIA(texto);

			console.log(resumo);
		}
	}
	// await browser.close();
}

scrapingPages();

// const title = await page.title();
// const url = page.url();
// const html = await page.content();

// await page.click("#some-button");
// await page.type("#input-field", "Texto digitado");
// await page.hover("#hover-element");

// await page.focus("#input-field");
// await page.keyboard.press("Enter");
// await page.mouse.click(100, 200);

// await page.addScriptTag({
// 	url: "https://code.jquery.com/jquery-3.6.0.min.js",
// });
// await page.addStyleTag({ content: "body { background: red; }" });

// const element = await page.$("#element-id");
// const box = await element.boundingBox();
// await element.screenshot({ path: "element.png" });
