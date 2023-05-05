import * as React from 'react';
// There is no example to use openai npm package in https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/chatgpt
// So at this time this code is using axios.
// import * as openai from 'openai';
import axios from 'axios';
import { GPTService, IGPTMessage } from './GPTService';

export class AzureOAIGPTService extends GPTService {
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
        super(
            apiKeyOpenAI,
            qsFilled,
            setCompletionResponse,
            setGetting,
        );

        this.apiKeyOpenAI = apiKeyOpenAI;
        this.endpointURLAzureOAI = endpointURLAzureOAI;
        this.qsFilled = qsFilled;
        this.setCompletionResponse = setCompletionResponse;
        this.setGetting = setGetting;
    }
    // This function works with api-version=2023-03-15-preview
    async getAndSetOpenAICompletion() {
        this.setGetting(true);
        const _messages: IGPTMessage[] = [];
        _messages.push({ "role": "system", "content": "You are a helpful assistant." });
        _messages.push({ "role": "user", "content": this.qsFilled })
        const response = await axios({
            method: 'post',
            url: this.endpointURLAzureOAI,
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKeyOpenAI,
            },
            data:
            {
                "messages": _messages,
                "max_tokens": 4000,
                "temperature": 0.9,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "top_p": 1,
                "stop": null,
            },
        });

        const completionContent = response.data!.choices[0]!.message.content;
        this.setCompletionResponse(completionContent);
        this.setGetting(false);
    }
    // This function works with api-version=2022-12-01
    async getAndSetOpenAICompletion20221201() {
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
