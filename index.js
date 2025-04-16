/** @format */

const gerarImagemPost = require("./gerar_imagem_post");
const runAiDrop = require("./scrapers/crawlerAIDrop");
const runTechCrunch = require("./scrapers/techCrunch");
const runTechTudo = require("./scrapers/techTudo");

async function embaralhar(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

async function start() {
	console.log("🚀 Iniciando geração de posts...");

	const quantidade = {
		techCrunch: 2,
		airdrop: 2,
		techtudo: 2,
	};

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
}

start();
