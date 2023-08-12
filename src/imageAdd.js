import React, { Component } from "react";
import styles from "./styles.css";
import axios from 'axios';

export default class AddImagePopup extends Component {
    state = {
      imageUrl: ""
    };

    handleInputChange = (event) => {
      this.setState({
        imageUrl: event.target.files[0],
      });
    };
  
    handleInsertImage = () => {
      
      const { onInsertImage } = this.props;
      const { imageUrl } = this.state;
    
      const data = new FormData();
      data.append('file',imageUrl);
      axios.post('http://localhost:8000/api/save-image',data).then(res=>{
        console.log(res.data);
        onInsertImage(res.data);
      })
      
      this.setState({
        imageUrl: ""
      });
    };
  
    render() {
      const { isOpen, onClose } = this.props;
      const { imageUrl } = this.state;
  
      if (!isOpen) {
        return null;
      }
  
      return (
        <div className="image-popup">
          <div className="image-popup-content">
            <div className="image-popup-header">
              <span className="image-popup-title">Insert Image</span>
              <button className="image-popup-close" onClick={onClose}>
                &times;
              </button>
            </div>
            <div className="image-popup-body">
              {/* <input
                type="text"
                value={imageUrl}
                onChange={this.handleInputChange}
                placeholder="Enter image URL"
              /> */}
              <input
                type="file"
                onChange={this.handleInputChange}
              />
            </div>
            <div className="image-popup-footer">
              <button className="image-popup-insert" onClick={this.handleInsertImage}>
                Insert
              </button>
            </div>
          </div>
        </div>
      );
    }
  }