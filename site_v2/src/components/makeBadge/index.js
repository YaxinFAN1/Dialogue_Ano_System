import {Badge} from "antd";
import React from "react";

export const makeBadge = (schedule, statenumber) => {
  let status = 'processing',state = '标注中';
  if(statenumber === 3){
    switch(schedule){
      case 0:
        status = 'processing';
        state = '标注中';
        break;
      case 1:
        status = 'warning';
        state = '审核中';
        break;
      case 2:
        status = 'success';
        state = '已完成';
        break;
    }
  }
  else if(statenumber === 2){
    switch(schedule){
      case 1:
        status = 'processing';
        state = '未审核';
        break;
      case 2:
        status = 'success';
        state = '已审核';
        break;
    }
  }
  else if(statenumber === 1){
    switch(schedule){
      case 0:
        status = 'processing';
        state = '未标注';
        break;
      case 1:
        status = 'success';
        state = '已标注';
        break;
    }
  }
  return <Badge status={status} text={state} />
};
