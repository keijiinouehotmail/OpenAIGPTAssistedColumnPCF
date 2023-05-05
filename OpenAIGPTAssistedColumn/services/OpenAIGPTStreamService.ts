import * as React from 'react';
import { GPTService } from './GPTService';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export class OpenAIGPTStreamService extends GPTService {
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
        await fetchEventSource('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.apiKeyOpenAI,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                max_tokens: 4000,
                temperature: 0.9,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0.6,
                stream: true,
                messages: [{
                    "role": "system",
                    "content": "You are a helpful assistant.",
                },
                {
                    "role": "user",
                    "content": this.qsFilled,
                }],
            }),
            signal: ctrl.signal,
            onmessage(ev) {
                for (const chunk of ev.data.split('\n')) {
                    if (chunk) {
                        if (chunk == '[DONE]') {
                            done();
                        } else {
                            const chunkObj = JSON.parse(chunk);
                            const chunkText = chunkObj.choices[0].delta.content;
                            if (chunkText) {
                                gotChunkText(chunkText);
                            }
                        }
                    }
                }
            }
        });
    }
}
