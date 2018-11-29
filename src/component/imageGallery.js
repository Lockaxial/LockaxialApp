/**
*APP上的图片列表控件，点击图片可以打开大图显示
*/
import React, { Component } from 'react';
import {
  View
} from 'react-native';
import Gallery from 'react-native-gallery';
import NormalScreen from '../screen/normalScreen';

export default class ImageGallery extends NormalScreen {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Gallery
        style={{flex: 1, backgroundColor: 'black'}}
        images={this.props.images}
        initialPage={this.props.initialPage}
      />
    );
  }
}
