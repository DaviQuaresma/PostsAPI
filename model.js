/** @format */

const puppeteer = require("puppeteer");

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.setViewport({ width: 1280, height: 800 });
	await page.setUserAgent("Mozilla/5.0 Custom User Agent");

	await page.goto("https://example.com");
	await page.waitForSelector("h1");

	const title = await page.title();
	const url = page.url();
	const html = await page.content();

	await page.click("#some-button");
	await page.type("#input-field", "Texto digitado");
	await page.hover("#hover-element");

	await page.focus("#input-field");
	await page.keyboard.press("Enter");
	await page.mouse.click(100, 200);

	await page.addScriptTag({
		url: "https://code.jquery.com/jquery-3.6.0.min.js",
	});
	await page.addStyleTag({ content: "body { background: red; }" });

	const element = await page.$("#element-id");
	const box = await element.boundingBox();
	await element.screenshot({ path: "element.png" });

	await page.evaluate(() => {
		document.querySelector("input").value = "inserido via evaluate";
	});

	await page.exposeFunction("minhaFuncaoNode", () => {
		console.log("Chamado do navegador");
	});

	const cookies = await page.cookies();
	await page.setCookie({ name: "token", value: "abc123" });
	await page.deleteCookie({ name: "token" });

	await page.waitForFunction(() => window.scrollY > 100);
	await page.waitForTimeout(1000);

	const pdfBuffer = await page.pdf({ format: "A4" });
	await page.screenshot({ path: "screenshot.png", fullPage: true });

	await browser.close();
})();
