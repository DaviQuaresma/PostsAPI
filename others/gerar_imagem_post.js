/** @format */

// gerar_imagem_post.js

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function gerarImagemPost(dados, index = 1) {
	// Caminho absoluto para o template.html na raiz do projeto
	const templatePath = path.resolve(__dirname, "../template.html");
	const outputPath = path.resolve(__dirname, "../output", `post-${index}.png`);

	// Garante que a pasta 'output' existe
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });

	// Lê o conteúdo do template e insere os dados
	let html = fs.readFileSync(templatePath, "utf-8");

	html = html
		.replace(/{{NUMERO}}/g, index)
		.replace(/{{FONTE}}/g, dados.fonte)
		.replace(/{{TITULO}}/g, dados.titulo)
		.replace(/{{RESUMO}}/g, dados.resumo)
		.replace(/{{IMAGEM}}/g, dados.imagem)
		.replace(/{{AVATAR}}/g, dados.avatar)
		.replace(/{{AUTOR}}/g, dados.autor)
		.replace(/{{USERNAME}}/g, dados.username);

	// Lança o navegador e gera o print
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await page.setViewport({
		width: 1080,
		height: 1350,
		deviceScaleFactor: 1, // mantém a escala exata sem zoom
	});
	await page.setContent(html, { waitUntil: "networkidle0" });
	await page.screenshot({ path: outputPath });

	await browser.close();

	console.log(`✅ Imagem gerada: ${outputPath}`);
}

module.exports = gerarImagemPost;
