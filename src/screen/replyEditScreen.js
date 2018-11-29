/**
*话题回复页面
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput
} from 'react-native';
import {Button} from 'react-native-elements';

import ImageControl from '../component/imageControl';
import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import Format from '../util/format';
import accountDao from '../model/accountDao';
import forumDao from '../model/forumDao';

const LABEL_INPUT_CONTENT='input content';
const LABEL_CONFIRM='confirm';
const LABEL_CANCEL='cancel';

export default class ReplyEditScreen extends NormalScreen {
  topicDao=null;
  replyDao=null;

  constructor(props) {
    super(props);
    this.topicDao=forumDao.getTopicDao(props.forumId);
    this.replyDao=this.topicDao.getReplyDao(props.topicId);
    this.state={
      reply:{
        reply:"",
        replyImages:[]
      }
    }
  }

  /**
  *保存一个话题
  */
  saveReply(){
    let _this=this;
    if(_this.state.reply.reply.length==0){
        _this.openInfoDialog(null,trans(LABEL_INPUT_CONTENT));
        return;
    }
    this.replyDao.save(this.state.reply,function(result){
      if (result.code == 0) {
        toastX('save success');
        _this.back();
      }
    });
  }

  onReplyChange(text){
    this.state.reply.reply=text;
    this.setState(this.state);
  }

  onImageChange(replyImages){
    this.state.reply.replyImages=replyImages;
    this.state(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <TextInput style={MainStyle.textInput} maxLength={1000} placeholder={trans(LABEL_INPUT_CONTENT)} multiline={true} numberOfLines={6} style={MainStyle.textInput} value={this.state.reply.reply} onChangeText={(text)=>this.onReplyChange(text)}/>
        <ImageControl images={this.state.reply.replyImages} onChange={(images)=>this.onImageChange(images)} style={{padding:20}}></ImageControl>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans(LABEL_CANCEL)}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.saveReply()} title={trans(LABEL_CONFIRM)}/></View>
        </View>
      </View>
    );
  }
}
