/**
*物业公告详情页面
*/
import React, { Component } from 'react';
import {
  View,Text
} from 'react-native';
import {Card} from 'react-native-elements';

import NormalScreen from './normalScreen';
import ContentPane from '../component/contentPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import noticeDao from '../model/noticeDao';
import Filter from '../util/filter';

export default class NoticeDetailScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      item:noticeDao.item
    };
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <ContentPane title={this.state.item.noticeTitle} datetime={this.state.item.creDate} content={this.state.item.remark} screen={this}/>
      </View>
    );
  }
}
