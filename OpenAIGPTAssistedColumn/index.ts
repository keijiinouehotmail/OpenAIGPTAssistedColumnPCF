import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { AssistedColumnReact, IAssistedColumnReactProps } from "./AssistedColumnReact";

export class OpenAIGPTAssistedColumn implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private version = "1.0.4";
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private _value: string | undefined;

    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this._value = context.parameters.assistedColumn.raw!;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const props: IAssistedColumnReactProps = { 
            currentValue: context.parameters.assistedColumn.raw?.toString() || '',
            keyword: context.parameters.keyword.raw?.toString() || '',
            querySentence: context.parameters.querySentence.raw?.toString() || '',
            apiKeyOpenAI: context.parameters.apiKeyOpenAI.raw?.toString() || '',
            context: context,
            onApply: this.onApply.bind(this),
            version: this.version,
        };
        return React.createElement(
            AssistedColumnReact, props
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return { 
            assistedColumn: this._value,
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }

    private onApply(newValue: string) {
        this._value = newValue;
        this.notifyOutputChanged();
    }
}
