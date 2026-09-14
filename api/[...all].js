// Vercel serverless entry — mounts the Express backend at /api/*
// (foodmela.online/api/*). Same code the apps already use; server.js
// exports the app and skips listen() when process.env.VERCEL is set.
const app = require('../3_Backend_API/server.js');

module.exports = app;
