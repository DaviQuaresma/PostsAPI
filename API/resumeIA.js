/** @format */

const OpenAI = require("openai");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY2,
});

async function resumirComIA(texto) {
	const prompt = `
	Você é um redator profissional de redes sociais. Sua tarefa é criar conteúdo no estilo carrossel para Instagram ou LinkedIn, baseado no texto abaixo.
	
	Crie um post com as seguintes características:
	- Um título em MAIÚSCULAS com até 10 palavras, direto e chamativo.
	- Um único parágrafo de 4 a 5 linhas com linguagem objetiva, informativa e clara.
	- Tente alcançar até 300 caracteres
	- Não utilize listas, tópicos ou hashtags.
	- Não inclua frases promocionais, datas de envio, chamadas de email ou expressões como "toda segunda no seu inbox".
	- Escreva como se o conteúdo fosse original do próprio autor do post (não cite fontes externas).
	
	Texto base:
	"""${texto}"""
	`;

	const chatCompletion = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		temperature: 0.7,
	});

	return chatCompletion.choices[0].message.content.trim();
}

module.exports = resumirComIA;
