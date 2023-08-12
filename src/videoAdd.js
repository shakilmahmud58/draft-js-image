import React, { Component } from "react";
import styles from "./styles.css";
import axios from "axios";

export default class VideoAdd extends Component {
  // Start the popover closed
  state = {
    videoUrl: "",
    isVideoPopupOpen: false,

  };


  addVideo = () => {
    const {videoUrl} = this.state;
    const { editorState, onChange } = this.props;
    const data = new FormData();
    data.append('file',videoUrl);
    axios.post('http://localhost:8000/api/save-image',data).then(res=>{
      console.log(res.data);
      //onInsertImage(res.data);
      onChange(this.props.modifier(editorState, { 
        src: res.data}));
    })
    
  };

  changeVideoUrl = (evt) => {
    this.setState({ videoUrl: evt.target.files[0] });
  }

  render() {
    const { isOpen, onClose } = this.props;

    if (!isOpen) {
      return null;
    }
    return (
      <div className="image-popup">
        <div className="image-popup-content">
          <div className="image-popup-header">
            <span className="image-popup-title">Insert Video</span>
            <button className="image-popup-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="image-popup-body">
            <input
              type="file"
              onChange={this.changeVideoUrl}
            />
          </div>
          <div className="image-popup-footer">
            <button className="image-popup-insert" onClick={this.addVideo}>
              Insert
            </button>
          </div>
        </div>
      </div>
    );
  }
}