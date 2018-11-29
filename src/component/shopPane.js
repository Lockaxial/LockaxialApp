/**
*商铺组件
*/
import React, { Component } from 'react';
import {
  View,Text,Image,TouchableWithoutFeedback,TouchableOpacity,DeviceEventEmitter,Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';
import Communications from 'react-native-communications';

import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import Filter from '../util/filter';
import {toastX,toast} from '../util/tools';
import businessDao from '../model/businessDao';

const windowSize = Dimensions.get('window');
const marginSize=8;
const imageWidth=windowSize.width*1/4;

export default class ShopPane extends Component {
  shopDao=null;

  constructor(props) {
    super(props);
    this.shopDao=businessDao.getShopDao(props.categoryId);
    this.state={
      size:{ width:imageWidth,height:(imageWidth*this.props.size.height/this.props.size.width) }, //根据窗口的尺寸，确定图片的尺寸
    }
  }

  /**
  *当此组件中显示完成后，注册一个changeShop事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeShop',(data)=>this.changeShop(data)); //注册一个changeShop消息，触发该消息时调用更新广告
    this.subscription = DeviceEventEmitter.addListener('changeShopList',(data)=>this.changeShopList(data)); //注册一个changeShop消息，触发该消息时调用更新广告
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
  changeShop(data){
    if(data.categoryId==this.props.categoryId && data.shopId==this.props.item.rid){
      this.setState(this.state);
    }
  }

  changeShopList(data){
    if(data.categoryId==this.props.categoryId){
      this.setState(this.state);
    }
  }

  openShopDetail(){
    if(this.props.type=='list'){
      this.props.screen.openScreen('ShopDetailScreen',{
        categoryId:this.props.categoryId,
        shopId:this.props.item.rid
      });
    }
  }

  openPromotionDetail(){
    this.props.screen.openScreen('PromotionDetailScreen',{
      promotionId:this.props.item.promotionId,
    });
  }

  call(item){
    Communications.phonecall(item.tel,true);
  }

  location(item){
    this.props.screen.openScreen('MapPane',{
      lat:item.lat,
      lng:item.lng
    });
  }

  renderContent(){
    return (
      <View style={{flexDirection:'row',alignItems:'flex-start',backgroundColor:'#FFFFFF',borderBottomColor:'#eeeeee',borderBottomWidth:1,paddingTop:marginSize,paddingLeft:marginSize,paddingRight:marginSize}}>
        <View style={{flex:2,margin:5}}>
            <Image source={{uri:this.props.item.shopImage}} style={{width:this.state.size.width, height: this.state.size.height}}/>
        </View>
        <View style={{flex:5,paddingBottom:marginSize}}>
          <Text>{this.props.item.shopName}</Text>
          <View style={{flexDirection:'row',paddingTop:marginSize,alignItems:'flex-start'}}>
            <View><Text style={{paddingLeft:0,fontSize:12,color:'#999999'}}>{trans('tel')+':'}</Text></View>
            <TouchableOpacity onPress={()=>this.call(this.props.item)}><Text style={{paddingLeft:0,fontSize:12,color:'#999999'}}>{this.props.item.tel}</Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row',paddingTop:marginSize,alignItems:'flex-start'}}>
            <View><Text style={{paddingLeft:0,fontSize:12,color:'#999999'}}>{trans('address')+':'}</Text></View>
            <TouchableOpacity onPress={()=>this.location(this.props.item)}>
              <Text style={{paddingLeft:0,fontSize:12,color:'#999999'}}>{this.props.item.address}</Text>
            </TouchableOpacity>
          </View>
          {
            this.props.item.promotionId>0?(
              <View style={{flexDirection:'row',paddingTop:marginSize,alignItems:'flex-start'}}>
                <View><Icon name='cuxiaohuodong' size={18} color='#ff4343'/></View>
                <TouchableOpacity onPress={()=>this.openPromotionDetail()}>
                  <Text style={{paddingLeft:0,fontSize:12,color:'#ff4343'}}>{this.props.item.title}</Text>
                </TouchableOpacity>
              </View>
            ):(
              null
            )
          }
        </View>
      </View>
    );
  }

  render() {
    if(this.props.type=='list'){
      return (
        <TouchableOpacity onPress={()=>this.openShopDetail()}>
          {
            this.renderContent()
          }
        </TouchableOpacity>
      );
    }else{
      return this.renderContent();
    }
  }
}
