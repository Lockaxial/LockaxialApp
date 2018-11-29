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
import trans from '../i18/trans';
import Upload from '../util/upload';
import ajax from '../util/ajax';

const LABEL_CHOOSE_IMAGE_TYPE='choose image type';
const LABEL_TAKE_PICTURE='take picture';
const LABEL_PICK_LIB='pick from lib';
const ACTION_BUTTON=[trans('cancel'),trans(LABEL_TAKE_PICTURE),trans(LABEL_PICK_LIB)];

export default class ImageControl extends Component {
  constructor(props) {
    super(props);
    this.state={
      images:this.props.images,
      index:0,
      total:0,
      progress:0,
      isUploading:false,
      changeIndex:-1
    }
  }

  deleteImage(index){
    this.state.images.splice(index,1);
    this.setState(this.state);
  }

  replaceImage(index){
    this.state.changeIndex=index;
    this.uploadImage();
  }

  addImage(){
    this.state.changeIndex=-1;
    this.uploadImage();
  }

  uploadImage(index){
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
    if(this.props.cover){
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
    }else{
      if(isTakePhoto){
        ImagePicker.openCamera({
          cropping: false
        }).then(image => {
          _this.upload([image]);
        });
      }else{
        ImagePicker.openPicker({
          cropping: false,
          multiple: true
        }).then(images => {
          _this.upload(images);
        });
      }
    }
  }

  onUploadStart(){
    this.state.isUploading=true;
    this.setState(this.state);
  }

  onUploadAllComplete(){
    this.state.isUploading=false;
    this.state.index=0;
    this.state.total=0;
    this.state.progress=0;
    this.setState(this.state);
  }

  onUploadProgress(index,evt){
    this.state.index=index;
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
    if(this.state.changeIndex>=0){
      this.state.images[this.state.changeIndex]=imageUrl;
    }else{
      this.state.images.push(imageUrl);
    }
    this.state.index=index;
    this.state.progress=0;
    this.setState(this.state);
  }

  upload(images){
    let _this=this;
    if(images&&images.length>0){
      _this.state.total=images.length;
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
        <View style={{margin:0,flexDirection:'row',flexWrap:'wrap'}}>
          {
            this.state.images.map((item,i)=>
            <TouchableWithoutFeedback key={i} onLongPress ={()=>this.deleteImage(i)} onPress={()=>this.replaceImage(i)}>
                <Image source={{uri:item}} style={{marginRight:5,marginTop:5,width:90,height:90}}/>
            </TouchableWithoutFeedback>
            )
          }
          <TouchableWithoutFeedback key={this.state.images.length} onPress={()=>this.addImage()}>
              <Image source={require('../image/upload.png')} style={{marginRight:5,marginTop:5,width:90,height:90,backgroundColor:'#dedede'}}/>
          </TouchableWithoutFeedback>

        </View>
        {
          this.state.isUploading?(
            <View style={{paddingTop:10}}><Progress.Bar progress={this.state.progress} width={90} /><Text>{this.state.index}/{this.state.total}</Text></View>
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
