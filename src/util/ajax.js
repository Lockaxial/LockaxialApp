/**
*对HTTP 服务进行封装，分为get方法及post方法
*/
import AppConf from '../comm/appConf';
import accountDao from '../model/accountDao';
import Base64 from './baseUtil';
import {toast,toastX} from './tools';

class Ajax{
  token=""; //系统获取的服务器token值

  setToken(thisToken){
    this.token=thisToken;
  }

  /**
  *转换访问地址，补充前缀
  */
  convertUrl(url){
    return AppConf.APPLICATION_SERVER + "/app" + url;
  }

  outputObj(obj) {
      var description = "";
      for (var i in obj) {
          description += i + " = " + obj[i] + "\n";
      }
      console.log(description);
  }

  getAppKey(){
    let key=accountDao.userInfo;
    console.log("key = ");
    this.outputObj(key)
    if(key){
      key=JSON.stringify(accountDao.userInfo);
      let base64=new Base64();
      key = base64.encode(key);
    }else{
      key='';
    }
    console.log("return key = ");
      this.outputObj(key)
    return key;
  }
  /**
  *封装get方法，url为访问地址，data是参数。JSON格式，cb回调函数，返回的参数基本格式为{code:0},0表示成功，否则为失败
  */
  get(url,data,cb){
    console.log("=============== g e t ========================");
    console.log("data = ");
    this.outputObj(data);
    if(data){
      data.appKey=this.getAppKey();
    }else{
      data={appKey:this.getAppKey()}
    }
    console.log("data+key = ");
      this.outputObj(data);
    if (data) {
        let paramsArray = [];
        Object.keys(data).forEach(key => paramsArray.push(key + '=' + data[key]));
        if (url.search(/\?/) === -1) {
            url += '?' + paramsArray.join('&')
        } else {
            url += '&' + paramsArray.join('&')
        }
    }
    url=this.convertUrl(url);
    console.log("url = "+url);
    console.log("=============== e n d ========================");
    fetch(url,{
        method: 'GET',
        headers:{
          'Content-Type': 'application/json',
          'Authorization': ('Bearer ' + this.token)
        },
    }).then((response) => {
      if(response.ok) {
        return response.json();
      }else{
        return {code:response.status}
      }
    }).then((result)=>{
        cb(result);
    }).catch((error) => {
      // toastX('no network:');
      toast(JSON.stringify(error.message));
      cb({code:9999});
    }).done();
  }

  /**
  * 封装post方法，url为访问地址，data是参数。JSON格式，cb回调函数，返回的参数基本格式为{code:0},0表示成功，否则为失败
  */
  post(url,data,cb){
    console.log("=============== p o s t ========================");
    console.log("data = ");
      this.outputObj(data);
    if(data){
      data.appKey=this.getAppKey();
    }else{
      data={appKey:this.getAppKey()}
    }
    console.log("data+key = ");
      this.outputObj(data);
    url=this.convertUrl(url);
    console.log("url = "+url);
    console.log("jsonData = "+JSON.stringify(data));
    console.log("=============== e n d ========================");
    fetch(url,{
        method: 'POST',
        headers:{
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': ('Bearer ' + this.token)
        },
        body:JSON.stringify(data)
    }).then((response) => {
      if(response.ok) {
        return response.json();
      }else{
        return {code:response.status}
      }
    }).then((result)=>{
        cb(result);
    }).catch((error) => {
      toastX('no network');
      cb({code:9999});
    }).done();
  }

  /**
  *将图片的相对URL转换成可以绝对地址
  */
  convertImageUrl(url) {
    if(!url) return "";
    var header = url.substring(0, 4);
    header = header.toUpperCase();
    if (header == "HTTP") {
        return url;
    } else if (header.substring(0, 1) == "/") {
        return AppConf.APPLICATION_SERVER + url;
    } else {
        return url;
    }
  }

  /**
  *判断链接地址是否网络资源，还是本地资源
  */
  isRemoteResource(url){
    if(!url) return false;
    var header = url.substring(0, 4);
    header = header.toUpperCase();
    if (header == "HTTP") {
      return true;
    }else{
      return false;
    }
  }
}

const ajax=new Ajax();
export default ajax;//将ajax对象导出，可以直接使用
