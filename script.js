'use strict'
// 1行目に記載している 'use strict' は削除しないでください


//音声認識し文字起こし-----------------------
const recognition = new webkitSpeechRecognition(); // prefix 必要 SpeechRecognition
recognition.lang = "ja";
recognition.continuous = true;

//結果
recognition.onresult = async({ results }) => {//音声認識のテキストが返ってきたらchatgptに投げ、音声

  //まず２つのdivを追加
  const myQuestion = document.createElement("div");
  const gptResponse = document.createElement("div");
  myQuestion.className = "myQuestion";
  gptResponse.className = "gptResponse";

  //自分の質問を表示
  console.log(results[0][0].transcript)
  myQuestion.textContent = results[0][0].transcript;
  document.getElementById('Line').appendChild(myQuestion);

  console.log("実行1");

  const responseText = await requestChatAPI(results[0][0].transcript);//①インプットに入れたテキストをchatgptに投げる関数に入れる。②メッセージテキストが返ってくる

  console.log("実行2");
  console.log(responseText)
  gptResponse.innerText = responseText;//output(入力欄の下にgptの返答が返される。)
  document.getElementById('Line').appendChild(gptResponse);

  // await createAudio(responseText);//レスポンステキストが返ってきたら読み上げる。
};
//音声認識開始
const startButton = document.querySelector(".start");
startButton.addEventListener("click", () => {
  recognition.start();
});
//音声認識終了
const stopButton = document.querySelector(".stop");
stopButton.addEventListener("click", () => {
  recognition.stop();
});



// TODO:

const sendButton = document.querySelector(".send");

//api_keyの暗号化
//const api_key = "？？？";
//const passPhrase = "？？？"; //秘密キー
//const encryptedTxt = CryptoJS.AES.encrypt(api_key, passPhrase);
//console.log(encryptedTxt.toString());

//復号化
//関数の中へ


//送るボタンを押した時に実行する事
sendButton.addEventListener("click", async () => {
  const myQuestion = document.createElement("div");
  const gptResponse = document.createElement("div");
  myQuestion.className = "myQuestion";
  gptResponse.className = "gptResponse";

//textにインプットを保存　

  const text = document.querySelector("[name=talk]");
  //responseTextがチャットgptの返答　前3つのトークは保持できるように変更したい。
  myQuestion.textContent = text.value;
  document.getElementById('Line').appendChild(myQuestion);
  text.value = "";

  const responseText = await requestChatAPI(myQuestion.textContent);//①インプットに入れたテキストをchatgptに投げる関数に入れる。②メッセージテキストが返ってくる
  

  console.log(responseText)
  gptResponse.innerText = responseText;//output(入力欄の下にgptの返答が返される。)
  document.getElementById('Line').appendChild(gptResponse);
  // await createAudio(responseText);//レスポンステキストが返ってきたら読み上げる。
});

//chatgptに投げる関数
let history = []; // 会話履歴を保持するための配列を作成します。

async function requestChatAPI(text) {
//api_keyの復号化
const passElement = document.getElementsByName("pass")[0]//パスワード入力欄
const encryptedTxt = "U2FsdGVkX1/ygbRXBRyjxJcOcrPNdV1dnUVbjW8mvanObtkl7a4c7dHtqPCvOeBgzlyfeJ1jOHObQ2eCLZXh9bGiO2bCGhq1azyIdusRc1I="
const api_key1 = CryptoJS.AES.decrypt(encryptedTxt, passElement.value).toString(
  CryptoJS.enc.Utf8
); //復号化
console.log(api_key1);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${api_key1}`,
  };

  // 新しいメッセージを履歴に追加します。
  history.push(

    {
      role: "user",
      content: text,
  });

  // 履歴が4つ以上のメッセージを持っている場合、最初のメッセージを削除します。
  if (history.length > 3) {
    history.shift();
    //配列を逆にする
    history.reverse();
    //配列の長さを4にする
    history.length = 3
    //配列を逆にする
    history.reverse()
  }

  //性格を生成
  const personality = [{
    role: "system",
    content: "あなたは私のかわいいメイドです。絵文字を多用します。"
  }];
  const character = document.getElementById("character")
  if (character.value.length !== 0) {
    personality[0].content = character.value
    console.log("a")
  }else {
  }
  console.log(personality)


  const payload = {
    model: "gpt-3.5-turbo",
    max_tokens: 512,
    messages: [...personality, ...history], // 会話履歴をpayloadに設定します。
  };
  console.log(payload.messages)
  
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    payload,
    {
      headers: headers,
    }
  );

  // 応答を履歴に追加します。
  history.push({
    role: "assistant",
    content: response.data.choices[0].message.content,
  });

  const sound = document.querySelector('.sound').checked;
  if (sound) {
    createAudio(response.data.choices[0].message.content);
  }
  return response.data.choices[0].message.content;
}

//音声読み上げ--------------------------------------------------------

//speechSynthesis()　音声合成 https://qiita.com/hmmrjn/items/be29c62ba4e4a02d305c
function createAudio(text) {
  const uttr = new SpeechSynthesisUtterance(text);//音声合成のAPIを定義
  //投げる文章
  //uttr.text = text;
  // 言語 (日本語:ja-JP, アメリカ英語:en-US, イギリス英語:en-GB, 中国語:zh-CN, 韓国語:ko-KR)
  // uttr.lang = "ja-JP"
  // 速度 0.1-10 初期値:1 (倍速なら2, 半分の倍速なら0.5)
  uttr.rate = 1.0
  // 高さ 0-2 初期値:1
  uttr.pitch = 1;
  // 音量 0-1 初期値:1
  uttr.volume = 0.5

  //発言を再生
  speechSynthesis.speak(uttr);
}

//スマホ用読み上げボタン
const speakBtn = document.querySelector('#speak-btn')

speakBtn.addEventListener('click', function() {
  // 発言を作成
  let gptResponse = document.getElementsByClassName("gptResponse");
  let lastResponse = gptResponse[gptResponse.length - 1];
  const uttr = new SpeechSynthesisUtterance(lastResponse.innerText);
  uttr.lang = "ja-JP"
  // 速度 0.1-10 初期値:1 (倍速なら2, 半分の倍速なら0.5)
  uttr.rate = 1.0;
  // 高さ 0-2 初期値:1
  uttr.pitch = 1;
  // 音量 0-1 初期値:1
  uttr.volume = 0.5
  // 発言を再生 (発言キューに発言を追加)
  speechSynthesis.speak(uttr)
})

