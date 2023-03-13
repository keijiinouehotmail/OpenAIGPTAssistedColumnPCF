# "OpenAI GPT Assisted Column" PCF control

[日本語はこちら (in Japanese)](./README.ja.md)

This PCF control can take advantage of the OpenAI GPT service to get an answer to record-by-record questions based on predefined patterns.  
This supports API service of both of OpenAI and Azure OpenAI, and using Chat completion service with "**gpt-3.5-turbo**" model.  

## Usage

<https://user-images.githubusercontent.com/113506926/223621425-678442b8-b5ca-46e4-8af3-364a4c0034d5.mp4>

## How to install and configure

- [How to install and configure OpenAI GPT Assisted Column (in English)](./Docs/SettingUp.md)

## Considerations

This control uses the "**gpt-3.5-turbo**" model, but for use cases like this control, the use of that model may not be optimal. This control uses this model as one example of a use case where the "**gpt-3.5-turbo**" model can be used.  
