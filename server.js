const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 3000;

// Servez des fichiers statiques (cela servira pour le frontend plus tard)
app.use(express.static('public'));

// Créez le serveur WebSocket
const wss = new WebSocketServer({ noServer: true });

// Fonction de diffusion pour envoyer des messages à tous les clients, sauf l'expéditeur
const broadcast = (message, ws) => {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
        }
    });
};

// Gérer les connexions WebSocket
wss.on('connection', (ws) => {
    console.log('Client connecté');
    ws.send('Bienvenue dans le chat WebSocket !'); // Message de bienvenue

    // Lorsque le serveur reçoit un message
    ws.on('message', (message) => {
        console.log(`Message reçu : ${message}`);
        broadcast(message, ws); // Diffuser le message aux autres clients
    });

    // Lorsque le client se déconnecte
    ws.on('close', () => {
        console.log('Client déconnecté');
    });
});

// Intégrer le serveur WebSocket au serveur HTTP
const server = app.listen(PORT, () => {
    console.log(`Le serveur fonctionne sur http://localhost:${PORT}`);
});

// Mettre à niveau les requêtes HTTP vers les connexions WebSocket
server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});
