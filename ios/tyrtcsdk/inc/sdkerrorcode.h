#ifndef __sdkerrorcode_h
#define __sdkerrorcode_h

//错误码
#define EC_START_IDX -1000
#define ECIDXMAKE(IDX)  (EC_START_IDX-IDX)
#define EC_OK                   0
#define EC_MALLOC_MEM_FAILED	ECIDXMAKE(1)
#define EC_PARAM_WRONG			ECIDXMAKE(2)
#define EC_LOST_KEY				ECIDXMAKE(3)
#define EC_CANTT_RESET_PARAM	ECIDXMAKE(4)
#define EC_MAKE_CALL_FAILED     ECIDXMAKE(5)
#define EC_HAVENT_CALL          ECIDXMAKE(6)
#define EC_ACTION_FAILED        ECIDXMAKE(7)
#define EC_SDK_INITED           ECIDXMAKE(8)
#define EC_SDK_INIT_UNCOMPLETED ECIDXMAKE(9)
#define EC_SIZE_TOO_LARGE       ECIDXMAKE(10)
#define EC_UNSUPPORTED_FUNC     ECIDXMAKE(11)

#endif
