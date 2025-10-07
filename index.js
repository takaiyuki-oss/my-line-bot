// 必要な部品を読み込む
const express = require('express');
const line = require('@line/bot-sdk');

// LINE Botの設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// サーバーの準備
const app = express();

// Webhookへのリクエストを処理
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// イベントごとの処理
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const receivedText = event.message.text;
  let replyText;

  if (receivedText === '天気') {
    replyText = '晴れです';
  } else if (receivedText === 'おはよう') {
    replyText = 'おはようございます！';
  } else {
    replyText = 'その言葉は分かりません。';
  }
  
  const replyMessage = { type: 'text', text: replyText };
  const client = new line.Client(config);
  return client.replyMessage(event.replyToken, replyMessage);
}

// サーバーを起動
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Server listening');
});
