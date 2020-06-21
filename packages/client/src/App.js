import React, { useEffect, useRef } from "react";
import * as Y from "yjs";

import { WebsocketProvider } from "y-websocket";
import {
  ySyncPlugin,
  yCursorPlugin,
  yUndoPlugin,
  undo,
  redo,
} from "y-prosemirror";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { keymap } from "prosemirror-keymap";
import randomColor from "randomcolor";

import "./prosemirror.css";

import { schema } from "./schema";

function App() {
  const view = useRef();
  const container = useRef();

  useEffect(() => {
    const ydoc = new Y.Doc();
    const type = ydoc.getXmlFragment("prosemirror");

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      "prosemirror",
      ydoc
    );

    provider.awareness.setLocalStateField("user", {
      name: Math.random().toString(36).substring(7),
      color: randomColor(),
    });

    view.current = new EditorView(container.current, {
      state: EditorState.create({
        schema,
        plugins: [
          ySyncPlugin(type),
          yCursorPlugin(provider.awareness),
          yUndoPlugin(),
          keymap({
            "Mod-z": undo,
            "Mod-y": redo,
            "Mod-Shift-z": redo,
          }),
        ].concat(exampleSetup({ schema })),
      }),
    });

    return () => view.current.destroy();
  }, []);

  return <div ref={container} />;
}

export default App;
