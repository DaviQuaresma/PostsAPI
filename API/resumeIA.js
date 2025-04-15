/** @format */
require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // ou coloque direto a chave
});

async function resumirComIA(texto) {
	const chatCompletion = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user",
				content: `
Resuma o conteúdo abaixo em formato de post informativo para redes sociais, estilo carrossel (como no Instagram ou LinkedIn). O resumo deve conter:

1. Um título direto e chamativo (máx. 10 palavras), tudo em maiúsculas.
2. Um parágrafo curto (2 a 3 linhas) explicando de forma objetiva e impactante o conteúdo.

Evite enrolação. Fale como um redator de notícias de tecnologia para jovens profissionais.

Texto:
"""${texto}"""
`,
			},
		],
		temperature: 0.7,
	});

	return chatCompletion.choices[0].message.content.trim();
}

module.exports = resumirComIA;
