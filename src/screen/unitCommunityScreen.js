/**
*房屋申请-选择社区
*/
import React, { Component } from 'react';
import {
  View,Text,ListView
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toast} from '../util/tools';
import accountDao from '../model/accountDao';
import unitApplicationDao from '../model/unitApplicationDao';
import MainStyle from '../style/mainStyle';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源

export default class UnitCommunityScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={list:ds.cloneWithRows(unitApplicationDao.communityList)};
  }

  /**
  *选择社区后，将社区数据传入Dao
  */
  changeCommunity(index){
    unitApplicationDao.changeCommunity(index);
    this.back();
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <List containerStyle={MainStyle.list}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            renderRow={(item, sectionID, rowID) =>
                    <ListItem onPress={()=>this.changeCommunity(rowID)} key={rowID}
                      title={item.communityName}
                      rightIcon={{name:(item.rid==unitApplicationDao.choosedData.communityId?'done':'navigate-next')}}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
