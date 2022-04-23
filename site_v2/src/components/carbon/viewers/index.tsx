import React from "react";
import { ReactNode } from "react";
import { Carbon } from "../common";
import { DefaultViewer } from "./defaultViewer";
import { DialogueViewer } from "./dialogueViewer";

export interface Props {
    carbon: Carbon | null;
    title: ReactNode;
}

export default class Viewer extends React.Component<Props> {
    render(): React.ReactNode {
        if (!this.props.carbon || !this.props.carbon.type) {
            return <DefaultViewer {...this.props}/>
        } else {
            return <DialogueViewer {...this.props}/>
        }
    }
}
