/**
 * techTudo.js - Retorna um array de objetos com dados prontos para gerar imagem de post
 *
 * @format
 */

const puppeteer = require("puppeteer");
const resumirComIA = require("../API/resumeIA");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

module.exports = async function scrapingTechtudo(maxPosts = 5) {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	const page = await browser.newPage();
	const posts = [];

	// Acessa a primeira página de busca de IA
	const urlVar = `https://www.techtudo.com.br/busca/?q=IA`;
	await page.goto(urlVar, {
		waitUntil: "networkidle2",
		timeout: 60000,
	});

	// Randomiza de 1 a 5 cliques no botão "Veja mais"
	const maxClicks = Math.floor(Math.random() * 5) + 1;
	console.log(`🔄 Avançando até ${maxClicks} vezes pelo botão "Veja mais"`);

	for (let i = 0; i < maxClicks; i++) {
		try {
			await page.waitForSelector("a.fundo-cor-produto.pagination__load-more", {
				timeout: 5000,
			});
			await Promise.all([
				page.waitForNavigation({ waitUntil: "networkidle2" }),
				page.click("a.fundo-cor-produto.pagination__load-more"),
			]);
			console.log(`➡️ Página avançada (${i + 1}/${maxClicks})`);
		} catch (err) {
			console.warn(
				`⚠️ Botão "Veja mais" não encontrado ou erro ao clicar: ${err.message}`
			);
			break;
		}
	}

	// Agora espera aparecer os cards
	await page.waitForSelector(".results__list");

	// Extrai os cards
	let cards = await page.$$eval("li.widget--card.widget--info", (nodes) =>
		nodes.map((el) => {
			const a = el.querySelector("a[href]");
			const img = el.querySelector("img");
			const link = a?.href?.startsWith("//") ? "https:" + a.href : a?.href;
			const image = img?.src?.startsWith("//") ? "https:" + img.src : img?.src;
			return { link, image };
		})
	);

	// Filtra para pegar apenas artigos e ignora vídeos
	cards = cards.filter((card) => {
		if (!card.link || card.link.includes("/video/")) {
			console.log(`🚫 Ignorado link inválido ou de vídeo: ${card.link}`);
			return false;
		}
		return true;
	});

	// Embaralha os resultados
	const total = Math.min(maxPosts, cards.length);
	const shuffled = cards.sort(() => 0.5 - Math.random());
	const selecionados = shuffled.slice(0, total);

	for (let i = 0; i < selecionados.length; i++) {
		const { link, image } = selecionados[i]; // ✅ Usando corretamente o image

		if (!link.startsWith("https://www.techtudo.com.br/")) {
			console.warn(
				`⚠️ Link fora do domínio esperado, pulando post ${i + 1}: ${link}`
			);
			continue;
		}

		try {
			await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });

			try {
				await page.waitForSelector(".mrf-article-body", { timeout: 8000 });
			} catch (err) {
				console.warn(
					`⚠️ Conteúdo de artigo não encontrado no post ${i + 1}, pulando...`
				);
				continue;
			}

			const texto = await page.$eval(".mrf-article-body", (el) =>
				el.innerText.trim()
			);

			if (!texto) {
				console.warn(`⚠️ Texto vazio no post ${i + 1}, pulando...`);
				continue;
			}

			const { titulo, titulo_curto, resumo } = await resumirComIA(
				texto.slice(0, 8000)
			);

			const imagePath = path.join(
				__dirname,
				`../imgs/techtudo/techtudo-post-${i + 1}.jpg`
			);

			if (image) {
				try {
					const res = await fetch(image);
					if (!res.ok)
						throw new Error(`Erro ao baixar imagem: ${res.statusText}`);
					const buffer = await res.buffer();
					fs.mkdirSync(path.dirname(imagePath), { recursive: true });
					fs.writeFileSync(imagePath, buffer);
				} catch (imgErr) {
					console.warn(
						`⚠️ Erro ao baixar/salvar imagem para o post ${i + 1}: ${
							imgErr.message
						}`
					);
				}
			}

			posts.push({
				titulo,
				titulo_curto,
				resumo,
				imagem: `data:image/jpeg;base64,${fs.readFileSync(imagePath, {
					encoding: "base64",
				})}`,
				fonte: "TechTudo",
				autor: "Felipe Karimata",
				username: "@karimata.ia",
				avatar: `file://${path.join(__dirname, "../imgs/autor.jpg")}`,
			});
		} catch (err) {
			console.error(`❌ Erro ao processar post ${i + 1}: ${err.message}`);
			continue;
		}

		// Dá uma descansada de 1 segundo entre os posts
		await page.waitForTimeout(1000);
	}

	await browser.close();
	return posts;
};
