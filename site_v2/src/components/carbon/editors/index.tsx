import React from "react";
import { ReactNode } from "react";
import { Carbon } from "../common";
import { DefaultEditor } from "./defaultEditor";
import { DialogueEditor } from "./dialogueEditor";

export interface Props {
    carbon: Carbon | null;
    title: ReactNode;
    onSave: (carbon: Carbon) => boolean;
    onExit: () => void;
}

export default class Editor extends React.Component<Props> {
    render(): React.ReactNode {
        if (!this.props.carbon || !this.props.carbon.type) {
            return <DefaultEditor {...this.props}/>
        } else {
            return <DialogueEditor {...this.props}/>
        }
    }
}