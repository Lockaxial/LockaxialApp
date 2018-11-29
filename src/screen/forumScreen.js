/**
*社区论坛子页面
*/
import React, { Component } from 'react';
import {
  Text,View,StyleSheet,ScrollView,TouchableOpacity,DeviceEventEmitter
} from 'react-native';

import NormalScreen from './normalScreen';
import TopicMain from './topicMain';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import forumDao from '../model/forumDao';
import accountDao from '../model/accountDao';
import TabBar from '../component/tabBar';
import InformPane from '../component/informPane';

export default class ForumScreen extends NormalScreen {
  constructor(props) {
    super(props);
      this.state={
        communityId:accountDao.userInfo.communityId,
        initialized:false,
        list:[],
        currentForumId:0
      }
      forumDao.clear();
      let _this=this;
      forumDao.init(function(result){
        _this.changeList();
      });
  }

  /**
  *当此组件中显示完成后，注册一个changeUserAccount事件侦听，当公告信息产生变化时，更新显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeUserAccount',(data)=>this.changeUserAccount(data)); //注册一个changeUserAccount消息，触发该消息时调用更新公告栏
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeUserAccount(){
    if(this.state.communityId!=accountDao.userInfo.communityId){
      this.state.communityId=accountDao.userInfo.communityId;
      this.refresh();
    }
  }

  refresh(){
    let _this=this;
    forumDao.clear();
    if(accountDao.userInfo.communityId==0){
      this.state.initialized=false;
      this.state.list=[];
      this.setState(this.state);
    }else{
      forumDao.init(function(result){
        if(result){
          _this.changeList();
        }
      });
    }
  }

  /**
  *更新论坛列表数据
  */
  changeList(){
    this.state.list=forumDao.list;
    this.state.initialized=true;
    if(this.state.list.length>0){
      this.state.currentForumId=this.state.list[0].rid;
    }
    this.setState(this.state);
  }

  onChangeTab(index){
    if(this.state.currentForumId!=this.state.list[index].rid){
      this.state.currentForumId=this.state.list[index].rid;
      this.setState(this.state);
      DeviceEventEmitter.emit('changeTopicList',{forumId:this.state.currentForumId});
    }
  }

  render() {
    if(accountDao.userInfo.communityId==0){
      return(
        <InformPane title={trans('no community')}/>
      );
    }else if(!this.state.initialized){
      return(
        <InformPane title={trans('loading')}/>
      );
    }else if(this.state.list.length==0){
      return(
        <InformPane title={trans('no forum')}/>
      );
    }else{
      let tabTitles=[];
      for(let i=0;i<this.state.list.length;i++){
        tabTitles.push(this.state.list[i].forumName);
      }
      return (
        <View style={MainStyle.screen}>
          <TabBar items={tabTitles}
            callback={(index)=>this.onChangeTab(index)}
            backgroundColor={MainStyle.tabBar.backgroundColor}
            textColor={MainStyle.tabBar.textColor}
            selectedTextColor={MainStyle.tabBar.selectedTextColor}
            itemSpacing={MainStyle.tabBar.itemSpacing}
            height={MainStyle.tabBar.height}
          />
          <TopicMain forumId={this.state.currentForumId} navigator={this.props.navigator}/>
        </View>
      );
    }
  }
}
