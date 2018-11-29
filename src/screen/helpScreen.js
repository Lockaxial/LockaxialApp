/**
*帮助页面
*/
import React, { Component } from 'react';
import {
  ScrollView,Image,View,Text
} from 'react-native';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';

const QUESTION='question';

export default class HelpScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      questions:['Q1']
    }
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <ScrollView style={{marginTop:16,marginRight:10,marginBottom:16}}>
          {
            this.state.questions.map((item,i)=>
              <View key={i}>
                <Text style={MainStyle.label}>{trans(QUESTION)+(i+1)+': '+trans(item)}</Text>
                <Text style={MainStyle.label}>{trans(item+'_A')}</Text>
              </View>
            )
          }
        </ScrollView>
      </View>
    );
  }
}
