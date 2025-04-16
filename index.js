/** @format */

require("dotenv").config(); // garante carregamento do .env
const path = require("path");

// Importa os scrapers
const runAiDrop = require("./scrapers/crawlerAIDrop");
const runTechCrunch = require("./scrapers/techCrunch");
const runTechTudo = require("./scrapers/techTudo");

// Número de posts por site (pode virar um input ou config depois)
const MAX_POSTS = 2;

async function start() {
	console.log("🚀 Iniciando scraping completo...\n");

	// === AiDrop ===
	try {
		console.log("📚 Rodando AiDrop...");
		await runAiDrop(MAX_POSTS);
	} catch (err) {
		console.error("❌ Erro no AiDrop:", err.message);
	}

	// === TechCrunch ===
	try {
		console.log("\n📚 Rodando TechCrunch...");
		await runTechCrunch(MAX_POSTS);
	} catch (err) {
		console.error("❌ Erro no TechCrunch:", err.message);
	}

	// === TechTudo ===
	try {
		console.log("\n📚 Rodando TechTudo...");
		await runTechTudo(MAX_POSTS);
	} catch (err) {
		console.error("❌ Erro no TechTudo:", err.message);
	}

	console.log("\n✅ Finalizado com sucesso!");
}

start();
