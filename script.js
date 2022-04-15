let nomeUser=prompt("Digite o seu nome de usuário:");
let msgs=[];
let intervalStatus;
let intervalChat;

function inicio(){
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", {name: nomeUser})
    promise.then(iniciaChat);
    promise.catch(tratarErroNome);
}

function renovaStatus(){
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {name: nomeUser});
}

function iniciaChat(){
    intervalStatus=setInterval(renovaStatus,5000);
    intervalChat=setInterval(carregaChat,3000);
}
function carregaChat(){
    const promise=axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(carregaMsgs);
}

function carregaMsgs(response){
    msgs= response.data;
    renderizarMsgs();
}

function renderizarMsgs(){
    const divChat=document.querySelector(".conteiner-chat");
    divChat.innerHTML="";

    for(i=0; msgs.length>i; i++){
        if (msgs[i].type==="status"){
            divChat.innerHTML+=`
            <div class="mensagem alerta">
                (${msgs[i].time}) <strong>${msgs[i].from}</strong> ${msgs[i].text}
            </div>`;
        }
        if (msgs[i].type==="message"){
            divChat.innerHTML+=`
            <div class="mensagem">
                (${msgs[i].time}) <strong>${msgs[i].from}</strong> para <strong>${msgs[i].to}</strong>: ${msgs[i].text}
            </div>`;
        }
        if (msgParaMim()){
            divChat.innerHTML+=`
            <div class="mensagem reservada">
                (${msgs[i].time}) <strong>${msgs[i].from}</strong> reservadamente para <strong>${msgs[i].to}</strong>: ${msgs[i].text}
            </div>`;
        }
        const ultimaMsg=document.querySelector(".conteiner-chat").lastElementChild;
        ultimaMsg.scrollIntoView();
    }
}

function msgParaMim(){
    if (msgs[i].type==="private-message" && (msgs[i].to===nomeUser || msgs[i].to==="Todos")){
        return true;
    }
    return false;
}

function tratarErroNome(){
    nomeUser=prompt("Digite outro nome de usuário, este já esta sendo usado:");
    inicio();
}

function enviaMsg(){
    const textoMsg= document.querySelector(".caixa-msg").value;
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/messages",{
        from: nomeUser,
        to: "Todos",
        text: textoMsg,
        type: "message" 
    })
    document.querySelector(".caixa-msg").value="";
    promise.then(carregaChat);
    promise.catch(window.location.reload);
}

inicio();
