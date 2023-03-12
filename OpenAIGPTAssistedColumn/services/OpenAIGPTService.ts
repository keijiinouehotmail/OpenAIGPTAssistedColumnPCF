import * as React from 'react';
import * as openai from 'openai';
import { GPTService } from './GPTService';

export class OpenAIGPTService extends GPTService {
    apiKeyOpenAI: string;
    qsFilled: string;
    setCompletionResponse: React.Dispatch<React.SetStateAction<string>>;
    setGetting: React.Dispatch<React.SetStateAction<boolean>>;
    constructor(
        apiKeyOpenAI: string,
        qsFilled: string,
        setCompletionResponse: React.Dispatch<React.SetStateAction<string>>,
        setGetting: React.Dispatch<React.SetStateAction<boolean>>,
    ) {
        super(
            apiKeyOpenAI,
            qsFilled,
            setCompletionResponse,
            setGetting,
        );
        
        this.apiKeyOpenAI = apiKeyOpenAI;
        this.qsFilled = qsFilled;
        this.setCompletionResponse = setCompletionResponse;
        this.setGetting = setGetting;
    }
    async getAndSetOpenAICompletion() {
        this.setGetting(true);
        const configuration = new openai.Configuration({
            apiKey: this.apiKeyOpenAI
        });
        const api = new openai.OpenAIApi(configuration);
        const response = await api.createChatCompletion({
            model: "gpt-3.5-turbo",
            max_tokens: 4000,
            temperature: 0.9,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            messages: [{
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {
                "role": "user",
                "content": this.qsFilled,
            }],
        });
        const completionContent = response.data!.choices[0]!.message!.content;
        // console.log(completionContent);
        this.setCompletionResponse(this.removeFirstEmptyLines(completionContent) ?? '');
        this.setGetting(false);
    }
    removeFirstEmptyLines(text: string) {
        return text.replace(/^\n\n/, '');
    }
}
