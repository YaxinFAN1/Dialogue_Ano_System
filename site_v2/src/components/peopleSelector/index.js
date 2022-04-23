import React, {Component} from 'react';
import { Select } from 'antd';
import { identify } from "../../utils/identify";

class PeopleSelector extends Component {

  render() {
    const { onChange } = this.props;
    const { people, rootsList } = this.props;
    let mode = (people === 'auditor')? null : 'multiple';
    let defaultvalue = (typeof this.props.default === 'undefined')? [] : this.props.default;
    let children = [];
    rootsList.forEach(user => {
      if(identify(user.rootList) > 0){
        children.push(<Select.Option key={user.username} value={user.username}>{user.username}</Select.Option>)
      }
    });

    function handleChange(value) {
      onChange(value);
    }

    return (
        <div>
          <Select
              mode={mode}
              allowClear
              maxTagTextLength={5}
              style={{ width: '100%' }}
              placeholder="请选择"
              defaultValue={defaultvalue}
              onChange={handleChange}
          >
            {children}
          </Select>
        </div>
    );
  }

}


export default PeopleSelector;
