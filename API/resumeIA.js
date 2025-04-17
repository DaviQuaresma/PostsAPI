/** @format */

const OpenAI = require("openai");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY2,
});

async function resumirComIA(texto) {
	const prompt = `
	Você é um redator sênior especializado em tecnologia e inovação, com foco em conteúdo denso e informativo para carrosséis no Instagram e LinkedIn.
	
	Com base no texto a seguir, siga **rigorosamente** as instruções abaixo para gerar um conteúdo de alto impacto.
	
	🔹 Instruções:
	1. Gere um **TÍTULO EM PORTUGUÊS**, com até **10 palavras**, todo em **MAIÚSCULAS**, que capture a essência da notícia. O título deve ser claro, informativo e atrativo.
	2. Gere um **RESUMO DENSO E ORIGINAL** com exatos **minimos de 300 caracteres a 350 caracteres no maximo**. Ele deve explicar a notícia de forma aprofundada, com vocabulário técnico e conciso. Reescreva o conteúdo com suas próprias palavras — evite copiar frases do texto original.
	3. Foque em **dados técnicos**, **impactos reais no setor de tecnologia**, **exemplos práticos** e **benefícios concretos**. Nada de vaguidão.
	4. Não use listas, emojis, hashtags, tópicos ou chamadas genéricas como "neste carrossel", "como falamos antes", "segunda no seu e-mail" etc.
	5. **Traduza** todo o conteúdo para o português antes de processar.
	6. Use linguagem **profissional e fluida**, como se fosse de um especialista explicando o tema a outro profissional.
	7. O texto gerado será impresso em imagem. Priorize coesão e estética textual. Frases muito longas quebrem mal no layout.
	8. Evite passar noticias de anos passados, se for antiga confira na net se a informação ainda faz sentido, caso contrario você olha algo parecido e insere, mas que bata com noticias atuais.
	9. Não coloque no titulo em qualquer lugar que a noticia é de 2022 ou anos passados, só 2025 para frente

	Retorne neste formato **JSON válido**:
	
	{
	  "titulo": "EXEMPLO DE TÍTULO",
	  "resumo": "Resumo com riqueza de informações, estilo humanizado, vocabulário técnico e conteúdo autêntico que represente a notícia original com profundidade."
	}
	
	Texto base:
	"""${texto}"""
	`;

	const chatCompletion = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		temperature: 0.7,
	});

	const resposta = chatCompletion.choices[0].message.content.trim();

	try {
		return JSON.parse(resposta);
	} catch (err) {
		console.error("❌ Erro ao interpretar resposta da IA:", resposta);
		throw new Error("A resposta da IA não está em formato JSON.");
	}
}

module.exports = resumirComIA;
