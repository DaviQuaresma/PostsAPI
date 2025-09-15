/** @format */

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const gerarImagemPost = require("./others/gerar_imagem_post");
const runAiDrop = require("./scrapers/crawlerAIDrop");
const runTechCrunch = require("./scrapers/techCrunch");
const runTechTudo = require("./scrapers/techTudo");
const enviarEmailComImagens = require("./others/sendEmail.js");
const gerarCapaEntrada = require("./others/gerar_capa_entrada");
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));


dotenv.config();

async function embaralhar(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

async function start(quantidade) {
	console.log("🚀 Iniciando geração de posts...");
	console.log("📋 Parâmetros recebidos:", quantidade);

	let todosPosts = [];

	// Verifica se pelo menos um scraper foi solicitado
	if (quantidade.techCrunch === 0 && quantidade.airdrop === 0 && quantidade.techtudo === 0) {
		console.log("⚠️ Nenhum site selecionado para scraping.");
		return;
	}

	// Executa TechCrunch se solicitado
	if (typeof quantidade.techCrunch === "number" && quantidade.techCrunch > 0) {
		try {
			console.log(`📰 Executando TechCrunch com ${quantidade.techCrunch} posts...`);
			const postsTechCrunch = await runTechCrunch(quantidade.techCrunch);
			todosPosts.push(...postsTechCrunch);
		} catch (err) {
			console.error("❌ Erro no TechCrunch:", err.message);
		}
	}

	// Executa AiDrop se solicitado
	if (typeof quantidade.airdrop === "number" && quantidade.airdrop > 0) {
		try {
			console.log(`🚀 Executando AiDrop com ${quantidade.airdrop} posts...`);
			const postsAiDrop = await runAiDrop(quantidade.airdrop);
			todosPosts.push(...postsAiDrop);
		} catch (err) {
			console.error("❌ Erro no AiDrop:", err.message);
		}
	}

	// Executa TechTudo se solicitado
	if (typeof quantidade.techtudo === "number" && quantidade.techtudo > 0) {
		try {
			console.log(`💻 Executando TechTudo com ${quantidade.techtudo} posts...`);
			const postsTechTudo = await runTechTudo(quantidade.techtudo);
			todosPosts.push(...postsTechTudo);
		} catch (err) {
			console.error("❌ Erro no TechTudo:", err.message);
		}
	}

	const embaralhado = await embaralhar(todosPosts);
	console.log(`🎲 Posts embaralhados: ${embaralhado.length} posts prontos para gerar imagens`);

	if (embaralhado.length === 0) {
		console.error("❌ Nenhum post foi coletado pelos scrapers!");
		throw new Error("Nenhum post foi coletado. Verifique os scrapers.");
	}

	const postsParaCapa = embaralhado.map((post) => ({
		titulo: post.titulo,
		titulo_curto: post.titulo_curto,
		imagem: post.imagem,
	}));
	await gerarCapaEntrada(postsParaCapa);

	let numero = 1;
	for (const post of embaralhado) {
		await gerarImagemPost({ ...post, numero }, numero);
		numero++;
	}

	console.log("✅ Finalizado com sucesso!");

	const outputPath = path.resolve(__dirname, "./output");
	const arquivos = fs.readdirSync(outputPath);

	console.log("output:", outputPath);
	console.log("📁 Arquivos na pasta output:", arquivos);

	// Filtra imagens (ex: .png, .jpg)
	const imagens = arquivos.filter((arquivo) =>
		/\.(png|jpe?g|webp)$/i.test(arquivo)
	);

	console.log("📸 Imagens geradas:", imagens);
	console.log(`📊 Total de imagens: ${imagens.length}`);

	// Critério de sucesso: pelo menos 2 imagens (entrada + pelo menos 1 post)
	if (imagens.length >= 2) {
		console.log("✅ Número suficiente de imagens geradas, enviando email...");
		await enviarEmailComImagens();
	} else {
		console.error(`❌ Apenas ${imagens.length} imagem(ns) gerada(s). Esperado pelo menos 2.`);
		throw new Error(`Erro ao gerar imagens: apenas ${imagens.length} gerada(s), tente novamente.`);
	}
}

// senha = noticiabot2025

app.get("/executar", async (req, res) => {
	const techCrunch = parseInt(req.query.techCrunch) || 0;
	const airdrop = parseInt(req.query.airdrop) || 0;
	const techtudo = parseInt(req.query.techtudo) || 0;

	try {
		await start({ techCrunch, airdrop, techtudo });
		res.send("✅ Geração finalizada e enviada por e-mail!");
	} catch (err) {
		res.status(500).send("❌ Erro ao executar: " + err.message);
		return;
	}
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});
