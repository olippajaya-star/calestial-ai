const HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Calestial AI</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#111827;color:white;font-family:Arial,sans-serif;height:100vh}
.app{height:100vh;display:flex;flex-direction:column;max-width:900px;margin:auto}
header{padding:20px;border-bottom:1px solid #374151;font-size:22px;font-weight:bold}
#chat{flex:1;overflow:auto;padding:20px}
.msg{padding:14px 16px;margin:10px 0;border-radius:14px;max-width:80%;line-height:1.5;white-space:pre-wrap}
.user{background:#2563eb;margin-left:auto}
.ai{background:#1f2937;margin-right:auto}
form{display:flex;gap:10px;padding:16px;border-top:1px solid #374151}
input{flex:1;padding:15px;border-radius:12px;border:1px solid #4b5563;background:#1f2937;color:white;font-size:16px}
button{padding:0 22px;border:0;border-radius:12px;background:#2563eb;color:white;font-size:16px;cursor:pointer}
</style>
</head>
<body>
<div class="app">
<header>✦ Calestial AI</header>
<div id="chat">
<div class="msg ai">Halo! Aku Calestial AI. Ada yang bisa aku bantu?</div>
</div>
<form id="form">
<input id="input" placeholder="Ketik pesan..." autocomplete="off">
<button id="send">Kirim</button>
</form>
</div>

<script>
const chat=document.getElementById("chat");
const input=document.getElementById("input");
const form=document.getElementById("form");
const send=document.getElementById("send");

function addMessage(text,type){
 const div=document.createElement("div");
 div.className="msg "+type;
 div.textContent=text;
 chat.appendChild(div);
 chat.scrollTop=chat.scrollHeight;
}

form.addEventListener("submit",async e=>{
 e.preventDefault();
 const text=input.value.trim();
 if(!text)return;

 addMessage(text,"user");
 input.value="";
 send.disabled=true;

 try{
  const res=await fetch("/api/chat",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({message:text})
  });
  const data=await res.json();
  addMessage(data.response || data.error || "Tidak ada jawaban.","ai");
 }catch{
  addMessage("Terjadi kesalahan. Coba lagi.","ai");
 }

 send.disabled=false;
 input.focus();
});
</script>
</body>
</html>`;

export default {
 async fetch(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/chat" && request.method === "POST") {
   try {
    const { message } = await request.json();

    const result = await env.AI.run(
     "@cf/meta/llama-3.1-8b-instruct",
     {
      messages: [
       {
        role: "system",
        content: "Kamu adalah Calestial AI, asisten AI yang membantu dan menjawab dengan jelas."
       },
       {
        role: "user",
        content: message
       }
      ]
     }
    );

    return Response.json({response: result.response});
   } catch {
    return Response.json(
     {error: "AI sedang mengalami masalah. Coba lagi."},
     {status: 500}
    );
   }
  }

  return new Response(HTML, {
   headers: {"Content-Type":"text/html;charset=UTF-8"}
  });
 }
};
