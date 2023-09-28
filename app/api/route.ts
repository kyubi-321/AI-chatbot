import { OpenAIStream , StreamingTextResponse} from "ai";
import { Configuration , OpenAIApi} from "openai-edge";
import { prisma } from "../db";


const config = new Configuration({

    apiKey : process.env.OPEN_API_KEY
})

const openapi = new OpenAIApi(config)

//  export const runtime = "edge"

export async function POST(req: Request){
    const {messages} = await req.json()

    const response = await openapi.createChatCompletion({
        model:"gpt-3.5-turbo",
        stream: true,
        messages: messages

    })

    console.log(messages)

    const stream = OpenAIStream(response,{
        onCompletion : async (completion : string)=>{
                 const data = await prisma.message.create({
                    data:{
                        question:messages.slice(-1)[0].content,
                        answer:completion,
                        
                    }
                })
        }
    }
        )

    return new StreamingTextResponse(stream)

}