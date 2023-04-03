//Importando do backend
import { sendChatMessage } from "backend/wix-chat";
import { detectar_palavras_chaves, acessar_banco, doesAnswerTheQuestion, acessar_banco_arvore } from "backend/util.jsw";
import { chatbot } from "backend/chatGPT.jsw";

// const context = ``

const comando = `
Dado o texto abaixo e a pergunta, responda "sim" ou "não" se o texto responde à pergunta abaixo.
Não há necessidade de que o texto seja específico nas respostas, somente que ofereça informações mesmo que genéricas.
Importante: responda com somente uma palavra, não adicione explicações. Seja direto na resposta.

`
const comando_reposta = `
Dado o texto abaixo e a pergunta, responda ao meu aluno(a).
Use somente informações contidas no texto, não faça referência a informações fora do texto.`

const comando_reposta_final = `
Coloque essa mensagem de forma amigável, usando emoji.
Seja gentil e prestativo.  
Essa mensagem faz parte de uma conversa em um chatbot. 
Fale sempre na primeira pessoa, como se fosse eu falando. 
`

//Palavras-chaves e suas respetivas respostas
/**Temos um vetor de objetos.
 * Cada objeto tem um vetor de palavras chaves, e resposta para essa palavras-chaves
 * */
$w.onReady(async function () { //executa sempre que tudo está pronto no frontend

    const context = await acessar_banco_arvore();

    const palavraschaves = await acessar_banco();

    $w('#wixChat').onMessageSent(async (mensage) => { //executa somente quando uma mensagem é enviada

        //Note o await.
        //Isso foi necessário para evitar que o teste fosee feito na promessa, que será sempre true

        let canHelp = false;

        // const promessas = palavraschaves.map(async (elem) => {

        //     if (await detectar_palavras_chaves(mensage.payload.text, elem.palavras)) {
        //         canHelp = true;
        //         sendChatMessage(elem.resposta, mensage.channelId); //palavra-chave achada 
        //     }
        // })

        // //Executa todas a promessas acumuladas pelo map
        // /**Diferente do forEach, o map retorna uma vetor  
        //  */
        // await Promise.all(promessas);

        //Se entrar em qualquer palavra chave, a variável canHelp é mudada para true, e esse if não executa
        if (!canHelp) {
            let resposta = "";

            
            const promissas = context.map(async (elem)=>{                
                
                 if (await doesAnswerTheQuestion(`${comando} \n "${elem}"`, mensage.payload.text)) {
                    /**somente entra nessa estrutura se o contexto puder respondar á pergunta */
                    const aux = await chatbot([{ "role": "system", "content": `${comando_reposta} \n "${elem}" \n Pergunta: ${mensage.payload.text}` }]);
                    resposta = resposta + " \n " + aux;
                }
            })

            await Promise.all(promissas);
            

            sendChatMessage(await chatbot([{ "role": "system", "content": `${comando_reposta_final}  \n mensagem: ${resposta}` }]), mensage.channelId);
        }

    })
})
