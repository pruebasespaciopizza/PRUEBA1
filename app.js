const express = require('express');
const app = express();
app.use(express.json());

const { VERIFY_TOKEN, WHATSAPP_TOKEN, PHONE_NUMBER_ID, PORT } = process.env;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message?.type === 'text') {
    const from = message.from;
    const text = message.text.body;
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        text: { body: `Recibimos tu mensaje: "${text}". Te responderemos pronto.` }
      })
    });
  }
  res.sendStatus(200);
});

app.listen(PORT || 3000, () => console.log('Webhook running'));
