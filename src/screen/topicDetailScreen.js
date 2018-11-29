/**
*话题详情页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,ListView,ScrollView,DeviceEventEmitter
} from 'react-native';
import {Tabs,Tab} from 'react-native-elements';

import NormalListScreen from './normalListScreen';
import TopicPane from '../component/topicPane';
import ReplyPane from '../component/replyPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import forumDao from '../model/forumDao';
import accountDao from '../model/accountDao';
import Filter from '../util/filter';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const LABEL_EDIT='edit';
const LABEL_REPLY='reply';

export default class TopicDetailScreen extends NormalListScreen {
  topicDao=null;

  constructor(props) {
    super(props);
    let _this=this;
    this.topicDao=forumDao.getTopicDao(props.forumId);
    this.state={
      item:this.topicDao.getItem(props.topicId)
    };
  }

  /**
  *当此组件中显示完成后，注册一个changeTopic事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeTopic',(data)=>this.changeTopic(data)); //注册一个changeTopic消息，触发该消息时调用更新广告
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeTopic(data){
    if(data.forumId==this.props.forumId && data.topicId==this.props.topicId){
      this.setState(this.state);
    }
  }

  editTopic(){
    this.openScreen('TopicEditScreen',{
      forumId:this.props.forumId,
      topicId:this.props.topicId
    });
  }

  reply(){
    this.openScreen('ReplyEditScreen',{
      forumId:this.props.forumId,
      topicId:this.props.topicId
    });
  }


  render() {
    return (
      <View style={MainStyle.screen}>
        <View style={{flexDirection:'row'}}>
          {
            this.state.item.userId==accountDao.userInfo.rid?(
            <TouchableOpacity onPress={()=>this.editTopic()}><Text style={MainStyle.link}>{trans(LABEL_EDIT)}</Text></TouchableOpacity>
            ):(null)
          }
          <TouchableOpacity onPress={()=>this.reply()}><Text style={MainStyle.link}>{trans(LABEL_REPLY)}</Text></TouchableOpacity>
        </View>
        <TopicPane forumId={this.props.forumId} item={this.state.item} screen={this}>
        </TopicPane>
      </View>
    );
  }
}
