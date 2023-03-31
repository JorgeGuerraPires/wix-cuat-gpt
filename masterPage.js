//Importando do backend
import { sendChatMessage } from "backend/wix-chat";
import { detectar_palavras_chaves } from "backend/util.jsw";

//Palavras-chaves e suas respetivas respostas
const palavraschaves = [{
    palavras: ["JavaScript"],
    resposta: "Eu ensino JavaScript. Contrate meus serviços em: http://bit.ly/3KnI9jV"
}]

$w.onReady(function () { //executa sempre que tudo está pronto no frontend

    $w('#wixChat').onMessageSent(async (mensage) => { //executa somente quando uma mensagem é enviada
   
        if (await detectar_palavras_chaves(mensage.payload.text, palavraschaves[0].palavras))
            sendChatMessage(palavraschaves[0].resposta, mensage.channelId);
        else
            sendChatMessage("Infelizmente, não posso te ajudar", mensage.channelId);
    })

});
