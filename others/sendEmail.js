/** @format */

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function enviarEmailComImagens() {
	const outputDir = path.join(__dirname, "../output");
	const arquivos = fs
		.readdirSync(outputDir)
		.filter((file) => file.endsWith(".png"));

	const attachments = arquivos.map((file) => ({
		filename: file,
		path: path.join(outputDir, file),
	}));

	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
		tls: {
			rejectUnauthorized: false, // 🔥 evite erro de certificado
		},
	});

	const mailOptions = {
		from: `"Gerador de Posts IA" <${process.env.EMAIL_USER}>`,
		to: process.env.EMAIL_TO,
		subject: "✅ Posts IA Gerados com Sucesso!",
		text: `Olá! Seguem em anexo os posts gerados automaticamente.`,
		attachments,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("📤 Email enviado com sucesso:", info.response);

		// Apaga arquivos da pasta output após envio
		for (const file of arquivos) {
			fs.unlinkSync(path.join(outputDir, file));
		}
		console.log("🧹 Pasta 'output' limpa com sucesso.");
	} catch (err) {
		console.error("❌ Erro ao enviar email:", err.message);
	}
}

module.exports = enviarEmailComImagens;
