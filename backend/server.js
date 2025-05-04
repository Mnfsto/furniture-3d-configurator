require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require("express");
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 8080;

const setupServer = (port) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors({ origin: '*' }));

    app.post('/api/user', (req, res) => {
        res.json({ message: "User Connected" });
        console.log(req.body)
    });

    app.get('/api/applications', async (req, res) => {
        const body = {status: "success"};

        res.status(200).json(body);

    });


    app.use(cors());
    app.use(express.json());
    const upload = multer();

    // const transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         type: 'OAuth2',
    //         user: process.env.SMTP_USER,
    //         clientId: process.env.SMTP_CLIENT_ID,
    //         clientSecret: process.env.SMTP_CLIENT_SECRET,
    //         refreshToken: process.env.SMTP_REFRESH_TOKEN,
    //         accessToken: process.env.SMTP_ACCESS_TOKEN,
    //     }
    // });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    app.post('/api/submit', upload.single('screenshot'), async (req, res) => {
        try {
            console.log('Отримано дані:', req.body, 'Файл:', req.file);
            const { name, phone, email, comment, model, color, material, shareableLink } = req.body;
            const screenshot = req.file;

            if (!name || !phone || !email || !model || !color || !material || !shareableLink || !screenshot) {
                console.error('Відсутні обов’язкові поля:', { name, phone, email, model, color, material, shareableLink, screenshot });
                return res.status(400).send('Усі поля та скріншот є обов’язковими.');
            }

            const mailToOwner = {
                from: 'your-real-email@gmail.com',
                to: 'owner-email@gmail.com',
                subject: `Новий запит від ${name}`,
                text: `
        Ім'я: ${name}
        Телефон: ${phone}
        Email: ${email}
        Коментар: ${comment || 'Немає коментаря'}
        Модель: ${model}
        Колір: ${color}
        Матеріал: ${material}
        Посилання: ${shareableLink}
      `,
                attachments: [
                    {
                        filename: 'model-screenshot.png',
                        content: screenshot.buffer
                    }
                ]
            };

            const mailToClient = {
                from: 'your-real-email@gmail.com',
                to: email,
                subject: 'Ваш запит отримано',
                text: `
        Дякуємо за ваш запит, ${name}!
        Ваш вибір:
        - Модель: ${model}
        - Колір: ${color}
        - Матеріал: ${material}
        Ви можете переглянути вашу конфігурацію за посиланням: ${shareableLink}
        Ми зв'яжемося з вами найближчим часом.
      `
            };

            await transporter.sendMail(mailToOwner);
            await transporter.sendMail(mailToClient);
            res.status(200).send('Запит успішно надіслано.');
        } catch (err) {
            console.error('Помилка:', err);
            res.status(500).send('Помилка сервера.');
        }
    });

    return app;
};


// Start Server
const server = setupServer(PORT);
const httpServer = http.createServer(setupServer(server));
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})


// Close Server
process.on("SIGINT", async () => {
    //await client.close();
    console.log("The application has terminated");
    process.exit();
})

process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! Reason:', reason);
});