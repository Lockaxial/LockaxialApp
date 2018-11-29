/**
*论坛回复组件
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

export default class ReplyPane extends Component {
  replyDao=null;

  constructor(props) {
    super(props);
    this.replyDao=forumDao.getTopicDao(props.forumId).replyDao;
    this.state={
    }
  }

  /**
  *当此组件中显示完成后，注册一个changeTopicReply事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeTopicReply',(data)=>this.changeTopicReply(data)); //注册一个changeTopicReply消息，触发该消息时调用更新广告
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
  changeTopicReply(data){
    if(data.replyId==this.props.item.rid){
      this.setState(this.state);
    }
  }

  switchReplyLikes(){
    let _this=this;
    this.replyDao.switchReplyLikes(this.props.item.rid,function(result){
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
        <View style={{flex:6,flexDirection:'row'}}>
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
        <TouchableOpacity style={{flex:1}} onPress={()=>this.switchReplyLikes()}>
          <View style={{flexDirection:'row'}}>
            <Icon name="iconfontzhizuobiaozhun44" size={15} color={this.props.item.likesId>0?'#f75b47':'#999999'}/>
            <Text style={{paddingLeft:10,fontSize:12,color:(this.props.item.likesId>0?'#f75b47':'#999999')}}>{this.props.item.likesNum}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderContent(){
    return(
      <View style={MainStyle.paneContent}>
        <Text>{this.props.item.reply}</Text>
        <ImageWidget images={this.props.item.replyImages} screen={this.props.screen}></ImageWidget>
      </View>
    );
  }

  render() {
    return (
      <View style={{backgroundColor:'white'}}>
        {
          this.renderHeader()
        }
        {
          this.renderContent()
        }
      </View>
    );
  }
}
