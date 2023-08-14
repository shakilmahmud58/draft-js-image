import ReactDOM from "react-dom";
import React, { Component } from "react";
import { EditorState, convertToRaw, convertFromRaw, AtomicBlockUtils, ContentBlock, genKey, convertFromHTML, ContentState, Modifier, Entity, RichUtils } from "draft-js";
import Editor, { composeDecorators } from "draft-js-plugins-editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "draft-js-mention-plugin";
import { stateFromHTML } from 'draft-js-import-html';
import "./editor-styles.css";
import "draft-js-mention-plugin/lib/plugin.css";
import "draft-js-static-toolbar-plugin/lib/plugin.css";
import "draft-js-image-plugin/lib/plugin.css";
import "draft-js-alignment-plugin/lib/plugin.css";
import "draft-js-focus-plugin/lib/plugin.css";
import createToolbarPlugin, { Separator } from "draft-js-static-toolbar-plugin";
import { draftToMarkdown } from "markdown-draft-js";
import createImagePlugin from "draft-js-image-plugin";
import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
import createResizeablePlugin from "draft-js-resizeable-plugin";
import createBlockDndPlugin from "draft-js-drag-n-drop-plugin";
import createVideoPlugin from "draft-js-video-plugin";
import createDragNDropUploadPlugin from "@mikeljames/draft-js-drag-n-drop-upload-plugin";
import VideoAdd from "./videoAdd";
import AddImagePopup from "./imageAdd";
import AddDocPopup from "./addDoc";

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
} from "draft-js-buttons";

const mentions = [
  {
    name: "TEST GLOS",
  },
];

const initialState = {
  entityMap: {
    0: {
      type: "IMAGE",
      mutability: "IMMUTABLE",
      data: {
        src: "https://dummyimage.com/600x400/000/fff",
      },
    },
  },
  blocks: [
    {
      key: "9gm3s",
      text: "Hello...",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
    {
      key: "ov7r",
      text: " ",
      type: "atomic",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [
        {
          offset: 0,
          length: 1,
          key: 0,
        },
      ],
      data: {},
    },
    {
      key: "e23a8",
      text: "Write here",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
};

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;

const decorator = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
);

function mockUpload(data, success, failed, progress) {
  function doProgress(percent) {
    progress(percent || 1);
    if (percent === 100) {
      // Start reading the file
      Promise.all(data.files.map(readFile)).then((files) =>
        success(files, { retainSrc: true })
      );
    } else {
      setTimeout(doProgress, 250, (percent || 0) + 10);
    }
  }

  doProgress();
}

function MediaSidebar({ isOpen, onClose, onImageSelect, onDocSelect , onVideoSelect, onAddBlock }) {
  return (
    <div className={`media-sidebar ${isOpen ? "open" : ""}`}>
      <div className="media-sidebar-content">
        <div className="add-media-option" onClick={onImageSelect}>
          Add Image
        </div>
        <div className="add-media-option" onClick={onDocSelect}>
          Add Doc
        </div>
        <div className="add-media-option" onClick={onVideoSelect}>
          Add Video
        </div>
        <div className="add-media-option" onClick={onAddBlock}>
          Add Block
        </div>
        <div className="add-media-option" onClick={onClose}>
          Cancel
        </div>
      </div>
    </div>
  );
}
export default class SimpleMentionEditor extends Component {
  constructor(props) {
    super(props);

    this.toolbarPlugin = createToolbarPlugin();

    this.imagePlugin = createImagePlugin({ decorator });
    this.videoPlugin = createVideoPlugin({ decorator });

    this.dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
      handleUpload: mockUpload,
      addImage: this.imagePlugin.addImage,
    });

    this.mentionPlugin = createMentionPlugin({
      mentionTrigger: "\\",
      entityMutability: "MUTABLE",
    });
  }

  state = {
    editorState: EditorState.createWithContent(convertFromRaw(initialState)),
    suggestions: mentions,
    isImagePopupOpen: false,
    isDocPopupOpen: false,
    isVideoPopupOpen: false,
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions),
    });
  };

  onAddMention = () => {
    // get the mention object selected
  };

  focus = () => {
    this.editor.focus();
  };

  handleInsertImage = (imageUrl) => {
    
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity("IMAGE", "IMMUTABLE", { src: imageUrl });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " "),
      isImagePopupOpen: false,
    });
  };
  handleDoc=(url)=>{
    const {editorState} =this.state;
    const contentState = editorState.getCurrentContent();
    const selectionState =editorState.getSelection();
    const contentStateWithEntity = contentState.createEntity('LINK',"IMMUTABLE",{url:"www.google.com"});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentStateWithEntity,
      selectionState,
      entityKey,
    );
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithLink,
    });
    this.setState({
      editorState:newEditorState,
      isDocPopupOpen:false
    });
    console.log(contentState);
    console.log(newEditorState);

  }
  toggleImagePopup = () => {
    this.setState((prevState) => ({
      isImagePopupOpen: !prevState.isImagePopupOpen,
    }));
  };
  toggleDocPopup = () => {
    this.setState((prevState) => ({
      isDocPopupOpen: !prevState.isDocPopupOpen,
    }));
  };
  toggleVideoPopup = () => {
    this.setState((prevState) => ({
      isVideoPopupOpen: !prevState.isVideoPopupOpen,
    }));
  };

  toggleMediaSidebar = () => {
    this.setState((prevState) => ({
      isMediaSidebarOpen: !prevState.isMediaSidebarOpen,
    }));
  };

  renderMarkdown = () => {
    const contentState = this.state.editorState.getCurrentContent();
    const foo = convertToRaw(contentState);
    return draftToMarkdown(foo, {
      entityItems: {
        "\\mention": {
          open: function (entity) {
            return `<Glossary name="${entity.data.mention.name}" >`;
          },

          close: function (entity) {
            return "</Glossary>";
          },
        },
      },
    });
  };

  onVideoInsert = (editorState) => {
    this.setState({
      editorState,
      isVideoPopupOpen: false,
    });
  };

  handleAddBlock = () => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const newBlock = new ContentBlock({
      key: genKey(),
      type: "unstyled", // Change this to the desired block type, e.g., "header-one", "unordered-list-item", etc.
      text: "New paragraph of text", // Change this to the desired text for the new block
    });
    const newBlockMap = contentState.getBlockMap().set(newBlock.getKey(), newBlock);
    const newContentState = contentState.merge({
      blockMap: newBlockMap,
      selectionAfter: contentState.getSelectionAfter().set("anchorKey", newBlock.getKey()),
    });
    const newEditorState = EditorState.push(editorState, newContentState, "insert-fragment");
    this.setState({ editorState: EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter()) });

    console.log("Hi");
  };

  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const { Toolbar } = this.toolbarPlugin;

    const plugins = [
      this.mentionPlugin,
      this.toolbarPlugin,
      this.dragNDropFileUploadPlugin,
      blockDndPlugin,
      focusPlugin,
      alignmentPlugin,
      resizeablePlugin,
      this.imagePlugin,
      this.videoPlugin,
    ];

    return (
      <div className="editor-container">
        <div className="toolbar">
          <Toolbar>
            {(externalProps) => (
              <React.Fragment>
                <div className="toolbar-row">
                  <HeadlineOneButton {...externalProps} />
                  <HeadlineTwoButton {...externalProps} />
                  <HeadlineThreeButton {...externalProps} />
                </div>
                <div className="toolbar-row">
                  <BoldButton {...externalProps} />
                  <ItalicButton {...externalProps} />
                  <UnderlineButton {...externalProps} />
                  <CodeButton {...externalProps} />
                </div>
                <div className="toolbar-row">
                  <UnorderedListButton {...externalProps} />
                  <OrderedListButton {...externalProps} />
                  <BlockquoteButton {...externalProps} />
                </div>
              </React.Fragment>
            )}
          </Toolbar>
        </div>
        <div className="editor">
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => {
              this.editor = element;
            }}
          />
          <MentionSuggestions
            onSearchChange={this.onSearchChange}
            suggestions={this.state.suggestions}
            onAddMention={this.onAddMention}
          />
          <div className="add-media-icon" onClick={this.toggleMediaSidebar}>
          +
        </div>
          <AlignmentTool />
          <MediaSidebar
          isOpen={this.state.isMediaSidebarOpen}
          onClose={this.toggleMediaSidebar}
          onImageSelect={() => {
            this.toggleMediaSidebar();
            this.setState({ isImagePopupOpen: true });
          }}
          onDocSelect={() => {
            this.toggleMediaSidebar();
            this.setState({ isDocPopupOpen: true });
          }}
          onVideoSelect={() => {
            this.toggleMediaSidebar();
            this.setState({ isVideoPopupOpen: true });
          }}
          onAddBlock={() => {
            this.toggleMediaSidebar();
            this.handleAddBlock();
          }}
        />
        </div>
        <hr />
        <AddImagePopup
          isOpen={this.state.isImagePopupOpen}
          onClose={this.toggleImagePopup}
          onInsertImage={this.handleInsertImage}
        />
   
        <AddDocPopup
          isOpen={this.state.isDocPopupOpen}
          onClose={this.toggleDocPopup}
          onInsertDoc={this.handleDoc}
        />
        <VideoAdd
          isOpen={this.state.isVideoPopupOpen}
          onClose={this.toggleVideoPopup}
          editorState={this.state.editorState}
          onChange={this.onVideoInsert}
          modifier={this.videoPlugin.addVideo}
        />
      </div>
    );
  }
}

ReactDOM.render(<SimpleMentionEditor />, document.getElementById("root"));
