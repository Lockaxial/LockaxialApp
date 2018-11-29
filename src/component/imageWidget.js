/**
*APP上的图片列表控件，点击图片可以打开大图显示
*/
import React, { Component } from 'react';
import {
  View,Image,TouchableWithoutFeedback,Dimensions
} from 'react-native';

import MainStyle from '../style/mainStyle';

const windowSize = Dimensions.get('window');

export default class ImageWidget extends Component {
  constructor(props) {
    super(props);
  }

  showImage(index){
    this.props.screen.openScreen('ImageGallery',{
      images:this.props.images,
      initialPage:index
    })
  }

  render() {
    let imageSize=this.props.images.length<3?this.props.images.length:3;
    imageSize=windowSize.width/imageSize;
    let imageHeight=imageSize;
    let imageWidth=imageSize;
    if(this.props.images.length==1){
      imageHeight=imageSize/2;
      imageWidth=imageSize*2/3;
    }else if(this.props.images.length==2){
      imageWidth=imageSize-20;
      imageHeight=imageWidth;
    }else{
      imageWidth=imageSize-15;
      imageHeight=imageWidth;
    }

    return (
      <View style={{margin:0,flexDirection:'row',flexWrap:'wrap'}}>
        {
          this.props.images.map((item,i)=>
          <TouchableWithoutFeedback key={i} onPress={()=>this.showImage(i)}>
              <Image source={{uri:item}} style={{marginRight:5,marginTop:5,width:imageWidth,height:imageHeight}}/>
          </TouchableWithoutFeedback>
          )
        }
      </View>
    );
  }
}
