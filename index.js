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
const enviarEmailComImagens = require("./others/sendEmail.js"); // <- Novo
const gerarCapaEntrada = require("./others/gerar_capa_entrada");

dotenv.config(); // <- Carrega variáveis do .env

async function embaralhar(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

async function start(quantidade) {
	console.log("🚀 Iniciando geração de posts...");

	let todosPosts = [];

	try {
		const postsTechCrunch = await runTechCrunch(quantidade.techCrunch);
		todosPosts.push(...postsTechCrunch);
	} catch (err) {
		console.error("❌ Erro no TechCrunch:", err.message);
	}

	try {
		const postsAiDrop = await runAiDrop(quantidade.airdrop);
		todosPosts.push(...postsAiDrop);
	} catch (err) {
		console.error("❌ Erro no AiDrop:", err.message);
	}

	try {
		const postsTechTudo = await runTechTudo(quantidade.techtudo);
		todosPosts.push(...postsTechTudo);
	} catch (err) {
		console.error("❌ Erro no TechTudo:", err.message);
	}

	const embaralhado = await embaralhar(todosPosts);

	// 🔹 Gera a capa antes dos posts
	const postsParaCapa = embaralhado.map((post) => ({
		titulo: post.titulo,
		titulo_curto: post.titulo_curto,
		imagem: post.imagem,
	}));
	await gerarCapaEntrada(postsParaCapa);

	// 🔹 Gera os posts individuais
	let numero = 1;
	for (const post of embaralhado) {
		await gerarImagemPost({ ...post, numero }, numero);
		numero++;
	}

	console.log("✅ Finalizado com sucesso!");

	const outputPath = path.resolve(__dirname, "./output");
	const arquivos = fs.readdirSync(outputPath);

	// Filtra imagens (ex: .png, .jpg)
	const imagens = arquivos.filter((arquivo) =>
		/\.(png|jpe?g|webp)$/i.test(arquivo)
	);

	if (imagens % 2 !== 0 && imagens.length >= 5 || imagens.length <= 7) {
		await enviarEmailComImagens();
	} else {
		return "Erro ao gerar imagens, tente novamente";
	}
}

const cors = require("cors");
app.use(cors());
app.use(express.static("public"));

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
