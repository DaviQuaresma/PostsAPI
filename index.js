/** @format */

const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const gerarImagemPost = require("./others/gerar_imagem_post");
const runAiDrop = require("./scrapers/crawlerAIDrop");
const runTechCrunch = require("./scrapers/techCrunch");
const runTechTudo = require("./scrapers/techTudo");
const enviarEmailComImagens = require("./others/sendEmail.js"); // <- Novo

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

	let numero = 1;
	for (const post of embaralhado) {
		await gerarImagemPost({ ...post, numero }, numero);
		numero++;
	}

	console.log("✅ Finalizado com sucesso!");

	// Envia as imagens por e-mail
	await enviarEmailComImagens(); // <- Novo
}

const cors = require("cors");
app.use(cors());
app.use(express.static("public"));

app.get("/executar", async (req, res) => {
	const techCrunch = parseInt(req.query.techCrunch) || 0;
	const airdrop = parseInt(req.query.airdrop) || 0;
	const techtudo = parseInt(req.query.techtudo) || 0;

	try {
		await start({ techCrunch, airdrop, techtudo });
		res.send("✅ Geração finalizada e enviada por e-mail!");
	} catch (err) {
		res.status(500).send("❌ Erro ao executar: " + err.message);
        return
	}
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});
