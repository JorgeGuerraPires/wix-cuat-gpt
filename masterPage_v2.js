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
Fale sempre na primeira pessoa, como se fosse eu falando. 
`

//Palavras-chaves e suas respetivas respostas
/**Temos um vetor de objetos.
 * Cada objeto tem um vetor de palavras chaves, e resposta para essa palavras-chaves
 * */
$w.onReady(async function () { //executa sempre que tudo está pronto no frontend

    const context = await acessar_banco_arvore();

    const palavraschaves = await acessar_banco();

    let mensagens = [];

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

            const promissas = context.map(async (elem, index) => {

                if (await doesAnswerTheQuestion(`${comando} \n "${elem}"`, mensage.payload.text)) {
                    /**somente entra nessa estrutura se o contexto puder respondar á pergunta */

                    if (mensagens.length === 0) {
                        mensagens.push({ "role": "system", "content": `${comando_reposta} \n "${elem}"` });

                    } else {
                        const aux = mensagens.slice(1);
                        mensagens = [{ "role": "system", "content": `${comando_reposta} \n "${elem}"` }, ...aux]
                    }

                    if (index === 0)
                        mensagens.push({ "role": "user", "content": mensage.payload.text });

                    console.log(mensagens);
                    const aux = await chatbot(mensagens);
                    resposta = resposta + " \n " + aux;
                    console.log(resposta);
                }
            })

            await Promise.all(promissas);

            let resposta_final = ""

            if (resposta.length) {
                resposta_final = await chatbot([{ "role": "system", "content": `${comando_reposta_final}  \n mensagem: ${resposta}` }]);
                mensagens.push({ "role": "system", "content": resposta_final });

            } else
                resposta = "Não posso ajudar. Alguém entrará em contato em breve"

            sendChatMessage(resposta_final, mensage.channelId);
            console.log(mensagens);
        }

    })
})
