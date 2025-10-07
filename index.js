// 必要な部品を読み込む
const express = require('express');
const line = require('@line/bot-sdk');
const { OpenAI } = require('openai'); // OpenAIの部品を追加

// LINE Botの設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// OpenAIの設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // RenderからAPIキーを読み込む
});

// サーバーの準備
const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// メインの処理
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  try {
    // OpenAIに相談して、返信を生成する
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'あなたは親切なアシスタントです。' }, // AIの役割設定
        { role: 'user', content: event.message.text }, // ユーザーからのメッセージ
      ],
      model: 'gpt-3.5-turbo', // AIのモデルを指定
    });

    const aiReply = completion.choices[0].message.content;

    // AIからの返信メッセージを作成
    const replyMessage = { type: 'text', text: aiReply };

    // LINEにメッセージを返信する
    const client = new line.Client(config);
    return client.replyMessage(event.replyToken, replyMessage);

  } catch (error) {
    console.error('AIからの返信生成中にエラーが発生しました:', error);
    return Promise.resolve(null);
  }
}

// サーバーを起動
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Server listening');
});
