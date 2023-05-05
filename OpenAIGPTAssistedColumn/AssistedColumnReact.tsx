import * as React from 'react';
import { ContextualMenu, IContextualMenuItem, Label, PrimaryButton, ProgressIndicator, Stack, TextField } from '@fluentui/react';
import { OpenAIGPTService } from './services/OpenAIGPTService';
import { IInputs } from './generated/ManifestTypes';
import { AzureOAIGPTService } from './services/AzureOAIGPTService';
import { OpenAIGPTStreamService } from './services/OpenAIGPTStreamService';
import { AzureOAIGPTStreamService } from './services/AzureOAIGPTStreamService';

export interface IAssistedColumnReactProps {
  currentValue?: string;
  keyword?: string;
  querySentence?: string; // This contains ${} as a placeholder for the keyword.
  apiKeyOpenAI?: string;
  apiKeyAzureOAI?: string;
  endpointURLAzureOAI?: string;
  stream: boolean;
  context: ComponentFramework.Context<IInputs>;
  onApply?: (newValue: string) => void;
  version: string;
}

export const AssistedColumnReact = React.memo<IAssistedColumnReactProps>(function AssistedColumnReactMemo(props: IAssistedColumnReactProps) {
  const regex = /\$\{\}/g;
  const qsFilled = props.querySentence!.replace(regex, props.keyword!);
  const [completionResponse, setCompletionResponse] = React.useState('');
  const [isGetting, setGetting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [currentValueEdited, setCurrentValueEdited] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(props.currentValue ?? '');
  const keywordStyle = {
    fontWeight: 'bold',
    color: 'red',
  };
  const qsFilledStyled = getQSFilledStyled(props.querySentence!, '${}', props.keyword!, keywordStyle);
  const [isResponseApplied, setIsResponseApplied] = React.useState(false);
  const linkRef = React.useRef(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault(); // don't navigate
    setShowContextualMenu(true);
  }, []);
  const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);
  const [isHovering, setIsHovering] = React.useState(false);
  const mouseEntered = () => {
    setIsHovering(true);
  };
  const mouseLeft = () => {
    setIsHovering(false);
  };
  const serviceProvider = (props.apiKeyOpenAI) ? 
    ((props.stream) ? 'OpenAI(stream)' : 'OpenAI') : 
    ((props.stream) ? 'Azure OpenAI(stream)' : 'Azure OpenAI');

  const callGPTService = async () => {
    try {
      setErrorMessage('');
      let gptService;
      if (props.apiKeyOpenAI) {
        if (props.stream)
          gptService = new OpenAIGPTStreamService(
            props.apiKeyOpenAI!,
            qsFilled,
            setCompletionResponse,
            setGetting,
          );
        else
          gptService = new OpenAIGPTService(
            props.apiKeyOpenAI!,
            qsFilled,
            setCompletionResponse,
            setGetting,
          );
      }
      else
        if (props.stream)
          gptService = new AzureOAIGPTStreamService(
            props.apiKeyAzureOAI!,
            props.endpointURLAzureOAI!,
            qsFilled,
            setCompletionResponse,
            setGetting,
          );
        else
          gptService = new AzureOAIGPTService(
            props.apiKeyAzureOAI!,
            props.endpointURLAzureOAI!,
            qsFilled,
            setCompletionResponse,
            setGetting,
          );

      await gptService.getAndSetOpenAICompletion();
    } catch (e: any) {
      setGetting(false);
      setErrorMessage(e.message ?? e);
      console.log(e);
    }
  };
  const apply = () => {
    setCurrentValue(completionResponse);
    setIsResponseApplied(true);
    props.onApply!(completionResponse);
    setCurrentValueEdited(false);
  };
  const applyEdited = () => {
    props.onApply!(currentValue);
    setCurrentValueEdited(false);
  };
  const indentButtonStyle = {
    margin: '5px 10px',
  };
  const labelStyle = {
    color: 'gray',
  }
  const validationMessage = getValidationMessage(props, qsFilled);

  return (
    <Stack horizontalAlign="start" style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', fontSize: 'small' }}>
        <a ref={linkRef} onClick={onShowContextualMenu} href="#" style={{ position: 'absolute', right: '0px' }}>
          {props.context.resources.getString('About')}</a>
        <ContextualMenu
          items={[
            {
              key: 'disabled',
              text: `v${props.version}`,
              disabled: true,
              onClick: () => console.error('Disabled item should not be clickable.'),
            },
            {
              key: 'linkWithTarget',
              text: props.context.resources.getString('Webpageofthiscontrol'),
              href: 'https://github.com/keijiinouehotmail/OpenAIGPTAssistedColumnPCF',
              target: '_blank',
            },
          ]}
          hidden={!showContextualMenu}
          target={linkRef}
          onItemClick={onHideContextualMenu}
          onDismiss={onHideContextualMenu}
        /></div>
      <Label style={labelStyle}>
        {props.context.resources.getString('SentenceforGPT')}:
      </Label>
      <Label style={{ textAlign: 'left', margin: '0px 10px' }}>
        {qsFilledStyled}
      </Label>
      <Label style={labelStyle}>
        {props.context.resources.getString('Currentvalue')}:
      </Label>
      <div style={{ boxSizing: 'border-box', width: '100%', padding: '0px 10px' }}>
        <TextField
          multiline rows={10}
          onChange={(e, v) => {
            setCurrentValueEdited(true);
            setCurrentValue(v ?? '');
          }}
          value={currentValue}
          style={{ fontWeight: isHovering ? 'initial' : 'bold' }}
          borderless={isHovering ? false : true}
          onMouseEnter={mouseEntered}
          onMouseLeave={mouseLeft} />
      </div>
      <Stack horizontal>
        {
          !isResponseApplied && (
            <PrimaryButton style={indentButtonStyle} onClick={callGPTService}>{`${props.context.resources.getString('CalltheGPTservice')} (${serviceProvider})`}</PrimaryButton>
          )}
        {
          currentValueEdited && (
            <PrimaryButton style={indentButtonStyle} onClick={applyEdited}>{props.context.resources.getString('Applyeditedvalue')}</PrimaryButton>
          )}
      </Stack>
      {
        isGetting && !isResponseApplied && (
          <div style={{ boxSizing: 'border-box', width: '100%', padding: '0px 10px' }}>
            <ProgressIndicator
              label={props.context.resources.getString('Gettingtheresponse') + '...'} />
          </div>
        )
      }
      {
        completionResponse && !isResponseApplied && (
          <Label style={labelStyle}>
            {props.context.resources.getString('ResponsefromGPT')}
          </Label>
        )
      }
      {
        completionResponse && !isResponseApplied && (
          <div style={{ boxSizing: 'border-box', width: '100%', padding: '0px 10px' }}>
            <TextField
              multiline rows={10}
              readOnly
              value={completionResponse} />
            {!isGetting && (
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', right: '0px', fontSize: 'small' }}>
                  {props.context.resources.getString('TheAIsanswermaybeincorrect')}
                </div>
              </div>
            )}
          </div>
        )
      }
      {
        completionResponse && !isGetting && !isResponseApplied && (
          <PrimaryButton style={indentButtonStyle} onClick={apply}>{props.context.resources.getString('Applythisresponse')}</PrimaryButton>
        )
      }
      {
        (errorMessage || validationMessage) &&
        <div style={{ textAlign: 'left' }}>
          <Label style={labelStyle}>
            {props.context.resources.getString('Error')}:
          </Label>
          <Label style={{ textAlign: "left", margin: '0px 10px' }}>
            {errorMessage || validationMessage}
          </Label>
        </div>
      }
    </Stack >
  )
});

const getQSFilledStyled = (querySentence: string, delimiter: string, keyword: string, keywordStyle: any) => {
  const indexArrayForKeyword: number[] = [];
  let index = querySentence.indexOf(delimiter);
  while (index !== -1) {
    indexArrayForKeyword.push(index);
    index = querySentence.indexOf(delimiter, index + 1);
  }
  const content = [];
  for (let i = 0; i < indexArrayForKeyword.length; i++) {
    const lastIndex = (i == 0) ? 0 : indexArrayForKeyword[i - 1] + delimiter.length;
    content.push(
      <span key={i.toString()}>
        {querySentence.substring(lastIndex, indexArrayForKeyword[i])}
      </span>
    );
    content.push(
      <span key={i.toString() + "k"} style={keywordStyle}>{keyword}</span>
    );
    if (i == indexArrayForKeyword.length - 1) {
      content.push(
        <span key={(i + 1).toString()}>
          {querySentence.substring(indexArrayForKeyword[i] + delimiter.length)}
        </span>
      );
    }
  }
  return content;
};

const getValidationMessage = (props: IAssistedColumnReactProps, qsFilled: string) => {
  if (!props.apiKeyOpenAI && !props.apiKeyAzureOAI) {
    return props.context.resources.getString('NeitherOfOpenAIAPIkeyisset');
  } else if (props.apiKeyOpenAI && props.apiKeyAzureOAI) {
    return props.context.resources.getString('BothOfOpenAIAPIkeyareset');
  } else if (!props.apiKeyOpenAI && !(props.apiKeyAzureOAI && props.endpointURLAzureOAI)) {
    return props.context.resources.getString('EndpointURLforAzureOpenAIisnotset');
  } else if (!qsFilled) {
    return props.context.resources.getString('QuerySentenceisnotset');
  }
};
