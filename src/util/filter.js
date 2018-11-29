/**
*显示过滤器，根据值过滤成显示内容
*/
import Format from './format';
import trans from '../i18/trans';

export default class Filter{

  /**
  *距离显示过滤
  */
  static distanceFilter(value) {
    if(value){
        var result=parseFloat(value);
        if(result<1){
            result=parseInt(result*1000)+trans('meter');
        }else if(result<10){
            result=parseFloat(result).toFixed(1)+trans('kilometre');
        }else if(result>=10){
            result=parseInt(result)+trans('kilometre');;
        }
    }else{
        var result="";
    }
    return result;
  }

  /**
  *日期时间显示过滤
  */
  static dateFilter(value) {
    if(value instanceof Date){
      value=Format.fromDateToStr(value,'yyyy-MM-dd');
    }else if(value.charAt(value.length-1)=='Z'){
      value=new Date(Date.parse(value));
      value=Format.fromDateToStr(value,'yyyy-MM-dd');
    }
    var nowDate=new Date();
    var yestDate=new Date((nowDate/1000-86400)*1000);
    var nowStr=Format.fromDateToStr(nowDate,'yyyy-MM-dd');
    var yestStr=Format.fromDateToStr(yestDate,'yyyy-MM-dd');
    var result=null;
    if(value==nowStr){
        result=trans('today');
    }else if(value==yestStr){
        result=trans('yesterday');
    }else{
        result=value;
    }
    return result;
  }

  /**
  *日期时间显示过滤
  */
  static datetimeFilter(value) {
    if(value instanceof Date){
      value=Format.fromDateToStr(value,'yyyy-MM-dd hh:mm:ss');
    }else if(value.charAt(value.length-1)=='Z'){
      value=new Date(Date.parse(value));
      value=Format.fromDateToStr(value,'yyyy-MM-dd hh:mm:ss');
    }
    var thisDateStr=value.substring(0,10);
    var thisTimeStr=value.substring(11,16);
    return this.dateFilter(thisDateStr)+' '+thisTimeStr;
  }

    static openTyleFilter(value) {
        if(value == 'M'){
            return trans('call open');
        }else if(value == 'P'){
            return trans('password open');
        }else if(value == 'F'){
            return trans('face open');
        }else if(value == 'A'){
            return trans('app open');
        }else if(value == 'C'){
            return trans('card open');
        }else{
            return trans('no openType');
        }
    }

  /**
  *文件名显示过滤
  */
  static fileNameFilter(value) {
    var newValue = value;
    if(value){
        if(value.length>10){
            newValue = value.substring(0,5)+"...";
        }
    }
    return newValue;
  }


  /**
  *延迟时间显示过滤
  */
  static delayFilter(delayHour) {
    var result="";
    if(delayHour==0){
        result=trans('now');
    }else{
        var hour=parseInt(delayHour);
        if(hour>=24){
            var day=parseInt(hour/24);
            result=day+trans('day')+(hour-day*24)+trans('hour');
        }else if(hour>0){
            result=hour+trans('hour');
        }
        var minute=parseInt((delayHour-hour)*60);
        result=result+minute+trans('minute');
    }
    return result;
  }

  /**
  *百分比显示过滤
  */
  static percentFilter(value) {
    var newValue = parseInt(value*100);
    newValue=newValue.toFixed(0);
    return newValue;
  }

  /**
  *故障手里状态过滤
  */
  static troubleFilter(value) {
    var newValue = "";
    if(value=="N"){
        newValue=trans('new trouble');
    }else if(value=="S"){
        newValue=trans('accept');
    }else if(value=="W"){
        newValue=trans('arranged');
    }else if(value=="D"){
        newValue=trans('done');
    }
    return newValue;
  }

  /**
  *投诉建议状态过滤
  */
  static adviceFilter(value) {
    var newValue = "";
    if(value=="N"){
        newValue=trans('new advice');
    }else if(value=="S"){
        newValue=trans('adopt');
    }else if(value=="W"){
        newValue=trans('done');
    }else if(value=="D"){
        newValue=trans('deleted');
    }
    return newValue;
  }

  /**
  *房屋类型过滤
  */
  static unitTypeFilter(value) {
    var newValue = "";
    if(value=="A"){
        newValue=trans('high rise');
    }else if(value=="B"){
        newValue=trans('multi storey');
    }else if(value=="C"){
        newValue=trans('townhouse');
    }else if(value=="D"){
        newValue=trans('villa');
    }else if(value=="S"){
        newValue=trans('shop');
    }else if(value=="O"){
        newValue=trans('office building');
    }
    return newValue;
  }

  /**
  *房屋用户类型过滤
  */
  static userTypeFilter(value) {
    var newValue = "";
    if(value=="O"){
        newValue=trans('owner');
    }else if(value=="F"){
        newValue=trans('family');
    }else if(value=="R"){
        newValue=trans('tenant');
    }
    return newValue;
  }

  /**
  *订单状态过滤
  */
  static orderStatusFilter(value) {
    var newValue = "";
    if(value=="P"){
        newValue=trans('paied');
    }else if(value=="F"){
        newValue=trans('done');
    }else if(value=="C"){
        newValue=trans('canceled');
    }
    return newValue;
  }

  /**
  *车辆申请状态过滤
  */
  static carStateFilter(value) {
    var newValue = "";
    if(value=="P"){
        newValue=trans('to be confirmed');
    }else if(value=="N"){
        newValue=trans('confirmed');
    }else if(value=="C"){
        newValue=trans('to delete');
    }else if(value=="D"){
        newValue=trans('deleted');
    }
    return newValue;
  }

  /**
  *费率单位过滤
  */
  static rateFilter(value,type) {
    var newValue = ""+(parseInt(value)/100);
    if(type=="M"){
        newValue=newValue+trans('yuan')+'/'+trans('square meter');
    }else if(type=="W"){
        newValue=newValue+trans('yuan')+'/'+trans('tone');
    }else if(type=="E"){
        newValue=newValue+trans('yuan')+'/'+trans('kilowatt hour');
    }else if(type=="C"){
        newValue=newValue+trans('yuan')+'/'+trans('car');
    }
    return newValue;
  }

  /**
  *数量过滤
  */
  static quantityFilter(value,type) {
    var newValue = ""+value;
    if(type=="M"){
        newValue=newValue+trans('square meter');
    }else if(type=="W"){
        newValue=newValue+trans('tone');
    }else if(type=="E"){
        newValue=newValue+trans('kilowatt hour');
    }else if(type=="C"){
        newValue=newValue+trans('car');
    }
    return newValue;
  }

  /**
  *手机号码隐藏过滤
  */
  static mobileFilter(value) {
    var newValue = value;
    if(value.length==11){
        newValue=value.substring(0,3)+"****"+value.substring(7);
    }
    return newValue;
  }

  /**
  *金额过滤,系统以分为单位
  */
  static moneyFilter(value) {
    var newValue = value/100;
    return newValue;
  }
}
