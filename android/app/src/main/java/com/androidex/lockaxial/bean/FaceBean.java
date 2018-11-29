package com.androidex.lockaxial.bean;

/**
 * Created by Administrator on 2018/5/30.
 */

public class FaceBean {
    public int id;
    public String imageUrl;
    public String dataUrl;
    public String faceName;
    public String createDate;
    public FaceBean(int id,String imageUrl,String dataUrl,String faceName,String createDate){
        this.id = id;
        this.imageUrl = imageUrl;
        this.dataUrl = dataUrl;
        this.faceName = faceName;
        this.createDate = createDate;
    }
}
