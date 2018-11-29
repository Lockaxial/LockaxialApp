/**
*房屋申请-选择房屋
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

export default class UnitChooseScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={list:ds.cloneWithRows(unitApplicationDao.unitList)};
  }

  /**
  *选择房屋后，将房屋数据传入Dao
  */
  changeUnit(index){
    unitApplicationDao.changeUnit(index);
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
                    <ListItem onPress={()=>this.changeUnit(rowID)} key={rowID}
                      title={item.unitName}
                      rightIcon={{name:(item.rid==unitApplicationDao.choosedData.unitId?'done':'navigate-next')}}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
