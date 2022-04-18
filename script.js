let nomeUser;
let alvoMsg= "Todos";
let tipoTraduzido= "Público";
let tipoMsg="message";
let msgs=[];
let nomeContatos=[];


document.querySelector(".janela-inicial").addEventListener("keydown",function(e){
    if (e.key==="Enter"){
        cadastraNome();
    }
});

document.querySelector(".janela-principal").addEventListener("keydown",function(e){
    if (e.key==="Enter"){
        enviaMsg();
    }
});

function inicio(){
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", {name: nomeUser});
    promise.then(iniciaChat);
    promise.catch(tratarErroNome);
}

function renovaStatus(){
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {name: nomeUser});
}

function iniciaChat(){
    carregaContatos();
    setInterval(renovaStatus,5000);
    setInterval(carregaChat,3000);
    setInterval(carregaContatos,10000);
}

function carregaContatos(){
    const promise=axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(carregaNomes);
}

function carregaNomes(response){
    nomeContatos= response.data;
    renderizarNomes();
}

function renderizarNomes(){
    const divContatos=document.querySelector(".lista-contatos");
    let opcao="";
    if(alvoMsg==="Todos"){
        opcao="marcado";
    }
    divContatos.innerHTML=`
    <div class="opcoes ${opcao}" onclick="escolheAlvoMsg(this)">
        <div>
            <ion-icon name="people"></ion-icon><span>Todos</span>
        </div>
        <ion-icon name="checkmark-sharp" class="check"></ion-icon>
    </div>`;
    
    for(i=0; nomeContatos.length>i; i++){
        if(nomeContatos[i].name!==nomeUser){
            opcao="";
            if(nomeContatos[i].name===alvoMsg){
                opcao="marcado";
            }
            divContatos.innerHTML+=`
            <div class="opcoes ${opcao}" onclick="escolheAlvoMsg(this)">
                <div>
                    <ion-icon name="person-circle"></ion-icon><span>${nomeContatos[i].name}</span>
                </div>
                <ion-icon name="checkmark-sharp" class="check"></ion-icon>
            </div>`;
        }
    } 
}

function atualizaTipoMsg(){
    if(tipoTraduzido==="Público"){
        tipoMsg="message";
    }
    else if(tipoTraduzido==="Reservadamente"){
        tipoMsg="private_message";
    }
}

function escolheAlvoMsg(elemento){
    if(document.querySelector(".lista-contatos .marcado")!== null){
        document.querySelector(".lista-contatos .marcado").classList.remove("marcado");
    }
    elemento.classList.add("marcado");
    alvoMsg=elemento.querySelector("span").innerHTML;
    document.querySelector(".barra-inferior h2").innerHTML=`Enviando para ${alvoMsg} (${tipoTraduzido})`;
}

function escolheVisibilidade(elemento){
    if(document.querySelector(".visibilidade .marcado")!== null){
        document.querySelector(".visibilidade .marcado").classList.remove("marcado");
    }
    elemento.classList.add("marcado");
    tipoTraduzido=elemento.querySelector("span").innerHTML;
    document.querySelector(".barra-inferior h2").innerHTML=`Enviando para ${alvoMsg} (${tipoTraduzido})`;
    atualizaTipoMsg();
}

function carregaChat(){
    const promise=axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(carregaMsgs);
}

function carregaMsgs(response){
    document.querySelector(".janela-inicial").classList.add("escondido");
    document.querySelector(".janela-principal").classList.remove("escondido");
    msgs= response.data;
    renderizarMsgs();
}

function converteHora(hora){
    let horaAtual=Number(hora.slice(0,2))+9;
    if (horaAtual>=24){
        horaAtual-=24;
    }
    if(String(horaAtual).length<2){
        horaAtual="0"+horaAtual;
    }
    return horaAtual+hora.slice(2,hora.length);
}

function renderizarMsgs(){
    const divChat=document.querySelector(".conteiner-chat");
    divChat.innerHTML="";

    for(i=0; msgs.length>i; i++){
        if (msgs[i].type==="status"){
            divChat.innerHTML+=`
            <div class="mensagem alerta">
                <span>(${converteHora(msgs[i].time)})</span> <strong>${msgs[i].from}</strong> ${msgs[i].text}
            </div>`;
        }
        if (msgs[i].type==="message"){
            divChat.innerHTML+=`
            <div class="mensagem">
                <span>(${converteHora(msgs[i].time)})</span> <strong>${msgs[i].from}</strong> para <strong>${msgs[i].to}</strong>: ${msgs[i].text}
            </div>`;
        }
        if (msgParaMim()){
            divChat.innerHTML+=`
            <div class="mensagem reservada">
                <span>(${converteHora(msgs[i].time)})</span> <strong>${msgs[i].from}</strong> reservadamente para <strong>${msgs[i].to}</strong>: ${msgs[i].text}
            </div>`;
        }
        const ultimaMsg=document.querySelector(".conteiner-chat").lastElementChild;
        ultimaMsg.scrollIntoView();
    }
}

function msgParaMim(){
    if (msgs[i].type==="private_message" && (msgs[i].from===nomeUser|| msgs[i].to===nomeUser || msgs[i].to==="Todos")){
        return true;
    }
    return false;
}

function cadastraNome(){
    nomeUser=document.querySelector(".nome-user").value;
    document.querySelector(".login").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");
    inicio();
}

function tratarErroNome(){
    document.querySelector(".carregando").classList.add("escondido");
    document.querySelector(".login").classList.remove("escondido");
    const caixaNomeUser=document.querySelector(".nome-user");
    caixaNomeUser.classList.add("existente");
    caixaNomeUser.setAttribute("placeholder", "Nome de usuário indisponível");
    caixaNomeUser.value="";
}

function janelaUsers(){
    document.querySelector(".janela-users").classList.toggle("mostrar");
}

function enviaMsg(){
    const textoMsg= document.querySelector(".caixa-msg").value;
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/messages",{
        from: nomeUser,
        to: alvoMsg,
        text: textoMsg,
        type: tipoMsg
    });
    document.querySelector(".caixa-msg").value="";
    promise.then(carregaChat);
    promise.catch(window.location.reload);
}