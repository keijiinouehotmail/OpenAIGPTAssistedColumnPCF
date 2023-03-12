import * as React from 'react';
// There is no example to use openai npm package in https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/chatgpt
// So at this time this code is using axios.
// import * as openai from 'openai';
import axios from 'axios';

export class AzureOAIGPTService {
    apiKeyOpenAI: string;
    qsFilled: string;
    endpointURLAzureOAI: string;
    setCompletionResponse: React.Dispatch<React.SetStateAction<string>>;
    setGetting: React.Dispatch<React.SetStateAction<boolean>>;
    constructor(
        apiKeyOpenAI: string,
        endpointURLAzureOAI: string,
        qsFilled: string,
        setCompletionResponse: React.Dispatch<React.SetStateAction<string>>,
        setGetting: React.Dispatch<React.SetStateAction<boolean>>,
    ) {
        this.apiKeyOpenAI = apiKeyOpenAI;
        this.endpointURLAzureOAI = endpointURLAzureOAI;
        this.qsFilled = qsFilled;
        this.setCompletionResponse = setCompletionResponse;
        this.setGetting = setGetting;
    }
    async getAndSetOpenAICompletion() {
        this.setGetting(true);
        const response = await axios({
            method: 'post',
            url: this.endpointURLAzureOAI,
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKeyOpenAI,
            },
            data:
            {
                "prompt": `<|im_start|>system\nYou are a helpful assistant.\n<|im_end|>\n<|im_start|>user\n${this.qsFilled}\n<|im_end|>\n<|im_start|>assistant\n`,
                "max_tokens": 4000,
                "temperature": 0.9,
                "top_p": 1,
                "stop": "<|im_end|>"
            },
        });

        const completionContent = response.data!.choices[0]!.text;
        this.setCompletionResponse(this.removeFirstEmptyLines(completionContent) ?? '');
        this.setGetting(false);
    }
    removeFirstEmptyLines(text: string) {
        return text.replace(/^\n\n/, '');
    }
}
