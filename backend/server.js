require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require("express");
const cors = require('cors');
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