/**
*商品组件
*/
import React, { Component } from 'react';
import {
  View,Text,Image,TouchableWithoutFeedback,TouchableOpacity,DeviceEventEmitter,Dimensions
} from 'react-native';
import { Icon } from 'react-native-elements';

import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import Filter from '../util/filter';
import {toastX,toast} from '../util/tools';

const windowSize = Dimensions.get('window');
const marginSize=8;
const imageWidth=windowSize.width*1/4;

export default class GoodsPane extends Component {
  constructor(props) {
    super(props);
    this.state={
      size:{ width:imageWidth,height:(imageWidth*this.props.size.height/this.props.size.width) }, //根据窗口的尺寸，确定图片的尺寸
    }
  }

  openGoodsDetail(){
    if(this.props.type=='list'){
      this.props.screen.openScreen('GoodsDetailScreen',{
        item:this.props.item
      });
    }
  }

  renderContent(){
    return (
      <View style={{flexDirection:'row',alignItems:'flex-start',backgroundColor:'#FFFFFF',borderBottomColor:'#eeeeee',borderBottomWidth:1,paddingTop:marginSize,paddingLeft:marginSize,paddingRight:marginSize}}>
        <View style={{flex:2,margin:5}}>
            <Image source={{uri:this.props.item.cover}} style={{width:this.state.size.width, height: this.state.size.height}}/>
        </View>
        <View style={{flex:5,paddingBottom:marginSize}}>
          <Text>{this.props.item.name}</Text>
          <Text style={{fontSize:12,color:'#999999'}}>{this.props.item.title}</Text>
          <View style={{flexDirection:'row',paddingTop:marginSize,alignItems:'flex-end'}}>
            <Text style={{fontSize:16,color:'#ff4343'}}>{'¥'+this.props.item.price}</Text>
            <Text style={{paddingLeft:20,fontSize:12,color:'#999999',textDecorationLine:'line-through'}}>{'¥'+this.props.item.originPrice}</Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    if(this.props.type=='list'){
      return (
        <TouchableOpacity onPress={()=>this.openGoodsDetail()}>
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
