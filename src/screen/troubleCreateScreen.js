/**
*创建维修申报页面
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput
} from 'react-native';
import {FormInput,Button,FormLabel } from 'react-native-elements';

import ImageControl from '../component/imageControl';
import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import Format from '../util/format';
import accountDao from '../model/accountDao';
import troubleDao from '../model/troubleDao';

const LABEL_INPUT_TITLE='input title';
const LABEL_INPUT_CONTENT='input content';
const LABEL_CONFIRM='confirm';
const LABEL_CANCEL='cancel';

export default class TroubleCreateScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      trouble:{
        troubleTitle:"",
        remark:"",
        images:[]
      }
    }
  }

  /**
  *保存一个投诉建议
  */
  saveTrouble(){
    let _this=this;
    if(_this.state.trouble.troubleTitle.length==0){
        _this.openInfoDialog(null,trans(LABEL_INPUT_TITLE));
        return;
    }

    if(_this.state.trouble.remark.length==0){
        _this.openInfoDialog(null,trans(LABEL_INPUT_CONTENT));
        return;
    }
    troubleDao.save(this.state.trouble,function(result){
      if (result.code == 0) {
          if(_this.props.afterCreated){
            _this.props.afterCreated();
          };
          _this.back();
      }
    });
  }

  onTitleChange(text){
    this.state.trouble.troubleTitle=text;
    this.setState(this.state);
  }

  onRemarkChange(text){
    this.state.trouble.remark=text;
    this.setState(this.state);
  }

  onImageChange(images){
    this.state.trouble.images=images;
    this.state(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <TextInput style={MainStyle.textInput} maxLength={100} placeholder={trans(LABEL_INPUT_TITLE)} style={MainStyle.textInput} onChangeText={(text)=>this.onTitleChange(text)}/>
        <TextInput style={MainStyle.textInput} maxLength={1000} placeholder={trans(LABEL_INPUT_CONTENT)} multiline={true} numberOfLines={6} style={MainStyle.textInput} onChangeText={(text)=>this.onRemarkChange(text)}/>
        <ImageControl images={this.state.trouble.images} onChange={(images)=>this.onImageChange(images)} style={{padding:20}}></ImageControl>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans(LABEL_CANCEL)}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.saveTrouble()} title={trans(LABEL_CONFIRM)}/></View>
        </View>
      </View>
    );
  }
}
