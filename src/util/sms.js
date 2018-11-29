/**
*短信校验工具
*/
import reactBridge from '../bridge/reactBridge';
import {
  DeviceEventEmitter
} from 'react-native';

export class Sms{
  sendSmsEventCallback=null;
  verifySmsEventCallback=null;

  constructor() {
    DeviceEventEmitter.addListener('sendSmsSuccess',(data)=>this.onSendSmsSuccess());
    DeviceEventEmitter.addListener('sendSmsFail',(data)=>this.onSendSmsFail());
    DeviceEventEmitter.addListener('verifySmsSuccess',(data)=>this.onVerifySmsSuccess());
    DeviceEventEmitter.addListener('verifySmsFail',(data)=>this.onVerifySmsFail());
  }

  /**
  *验证码发送成功回调
  */
  onSendSmsSuccess(){
    if(this.sendSmsEventCallback){
      this.sendSmsEventCallback(0);
    }
  }

  /**
  *验证码发送失败回调
  */
  onSendSmsFail(){
    if(this.sendSmsEventCallback){
      this.sendSmsEventCallback(1);
    }
  }

  /**
  *验证码校验成功回调
  */
  onVerifySmsSuccess(){
    if(this.verifySmsEventCallback){
      this.verifySmsEventCallback(0);
    }
  }

  /**
  *验证码校验失败回调
  */
  onVerifySmsFail(){
    if(this.verifySmsEventCallback){
      this.verifySmsEventCallback(1);
    }
  }

  /**
  *发送短信
  */
  sendSms(phone,cb) {
    this.sendSmsEventCallback=cb;
    reactBridge.sendSms(phone);
  }

  /**
  *验证短信
  */
  verifySms(phone,code,cb) {
    this.verifySmsEventCallback=cb;
    reactBridge.verifySms(phone,code);
  }
}

const sms=new Sms();
export default sms; //创建一个默认的数据对象，并将其导出
