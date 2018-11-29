/**
*论坛话题组件
*/
import React, { Component } from 'react';
import {
  View,Text,Image,TouchableWithoutFeedback,TouchableOpacity,DeviceEventEmitter
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';

import ImageWidget from './imageWidget';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import Filter from '../util/filter';
import {toastX} from '../util/tools';
import forumDao from '../model/forumDao';

export default class TopicPane extends Component {
  constructor(props) {
    super(props);
    let topicDao=forumDao.getTopicDao(props.forumId);
    this.state={
    }
  }

  /**
  *当此组件中显示完成后，注册一个changeTopic事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeTopic',(data)=>this.changeTopic(data)); //注册一个changeTopic消息，触发该消息时调用更新广告
    this.subscription = DeviceEventEmitter.addListener('changeTopicList',(data)=>this.changeTopicList(data)); //注册一个changeTopic消息，触发该消息时调用更新广告
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  /**
  *当话题变化后，重新绘制页面
  */
  changeTopic(data){
    if(data.forumId==this.props.forumId && data.topicId==this.props.item.rid){
      this.setState(this.state);
    }
  }
  changeTopicList(data){
    if(data.forumId==this.props.forumId){
      this.setState(this.state);
    }
  }

  switchTopicLikes(){
    let _this=this;
    let topicDao=forumDao.getTopicDao(this.props.forumId);
    topicDao.switchTopicLikes(this.props.item.rid,function(result){
      if(result.code==0){
        //_this.setState(_this.state);
      }else{
        toastX('system error');
      }
    });
  }

  renderHeader(){
    return(
      <View style={MainStyle.paneHeader}>
        {
          this.props.item.headimgurl?(
            <Image source={{uri:this.props.item.headimgurl}} style={{width:35,height:35,borderRadius:20}}/>
          ):(
            <Image source={require('../image/default.png')} style={{width:35,height:35,borderRadius:20}}/>
          )
        }
        <View style={{marginLeft:10}}>
          <Text style={{color:'#f75b47'}}>{this.props.item.username}</Text>
          <Text style={{fontSize:12}}>{Filter.datetimeFilter(this.props.item.creDate)}</Text>
        </View>
      </View>
    );
  }

  renderContent(){
    return(
      <View style={MainStyle.paneContent}>
        <Text>{this.props.item.title}</Text>
        <Text>{this.props.type=='list'?this.props.item.desc:this.props.item.remark}</Text>
        <ImageWidget images={this.props.item.topicImages} screen={this.props.screen}></ImageWidget>
      </View>
    );
  }

  openReplyScreen(){
    this.props.screen.openScreen('ReplyScreen',{
      forumId:this.props.forumId,
      topicId:this.props.item.rid
    });
  }

  renderFooter(){
    return(
      <View style={MainStyle.paneFooter}>
        <TouchableOpacity style={{flex:1}} onPress={()=>this.openReplyScreen()}>
          <View style={{flex:1,flexDirection:'row',justifyContent:'center',borderRightColor:'#eeeeee',borderRightWidth:1}}>
            <Icon name="pinglun" type="simple-line-icon" size={15} color="#999999"/>
            <Text style={{paddingLeft:10,color:'#999999',fontSize:12}}>{this.props.item.replyNum}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{flex:1}} onPress={()=>this.switchTopicLikes()}>
          <View style={{flexDirection:'row',justifyContent:'center'}}>
            <Icon name="iconfontzhizuobiaozhun44" type="simple-line-icon" size={15} color={this.props.item.likesId>0?'#f75b47':'#999999'}/>
            <Text style={{paddingLeft:10,fontSize:12,color:(this.props.item.likesId>0?'#f75b47':'#999999')}}>{this.props.item.likesNum}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={{marginBottom:(this.props.type=='list'?16:0),backgroundColor:'white'}}>
        {
          this.props.type=='list'?(
            <TouchableWithoutFeedback onPress={()=>this.props.onPress()}>
              <View>
              {
                this.renderHeader()
              }
              {
                this.renderContent()
              }
              </View>
            </TouchableWithoutFeedback>
          ):(
            <View>
              {
                this.renderHeader()
              }
              {
                this.renderContent()
              }
            </View>
          )
        }
        {
          this.renderFooter()
        }
      </View>
    );
  }
}
