#import "MKNetworkEngineRTC.h"

@interface tyrtchttpengine : MKNetworkEngineRTC

typedef void (^GetTokenOkBlock)(BOOL ok,NSDictionary* dic);
typedef void (^GetAddressesOkBlock)(BOOL ok,NSDictionary* dic);
typedef void (^RespOkBlock)(BOOL ok,NSDictionary* dic);
typedef void (^RespUIBlock)(UIView* view);

-(MKNetworkOperationRTC*) getServerAddresses:(NSString*)httpMethod
                                   useSSL:(BOOL)useSSL
                                    appId:(NSString*)appId
                                   appKey:(NSString*)appKey
                        completionHandler:(RespOkBlock) completionBlock
                             errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getAccountToken:(NSString*)httpMethod
                                useSSL:(BOOL)useSSL
                                 appId:(NSString*)appId
                                appKey:(NSString*)appKey
                                 accId:(NSString*)accId
                              authType:(int)authType
                          terminalType:(NSString*)terminalType
                            terminalSN:(NSString*)terminalSN
                              grantStr:(NSString*)grantStr
                           callbackURL:(NSString*)callbackURL
                     completionHandler:(RespOkBlock) completionBlock
                          errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) setPushInfo:(NSString*)httpMethod
                               useSSL:(BOOL)useSSL
                                appId:(NSString*)appId
                               appKey:(NSString*)appKey
                                accId:(NSString*)accId
                         terminalType:(NSString*)terminalType
                                   dt:(NSString*)dt
                               pushId:(NSString*)pushId
                              pushKey:(NSString*)pushKey
                           pushMaster:(NSString*)pushMaster
                    completionHandler:(RespOkBlock) completionBlock
                         errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getUserStatus:(NSString*)httpMethod
                              useSSL:(BOOL)useSSL
                               appId:(NSString*)appId
                              appKey:(NSString*)appKey
                              accIds:(NSString*)accIds
                        authTypeFlag:(int)authTypeFlag
                               token:(NSString*)token
                   completionHandler:(RespOkBlock) completionBlock
                        errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) GroupCall:(NSString*)httpMethod
                          useSSL:(BOOL)useSSL
                           appId:(NSString*)appId
                          appKey:(NSString*)appKey
                         creator:(NSString*)gvcCreator
                     creatorType:(NSString*)gvcCreatorType
                            type:(int)gvcType
                            name:(NSString*)gvcName
                          maxMem:(int)gvcMaxmem
                     inviteeList:(NSMutableArray*)gvcinviteeList
                          attend:(int)gvcAttend
                        password:(NSString*)gvcPassword
                           cbUrl:(NSString*)gvcCBurl
                        cvMethod:(NSString*)gvcCBmethod
                       switchPic:(int)switchPicture
                           codec:(int)codec
                     screenSplit:(int)screen
                                    lv:(int)lv
                        initMode:(int)initMode
                    voiceMixer:(int)voiceMixer
                maxDuration:(long)maxDuration
                       infoMode:(int)infoMode
                           token:(NSString*)token
               completionHandler:(RespOkBlock) completionBlock
                    errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getGroupMemeberList:(NSString*)httpMethod
                                    useSSL:(BOOL)useSSL
                                     appId:(NSString*)appId
                                    appKey:(NSString*)appKey
                                   creator:(NSString*)gvcCreator
                               creatorType:(NSString*)gvcCreatorType
                                    callID:(NSString*)callID
                                     token:(NSString*)token
                         completionHandler:(RespOkBlock) completionBlock
                              errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) InvitedMembermanagement:(NSString*)httpMethod
                                        useSSL:(BOOL)useSSL
                                         appId:(NSString*)appId
                                        appKey:(NSString*)appKey
                                       creator:(NSString*)gvcCreator
                                   creatorType:(NSString*)gvcCreatorType
                                        callID:(NSString*)callID
                                   inviteeList:(NSMutableArray*)inviteeList
                                          mode:(int)mode
                                         token:(NSString*)token
                             completionHandler:(RespOkBlock) completionBlock
                                  errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) JoinedMembermanagement:(NSString*)httpMethod
                                       useSSL:(BOOL)useSSL
                                        appId:(NSString*)appId
                                       appKey:(NSString*)appKey
                                      creator:(NSString*)gvcCreator
                                  creatorType:(NSString*)gvcCreatorType
                                       callID:(NSString*)callID
                                  inviteeList:(NSMutableArray*)inviteeList
                                         mode:(int)mode
                                     password:(NSString*)gvcPassword
                                        token:(NSString*)token
                            completionHandler:(RespOkBlock) completionBlock
                                 errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) KickedMemberList:(NSString*)httpMethod
                                 useSSL:(BOOL)useSSL
                                  appId:(NSString*)appId
                                 appKey:(NSString*)appKey
                                creator:(NSString*)gvcCreator
                            creatorType:(NSString*)gvcCreatorType
                                 callID:(NSString*)callID
                             kickedList:(NSMutableArray*)kickedList
                         replacerMember:(NSString*)replacerMember
                                  token:(NSString*)token
                      completionHandler:(RespOkBlock) completionBlock
                           errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) CloseGroupCall:(NSString*)httpMethod
                               useSSL:(BOOL)useSSL
                                appId:(NSString*)appId
                               appKey:(NSString*)appKey
                              creator:(NSString*)gvcCreator
                          creatorType:(NSString*)gvcCreatorType
                               callID:(NSString*)callID
                                token:(NSString*)token
                    completionHandler:(RespOkBlock) completionBlock
                         errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) GrpvMicManagement:(NSString*)httpMethod
                                  useSSL:(BOOL)useSSL
                                   appId:(NSString*)appId
                                  appKey:(NSString*)appKey
                                 creator:(NSString*)gvcCreator
                             creatorType:(NSString*)gvcCreatorType
                                  callID:(NSString*)callID
                          operationList:(NSMutableArray*)operationList
                                   token:(NSString*)token
                       completionHandler:(RespOkBlock) completionBlock
                            errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) GrpvVideoManagement:(NSString*)httpMethod
                                    useSSL:(BOOL)useSSL
                                     appId:(NSString*)appId
                                    appKey:(NSString*)appKey
                                   creator:(NSString*)gvcCreator
                               creatorType:(NSString*)gvcCreatorType
                                    callID:(NSString*)callID
                               memberToSet:(NSString*)mbToSet
                            memberSetStyle:(int)mbSetStyle
                              memberToShow:(NSString*)mbToShow
                               screenSplit:(int)screen
                                        lv:(int)lv
                            operationList:(NSMutableArray*)operationList
                                     token:(NSString*)token
                         completionHandler:(RespOkBlock) completionBlock
                              errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getGroupList:(NSString*)httpMethod
                             useSSL:(BOOL)useSSL
                              appId:(NSString*)appId
                             appKey:(NSString*)appKey
                            creator:(NSString*)gvcCreator
                        creatorType:(NSString*)gvcCreatorType
                              token:(NSString*)token
                  completionHandler:(RespOkBlock) completionBlock
                       errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) GrpRecord:(NSString*)httpMethod
                                       useSSL:(BOOL)useSSL
                                        appId:(NSString*)appId
                                       appKey:(NSString*)appKey
                                      creator:(NSString*)gvcCreator
                                  creatorType:(NSString*)gvcCreatorType
                                       callID:(NSString*)callID
                                       action:(int)action
                                   recordMode:(int)recordMode
                                 whomToRecord:(NSString*)whomToRecord
                                    mediaType:(int)mediaType
                                mediaFileName:(NSString*)mediaFileName
                                mediaFileType:(NSString*)mediaFileType
                                  maxDuration:(long)maxDuration
                                 maxMediaSize:(int)maxMediaSize
                                         memo:(NSString*)memo
                                        token:(NSString*)token
                            completionHandler:(RespOkBlock) completionBlock
                                 errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getGroupRecordStatus:(NSString*)httpMethod
                                        useSSL:(BOOL)useSSL
                                         appId:(NSString*)appId
                                        appKey:(NSString*)appKey
                                       creator:(NSString*)gvcCreator
                                   creatorType:(NSString*)gvcCreatorType
                                        callID:(NSString*)callID
                                          name:(NSString*)gvcName
                                    recordTime:(NSString*)recordTime
                                     mediaType:(int)mediaType
                                 mediaFileName:(NSString*)mediaFileName
                                          memo:(NSString*)memo
                                   matchOption:(int)matchOption
                                         token:(NSString*)token
                             completionHandler:(RespOkBlock) completionBlock
                                  errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) GrpRecordFileManagement:(NSString*)httpMethod
                                            useSSL:(BOOL)useSSL
                                             appId:(NSString*)appId
                                            appKey:(NSString*)appKey
                                           creator:(NSString*)gvcCreator
                                       creatorType:(NSString*)gvcCreatorType
                                            callID:(NSString*)callID
                                               url:(NSString*)url
                                            action:(int)action
                                        actionPara:(NSString*)actionPara
                                             token:(NSString*)token
                                 completionHandler:(RespOkBlock) completionBlock
                                      errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) UploadFile:(NSString*)httpMethod
                              useSSL:(BOOL)useSSL
                               appId:(NSString*)appId
                              appKey:(NSString*)appKey
                             creator:(NSString*)gvcCreator
                         creatorType:(NSString*)gvcCreatorType
                            filePath:(NSString*)filePath
                                memo:(NSString*)memo
                               token:(NSString*)token
                   completionHandler:(RespOkBlock) completionBlock
                        errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getUploadFileStatus:(NSString*)httpMethod
                                       useSSL:(BOOL)useSSL
                                        appId:(NSString*)appId
                                       appKey:(NSString*)appKey
                                      creator:(NSString*)gvcCreator
                                  creatorType:(NSString*)gvcCreatorType
                                mediaFileName:(NSString*)mediaFileName
                                         memo:(NSString*)memo
                                  matchOption:(int)matchOption
                                        reqID:(NSString*)reqID
                                        token:(NSString*)token
                            completionHandler:(RespOkBlock) completionBlock
                                 errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) UploadFileManagement:(NSString*)httpMethod
                                        useSSL:(BOOL)useSSL
                                         appId:(NSString*)appId
                                        appKey:(NSString*)appKey
                                       creator:(NSString*)gvcCreator
                                   creatorType:(NSString*)gvcCreatorType
                                           url:(NSString*)url
                                        action:(int)action
                                    actionPara:(NSString*)actionPara
                                         token:(NSString*)token
                             completionHandler:(RespOkBlock) completionBlock
                                  errorHandler:(MKNKErrorBlock) errorBlock;

-(MKNetworkOperationRTC*) getLiveChannel:(NSString*)httpMethod
                                  useSSL:(BOOL)useSSL
                                   appId:(NSString*)appId
                                  appKey:(NSString*)appKey
                                   accId:(NSString*)accId
                             startOption:(NSString*)startOption
                               channelID:(NSString*)channelID
                             channelType:(int)channelType
                                  record:(NSString*)record
                            optimization:(NSString*)optimization
                                  pushIp:(NSString*)pushIp
                                    rate:(int)rate
                             callbackURL:(NSString*)callbackURL
                       completionHandler:(RespOkBlock) completionBlock
                            errorHandler:(MKNKErrorBlock) errorBlock;
@end
