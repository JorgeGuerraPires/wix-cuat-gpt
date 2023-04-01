//Importando do backend
import { sendChatMessage } from "backend/wix-chat";
import { detectar_palavras_chaves, acessar_banco } from "backend/util.jsw";

//Palavras-chaves e suas respetivas respostas
/**Temos um vetor de objetos. 
 * Cada objeto tem um vetor de palavras chaves, e resposta para essa palavras-chaves 
 * */

    $w.onReady(async function () { //executa sempre que tudo está pronto no frontend

        const palavraschaves = await acessar_banco();

        $w('#wixChat').onMessageSent(async (mensage) => { //executa somente quando uma mensagem é enviada        

            //Note o await. 
            //Isso foi necessário para evitar que o teste fosee feito na promessa, que será sempre true
            if (await detectar_palavras_chaves(mensage.payload.text, palavraschaves[0].palavras))
                sendChatMessage(palavraschaves[0].resposta, mensage.channelId); //palavra-chave achada
            else
                //palavra-chave não achada
                sendChatMessage("Infelizmente, não posso te ajudar", mensage.channelId);
        })

    })
}
