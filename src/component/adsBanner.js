/**
 *APP上的广告组件, 该组件有两个属性
 *name：字符串，广告名称，通过名称获取广告数据
 *startRefresh：是否开始启动数据的自动更新,一般只有主页的广告位需要启动
 *size: {width:20,height:10} 指定图片高度和宽度
 */
import React, { Component } from 'react';
import {
    Image,View,Dimensions,DeviceEventEmitter,Text,TouchableWithoutFeedback
} from 'react-native';
import Carousel from 'react-native-looped-carousel';

import {isString} from '../util/tools';
import adsDao from '../model/adsDao';
import AppConf from '../comm/appConf';
import UnitBar from './unitBar';
import {toast} from '../util/tools';

const windowSize = Dimensions.get('window');

export default class AdsBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            size: {
                width: windowSize.width,
                height: (windowSize.width * this.props.size.height / this.props.size.width)
            }, //根据窗口的尺寸，确定广告条的尺寸
            adsList: AppConf.APPLICATION_ADS_DATA[this.props.name] //获取默认广告数据
        }
        if (adsDao.adsData[this.props.name]) {  //如果adsDao中有该广告的信息，则替换state中的数据
            this.state.adsList = adsDao.adsData[this.props.name];
        }
    }

    /**
     *当此组件中显示完成后，注册一个changeAdsBanner事件侦听，当广告数据产生变化时，更新广告显示
     */
    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener('changeAdsBanner', (data)=>this.changeAdsBanner(data)); //注册一个changeAdsBanner消息，触发该消息时调用更新广告
        if (this.props.startRefresh) {
            adsDao.startRefresh(this.props.delay); //让adsDao自动更新广告
        }
    }

    /**
     *组件删除后，一并删除事件侦听
     */
    componentWillUnmount() {
        this.subscription.remove(); //页面销毁时注销消息事件
    }

    /**
     *当广告数据变化后，重新绘制页面
     */
    changeAdsBanner(data) {
        if (adsDao.adsData[this.props.name]) {
            if (this.state.adsList != adsDao.adsData[this.props.name]) { //判断是否有更新
                this.state.adsList = adsDao.adsData[this.props.name];
                this.setState(this.state);
            }
        }
    }

    /**
     *当屏幕尺寸变化时，重新绘制广告
     */
    onLayoutDidChange(e) {
        const layout = e.nativeEvent.layout;
        this.state.size = {width: layout.width, height: layout.width * this.props.size.height / this.props.size.width};
        this.setState(this.state);
    }

    subComponentOnPress() {
        if (this.props.onSubComponentPress) {   // 在设置了回调函数的情况下
            this.props.onSubComponentPress();
        }
    }

    render() {
        return (
            <View style={this.state.size} onLayout={(e)=>this.onLayoutDidChange(e)}>
                <Carousel style={[this.state.size,{position:'absolute',left:0,top:0}]} autoplay>
                    <View>
                        {this.state.adsList.map((item, i)=>this.renderItem(item, i))}
                    </View>
                </Carousel>
                <UnitBar style={{position:'absolute',left:0,top:0}} onPress={()=>this.subComponentOnPress()}/>
            </View>
        );
    }

    /**
     *呈现每一张图片
     */
    renderItem(item, i) {
        var convertedImage = item.img;
        if (isString(convertedImage)) {
            convertedImage = {uri: convertedImage};
        }
        return (
            <Image style={this.state.size} key={i} source={convertedImage}></Image>
        );
    }
}
