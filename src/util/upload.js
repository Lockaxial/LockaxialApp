/**
*文件上传类
*/
import ajax from './ajax';

export default class Upload{
  options={
    url:null,
    files:[],
    onUploadStart:null,
    onUploadProgress:null,
    onUploadFailed:null,
    onUploadCanceled:null,
    onUploadComplete:null,
    onUploadAllComplete:null
  };
  index=0;

  constructor(options){
    this.options=options;
    this.index=0;
  }

  uploadComplete(evt) {
    var data = evt.target.responseText;
    if(this.options.onUploadComplete){
      this.options.onUploadComplete(this.index,data,evt);
    }
    this.index++;
    if (this.index < this.options.files.length) {
      this.uploadFile();
    }else{
      if(this.options.onUploadAllComplete){
        this.options.onUploadAllComplete();
      }
    }
  }

  uploadProgress(evt) {
    if(this.options.onUploadProgress){
      this.options.onUploadProgress(this.index,evt);
    }
  }

  uploadFailed(evt) {
    var data = evt.target.responseText;
    if(this.options.onUploadFailed){
      this.options.onUploadFailed(this.index,evt);
    }
  }

  uploadCanceled(evt) {
    var data = evt.target.responseText;
    if(this.options.onUploadCanceled){
      this.options.onUploadCanceled(this.index,evt);
    }
  }

  start(){
    if(this.options.files.length>0){
      if(this.options.onUploadStart){
        this.options.onUploadStart();
      }
      this.uploadFile();
    }
  }

  getFileName(path){
    let index=path.lastIndexOf('/');
    return path.substring(index+1);
  }
  /**
  *将一个文件上传至服务器
  */
  uploadFile() {
    let file=this.options.files[this.index];
    console.log("file = "+file.toString())
    let formData = new FormData();
    console.log("formData = "+JSON.stringify(formData))
    let fileData={uri: file.path, type: 'multipart/form-data', name: this.getFileName(file.path)};
    formData.append('Filedata',fileData);
    console.log("file up load------------------"+JSON.stringify(formData))
    var xhr = new XMLHttpRequest();
    //xhr.setRequestHeader("Authorization",('Bearer ' + ajax.token));
    xhr.upload.addEventListener("progress", (evt)=>this.uploadProgress(evt), false);
    xhr.addEventListener("load",(evt)=>this.uploadComplete(evt), false);
    xhr.addEventListener("error",(evt)=>this.uploadFailed(evt), false);
    xhr.addEventListener("abort",(evt)=>this.uploadCanceled(evt), false);
    xhr.open("POST",this.options.url);
    xhr.send(formData);
  }
}
