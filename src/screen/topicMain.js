/**
*社区论坛子页面
*/
import React, { Component } from 'react';
import {
  Text,View,StyleSheet,ListView,TouchableOpacity,DeviceEventEmitter
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';

import SubListScreen from './subListScreen';
import TopicPane from '../component/topicPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX,toast,cloneArray} from '../util/tools';
import forumDao from '../model/forumDao';
import accountDao from '../model/accountDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const LABEL_CREATE='create topic';

export default class TopicMain extends SubListScreen {
  topicDao=null;

  constructor(props) {
    super(props);
      this.state={
        forumId:this.props.forumId,
        list:ds.cloneWithRows([])
      }
      let _this=this;
      if(this.state.forumId>0){
        this.topicDao=forumDao.getTopicDao(this.state.forumId);
        this.topicDao.init(function(result){
          if(result){
            _this.changeList();
          }
        });
      }
  }

  /**
  *当此组件中显示完成后，注册一个changeTopicList事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeTopicList',(data)=>this.changeTopicList(data)); //注册一个changeTopicList消息，触发该消息时调用更新广告
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeTopicList(data){
    let _this=this;
    if(data.forumId!=this.state.forumId){
      this.state.forumId=data.forumId;
      this.topicDao=forumDao.getTopicDao(this.state.forumId);
      this.topicDao.init(function(result){
        _this.changeList();
      });
    }else{
      _this.changeList();
    }
  }

  /**
  *更新论坛列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(this.topicDao.list);
    this.setState(this.state);
  }

  /**
  *打开话题详情
  */
  openTopic(topicId){
    this.openScreen('TopicDetailScreen',{
      forumId:this.state.forumId,
      topicId:topicId
    });
  }

  createTopic(){
    this.openScreen('TopicEditScreen',{
      forumId:this.state.forumId
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
    this.topicDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  render() {
    return(
      <View style={{paddingBottom:30}}>
        <TouchableOpacity onPress={()=>this.createTopic()}><View style={{flexDirection:'row',marginLeft:16,alignItems:'center'}}><Icon name='xinjian' size={18} color='#007aff'/><Text style={{paddingTop:10,paddingLeft:8,paddingBottom:10,paddingRight:10,color:'#007aff'}}>{trans(LABEL_CREATE)}</Text></View></TouchableOpacity>
        <ListView
          enableEmptySections
          dataSource={this.state.list}
          onEndReached={()=>this.onPageRefresh()}
          onEndReachedThreshold={10}
          renderFooter={()=>this.renderRooter()}
          renderRow={(item, sectionID, rowID) =>
            <TopicPane type="list" onPress={()=>this.openTopic(item.rid)} key={rowID}
              forumId={this.state.forumId} item={item} screen={this}>
            </TopicPane>
          }>
        </ListView>
      </View>
    );
  }
}
