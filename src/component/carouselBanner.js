/**
*APP上的轮播图组件, 该组件有两个属性
*images：图片列表
*startRefresh：是否开始启动数据的自动更新,一般只有主页的广告位需要启动
*size: {width:20,height:10} 指定图片高度和宽度
*/
import React, { Component } from 'react';
import {
  Image,View,Dimensions,DeviceEventEmitter,Text
} from 'react-native';
import Carousel from 'react-native-looped-carousel';

import {isString} from '../util/tools';

const windowSize = Dimensions.get('window');

export default class CarouselBanner extends Component {
  constructor(props) {
    super(props);
    this.state={
      size:{ width:windowSize.width,height:(windowSize.width*this.props.size.height/this.props.size.width) } //根据窗口的尺寸，确定广告条的尺寸
    }
  }

  /**
  *当屏幕尺寸变化时，重新绘制轮播
  */
  onLayoutDidChange(e){
    const layout = e.nativeEvent.layout;
    this.state.size={ width: layout.width, height: layout.width*this.props.size.height/this.props.size.width };
    this.setState(this.state);
  }

  render() {
    return (
      <View style={this.state.size} onLayout={(e)=>this.onLayoutDidChange(e)}>
        <Carousel style={[this.state.size,{position:'absolute',left:0,top:0}]} autoplay>
          {this.props.images.map((item,i)=>this.renderItem(item,i))}
        </Carousel>
      </View>
    );
  }

  /**
  *呈现每一张图片
  */
  renderItem(item,i){
    var convertedImage=item;
    if(isString(convertedImage)){
      convertedImage={uri:convertedImage};
    }
    return(
      <Image style={this.state.size} key={i} source={convertedImage}>
      </Image>
    );
  }
}
