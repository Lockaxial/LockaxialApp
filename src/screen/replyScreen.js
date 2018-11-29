/**
*话题详情页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,ListView,ScrollView,DeviceEventEmitter
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';

import NormalListScreen from './normalListScreen';
import TopicPane from '../component/topicPane';
import ReplyPane from '../component/replyPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import forumDao from '../model/forumDao';
import accountDao from '../model/accountDao';
import ReplyDao from '../model/replyDao';
import Filter from '../util/filter';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const LABEL_REPLY='reply';

export default class TopicDetailScreen extends NormalListScreen {
  topicDao=null;
  replyDao=null;

  constructor(props) {
    super(props);
    let _this=this;
    this.topicDao=forumDao.getTopicDao(props.forumId);
    this.replyDao=this.topicDao.getReplyDao(props.topicId);
    this.state={
      list:ds.cloneWithRows(this.replyDao.list)
    };
    this.replyDao.init(function(result){
      if(result){
        _this.changeList();
      }
    });
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
      this.changeList();
    }
  }

  /**
  *更新话题回复列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(this.replyDao.list);
    this.setState(this.state);
  }

  reply(){
    this.openScreen('ReplyEditScreen',{
      forumId:this.props.forumId,
      topicId:this.props.topicId
    });
  }

  /**
  *相应列表更新后的事件
  */
  onPageRefresh(){
    if(this.beforeListRefresh()){
      return;
    }
    var _this=this;
    this.replyDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <TouchableOpacity onPress={()=>this.reply()}><View style={{flexDirection:'row',marginLeft:16,alignItems:'center'}}><Icon name='xinjian' size={18} color='#007aff'/><Text style={{paddingTop:10,paddingLeft:8,paddingBottom:10,paddingRight:10,color:'#007aff'}}>{trans(LABEL_REPLY)}</Text></View></TouchableOpacity>
        <ListView
          enableEmptySections
          dataSource={this.state.list}
          onEndReached={()=>this.onPageRefresh()}
          onEndReachedThreshold={10}
          renderFooter={()=>this.renderRooter()}
          renderRow={(item, sectionID, rowID) =>
            <ReplyPane key={rowID} forumId={this.props.forumId} topicId={this.props.topicId} item={item} screen={this}>
            </ReplyPane>
          }>
        </ListView>
      </View>
    );
  }
}
