/**
*创建访客密码页面
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
import {toast,toastX,cloneArray} from '../util/tools';
import Format from '../util/format';
import accountDao from '../model/accountDao';
import forumDao from '../model/forumDao';

const LABEL_INPUT_TITLE='input title';
const LABEL_INPUT_CONTENT='input content';
const LABEL_CONFIRM='confirm';
const LABEL_CANCEL='cancel';

export default class TopicEditScreen extends NormalScreen {
  topicDao=null;

  constructor(props) {
    super(props);
    this.topicDao=forumDao.getTopicDao(props.forumId);
    let item=props.topicId?this.topicDao.getItem(props.topicId):null;
    this.state={
      topic:{
        rid:(item?item.rid:0),
        title:(item?item.title:""),
        remark:(item?item.remark:""),
        topicImages:(item?cloneArray(item.topicImages):[]),
      }
    }
  }

  /**
  *保存一个话题
  */
  saveTopic(){
    let _this=this;
    if(_this.state.topic.title.length==0){
        _this.openInfoDialog(null,trans(LABEL_INPUT_TITLE));
        return;
    }

    if(_this.state.topic.remark.length==0){
        _this.openInfoDialog(null,trans(LABEL_INPUT_CONTENT));
        return;
    }
    this.topicDao.save(this.state.topic,function(result){
      if (result.code == 0) {
        toastX('save success');
        _this.back();
      }
    });
  }

  onTitleChange(text){
    this.state.topic.title=text;
    this.setState(this.state);
  }

  onRemarkChange(text){
    this.state.topic.remark=text;
    this.setState(this.state);
  }

  onImageChange(topicImages){
    this.state.topic.topicImages=topicImages;
    this.state(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <TextInput style={MainStyle.textInput} maxLength={100} placeholder={trans(LABEL_INPUT_TITLE)} style={MainStyle.textInput} value={this.state.topic.title} onChangeText={(text)=>this.onTitleChange(text)}/>
        <TextInput style={MainStyle.textInput} maxLength={1000} placeholder={trans(LABEL_INPUT_CONTENT)} multiline={true} numberOfLines={6} style={MainStyle.textInput} value={this.state.topic.remark} onChangeText={(text)=>this.onRemarkChange(text)}/>
        <ImageControl images={this.state.topic.topicImages} onChange={(images)=>this.onImageChange(images)} style={{padding:20}}></ImageControl>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans(LABEL_CANCEL)}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.saveTopic()} title={trans(LABEL_CONFIRM)}/></View>
        </View>
      </View>
    );
  }
}
