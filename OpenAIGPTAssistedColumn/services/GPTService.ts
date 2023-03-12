import * as React from "react";

export abstract class GPTService {
    constructor(
        apiKeyOpenAI: string,
        qsFilled: string,
        setCompletionResponse: React.Dispatch<React.SetStateAction<string>>,
        setGetting: React.Dispatch<React.SetStateAction<boolean>>,
    ){}
    abstract getAndSetOpenAICompletion(): Promise<void>;
}