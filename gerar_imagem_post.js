/** @format */

// gerar_imagem_post.js
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function gerarImagemPost(dados, index = 1) {
	const templatePath = path.join(__dirname, "template.html");
	const outputPath = path.join(__dirname, `output/post-${index}.png`);
	fs.mkdirSync(path.dirname(outputPath), { recursive: true }); // 👈 garante que a pasta existe

	let html = fs.readFileSync(templatePath, "utf-8");

	html = html
		.replace(/{{FONTE}}/g, dados.fonte)
		.replace(/{{TITULO}}/g, dados.titulo)
		.replace(/{{RESUMO}}/g, dados.resumo)
		.replace(/{{IMAGEM}}/g, dados.imagem)
		.replace(/{{AVATAR}}/g, dados.avatar)
		.replace(/{{AUTOR}}/g, dados.autor)
		.replace(/{{USERNAME}}/g, dados.username);

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 1080 });
	await page.setContent(html, { waitUntil: "networkidle0" });

	await page.screenshot({ path: outputPath });
	await browser.close();

	console.log(`✅ Imagem gerada: ${outputPath}`);
}

module.exports = gerarImagemPost;

// Exemplo de uso direto
if (require.main === module) {
	const dadosExemplo = {
		fonte: "TechCrunch",
		titulo: "Meta lança o Llama 4",
		resumo:
			"A nova geração do Llama impressiona nos benchmarks, mas decepciona em respostas reais. Será que ele cumpre o que promete?",
		imagem: "file://" + path.join(__dirname, "imgs/llama4.jpg"),
		avatar: "file://" + path.join(__dirname, "imgs/autor.jpg"),
		autor: "Felipe Karimata",
		username: "@eyes.bot",
	};

	gerarImagemPost(dadosExemplo, 1);
}
