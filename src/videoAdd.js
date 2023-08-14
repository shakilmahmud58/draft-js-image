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
        src: "https://samadhan-development.s3.ca-central-1.amazonaws.com/Shakil/1691813058_09233456-S.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA5D6CSLLDWISIZBCD%2F20230812%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20230812T040425Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Signature="
      }));
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