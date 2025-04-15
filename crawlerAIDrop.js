/** @format */

const puppeteer = require("puppeteer");
const resumirComIA = require("./API/resumeIA");

async function scrapingPages(maxPosts = 5) {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto("https://www.aidrop.news", { waitUntil: "networkidle2" });

	await page.waitForSelector(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3"
	);

	// Extrai todos os hrefs logo após carregar a página principal
	const hrefs = await page.$$eval(
		".grid.grid-cols-1.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3 > div a",
		(anchors) => {
			const hrefSet = new Set();
			return anchors
				.map((a) => a.href)
				.filter((href) => href.includes("/p/")) // só posts
				.filter((href) => {
					if (hrefSet.has(href)) return false; // remove repetidos
					hrefSet.add(href);
					return true;
				});
		}
	);

	console.log(`🔎 Total de links capturados: ${hrefs.length}`);
	const total = Math.min(maxPosts, hrefs.length);

	for (let i = 0; i < total; i++) {
		const href = hrefs[i];
		console.log(`🔗 [${i + 1}] Navegando para: ${href}`);

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

scrapingPages(5); // ou scrapingPages(5), etc

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
