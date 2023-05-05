import * as React from 'react';
import { GPTService, IGPTMessage } from './GPTService';
import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * class AzureOAIGPTStreamService
 * Supporting api-version=2023-03-15-preview
 */
export class AzureOAIGPTStreamService extends GPTService {
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
    async getAndSetOpenAICompletion() {
        this.setGetting(true);

        let text = '';
        const done = () => {
            this.setCompletionResponse(text);
            this.setGetting(false);
        };
        const gotChunkText = (chunkText: string) => {
            text += chunkText;
            // String.fromCodePoint(0x258C) is such as text caret: ▌
            this.setCompletionResponse(text + String.fromCodePoint(0x258C));

        };
        const ctrl = new AbortController();
        const _messages: IGPTMessage[] = [];
        _messages.push({ "role": "system", "content": "You are a helpful assistant." });
        _messages.push({ "role": "user", "content": this.qsFilled })
        await fetchEventSource(this.endpointURLAzureOAI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKeyOpenAI,
            },
            body: JSON.stringify(
                {
                    "messages": _messages,
                    "max_tokens": 4000,
                    "temperature": 0.9,
                    "frequency_penalty": 0,
                    "presence_penalty": 0,
                    "top_p": 1,
                    "stream": true,
                    "stop": null,
                }
            ),
            signal: ctrl.signal,
            onmessage(ev) {
                const chunkText = JSON.parse(ev.data).choices[0].delta.content;
                if (chunkText) {
                    gotChunkText(chunkText);
                }
            },
            onclose() {
                done();
            }
        });
    }
}
