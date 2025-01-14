import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useWaku } from "@waku/react";
import { LightNode } from "@waku/interfaces";
import {
  TextInput,
  TextComposer,
  Row,
  Fill,
  Fit,
  SendButton,
} from "@livechat/ui-kit";

interface Props {
  hasLightPushPeers: boolean;
  sendMessage: ((msg: string) => Promise<void>) | undefined;
}

export default function MessageInput(props: Props) {
  const { hasLightPushPeers } = props;
  const { node } = useWaku<LightNode>();

  const [inputText, setInputText] = useState<string>("");
  const [isActive, setActiveButton] = useState<boolean>(false);

  const onMessage = async () => {
    if (props.sendMessage && inputText) {
      try {
        await props.sendMessage(inputText);
      } catch (e) {
        console.error(`Failed to send message: ${e}`);
      }
      setInputText("");
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setInputText(event.target.value);
  };

  const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      isActive &&
      event.key === "Enter" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.shiftKey
    ) {
      await onMessage();
    }
  };

  // Enable the button if there are peers available or the user is sending a command
  useEffect(() => {
    if (inputText.startsWith("/") || hasLightPushPeers) {
      setActiveButton(true);
    } else if (node) {
      setActiveButton(false);
    }
  }, [node, inputText, hasLightPushPeers]);

  return (
    <TextComposer
      onKeyDown={onKeyDown}
      onChange={onChange}
      active={isActive}
      onButtonClick={onMessage}
    >
      <Row align="center">
        <Fill>
          <TextInput />
        </Fill>
        <Fit>
          <SendButton />
        </Fit>
      </Row>
    </TextComposer>
  );
}
