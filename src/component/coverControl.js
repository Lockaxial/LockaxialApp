/**
*APP显示及上传图片，剪裁图片
*/
import React, { Component } from 'react';
import {
  View,Image,TouchableWithoutFeedback,Text
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import * as Progress from 'react-native-progress';
import ActionSheet from 'react-native-actionsheet';

import {toast} from '../util/tools';
import Upload from '../util/upload';
import trans from '../i18/trans';
import ajax from '../util/ajax';

const LABEL_CHOOSE_IMAGE_TYPE='choose image type';
const LABEL_TAKE_PICTURE='take picture';
const LABEL_PICK_LIB='pick from lib';
const ACTION_BUTTON=[trans('cancel'),trans(LABEL_TAKE_PICTURE),trans(LABEL_PICK_LIB)];

export default class CoverControl extends Component {
  constructor(props) {
    super(props);
    this.state={
      cover:props.coverImage,
      progress:0,
      isUploading:false
    }
  }

  deleteImage(){
    this.state.cover='';
    this.setState(this.state);
  }

  uploadImage(){
    this.ActionSheet.show();
  }

  onChooseUploadImage(index){
    if(index==1){
      this.uploadImageDirectly(true);
    }else if(index==2){
      this.uploadImageDirectly(false);
    }
  }

  uploadImageDirectly(isTakePhoto){
    let _this=this;
    isTakePhoto
    if(isTakePhoto){
      ImagePicker.openCamera({
        width: 300,
        height: 300,
        cropping: true
      }).then(image => {
        _this.upload([image]);
      });
    }else{
      ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true
      }).then(image => {
        _this.upload([image]);
      });
    }
  }

  onUploadStart(){
    this.state.isUploading=true;
    this.setState(this.state);
  }

  onUploadAllComplete(){
    this.state.isUploading=false;
    this.state.progress=0;
    this.setState(this.state);
    if(this.props.onChangeCover){
      this.props.onChangeCover(this.state.cover);
    }
  }

  onUploadProgress(index,evt){
    this.state.progress=evt.loaded / evt.total;
    this.setState(this.state);
  }

  onUploadFailed(index,evt){
  }

  onUploadCanceled(index,evt){
  }

  onUploadComplete(index,data,evt){
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    let imageUrl=ajax.convertImageUrl(data.fileUrl);
    this.state.cover=imageUrl;
  }

  upload(images){
    let _this=this;
    if(images&&images.length>0){
      let uploader=new Upload({
        url:ajax.convertUrl('/upload/image'),
        files:images,
        onUploadStart:()=>_this.onUploadStart(),
        onUploadProgress:(index,evt)=>_this.onUploadProgress(index,evt),
        onUploadFailed:(index,evt)=>_this.onUploadFailed(index,evt),
        onUploadCanceled:(index,evt)=>_this.onUploadCanceled(index,evt),
        onUploadComplete:(index,data,evt)=>_this.onUploadComplete(index,data,evt),
        onUploadAllComplete:()=>_this.onUploadAllComplete()
      });
      uploader.start();
    }
  }

  render() {
    return (
      <View style={this.props.style}>
        <TouchableWithoutFeedback onLongPress ={()=>this.deleteImage()} onPress={()=>this.uploadImage()}>
        {
          (this.state.cover&&this.state.cover.length>0)?(
            <Image source={{uri:this.state.cover}} style={{width:this.props.size.width,height:this.props.size.height}}/>
          ):(
            <Image source={require('../image/default.png')} style={{width:this.props.size.width,height:this.props.size.height}}/>
          )
        }
        </TouchableWithoutFeedback>
        {
          this.state.isUploading?(
            <View style={{paddingTop:10}}><Progress.Bar progress={this.state.progress} width={this.props.size.width} /></View>
          ):(null)
        }
        <ActionSheet
          ref={(o) => this.ActionSheet = o}
          title={trans(LABEL_CHOOSE_IMAGE_TYPE)}
          options={ACTION_BUTTON}
          cancelButtonIndex={0}
          destructiveButtonIndex={1}
          onPress={(i)=>this.onChooseUploadImage(i)}
        />
      </View>
    );
  }
}
