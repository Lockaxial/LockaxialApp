/**
 * 用于APP管理WIFI
 */
package com.androidex.lockaxial.util;

import android.content.Context;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;

import java.util.Iterator;
import java.util.List;

public class WifiHandler {
    //定义一个WifiManager对象
    private WifiManager wifiManager;
    private Thread checkThread=null;
    private int liftStatus=0;
    private WifiEvent wifiEventHandler=null;
    /**
     * 构造函数，创建一个WifiHandler对象，需要传入Context
     * @param context
     */
    public WifiHandler(Context context,WifiEvent wifiEventHandler){
        //取得WifiManager对象
        wifiManager =(WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        this.wifiEventHandler=wifiEventHandler;
    }

    /**
     * 检查当前WIFI配置列表中，是否有指定的WIFI，如果没有则添加
     * @param ssid
     * @param password
     */
    public void initLockWifi(String ssid,String password){
        List<WifiConfiguration> list=wifiManager.getConfiguredNetworks();
        Iterator<WifiConfiguration> iterator=list.iterator();
        boolean initStatus=false;
        while(iterator.hasNext()){
            WifiConfiguration conf=iterator.next();
            String thisSsid=conf.SSID;
            if(thisSsid.equals("\""+ssid+"\"")){
                initStatus=true;
                break;
            }
        }
        if(!initStatus){
            addWifi(ssid,password);
        }
    }

    public void startChecking(final String ssid){
        checkThread=new Thread(){
            public void run(){
                try {
                    while(!isInterrupted()){ //检查线程没有被停止
                        boolean result=isCurrentWifiConnected(ssid);
                        if(result){
                            if(liftStatus!=10){
                                liftStatus=10;
                                onWifiStatusChanged(liftStatus);
                            }
                        }else{
                            if(liftStatus!=0){
                                liftStatus=0;
                                onWifiStatusChanged(liftStatus);
                            }
                        }
                        sleep(1000); //等待新版本检查的时间
                    }
                }catch(InterruptedException e){
                }
                checkThread=null;
            }
        };
        checkThread.start();
    }
    private void onWifiStatusChanged(int status){
        if(this.wifiEventHandler!=null){
            this.wifiEventHandler.onStatusChanged(status);
        }
    }

    public void stopChecking(){
        if(checkThread!=null){
            checkThread.interrupt();
            checkThread=null;
        }
    }
    public int getLiftStatus(){
        return this.liftStatus;
    }
    /**
     * 检查是否当前的WIFI是连接状态
     * @param ssid
     * @return
     */
    public boolean isCurrentWifiConnected(String ssid){
        boolean connectStatus=false;
        if(wifiManager.getWifiState()==WifiManager.WIFI_STATE_ENABLED){
            WifiInfo wifiInfo=wifiManager.getConnectionInfo();
            String thisSsid=wifiInfo.getSSID();
            if(thisSsid.equals("\""+ssid+"\"")){
                connectStatus=true;
            }
        }
        return connectStatus;
    }

    /**
     * 增加一个WIFI连接配置
     * @param ssid
     * @param password
     */
    public void addWifi(String ssid, String password){
        WifiConfiguration wifiConfig;
        wifiConfig = setWifiParams(ssid,password);
        int wcgID = wifiManager.addNetwork(wifiConfig);
        wifiManager.saveConfiguration();
    }

    /**
     * 返回一个WIFI配置参数
     * @param ssid
     * @param password
     * @return
     */
    public WifiConfiguration setWifiParams(String ssid, String password) {
        WifiConfiguration apConfig = new WifiConfiguration();
        apConfig.SSID = "\"" + ssid + "\"";
        apConfig.preSharedKey = "\"" + password + "\"";
        apConfig.hiddenSSID = false;
        apConfig.status = WifiConfiguration.Status.ENABLED;
        apConfig.allowedAuthAlgorithms.set(WifiConfiguration.AuthAlgorithm.OPEN);

        apConfig.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);

        apConfig.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP);
        apConfig.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP);
        apConfig.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP104);
        apConfig.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP40);

        apConfig.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
        apConfig.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP);
        apConfig.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.NONE);

        apConfig.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
        // 必须添加，否则无线路由无法连接
        apConfig.allowedProtocols.set(WifiConfiguration.Protocol.RSN);
        return apConfig;
    }
}
