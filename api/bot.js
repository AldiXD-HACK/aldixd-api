{
  "version": 2,
  "builds": [
    {
      "src": "api/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/public/index.html"
    },
    {
      "src": "/connect",
      "dest": "/api/bot"
    },
    {
      "src": "/status",
      "dest": "/api/status"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
