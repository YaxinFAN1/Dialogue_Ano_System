import React from "react";
import { Input, Space, Button,  } from 'antd';
import { SearchOutlined  } from '@ant-design/icons';
import Highlighter from "react-highlight-words";

export const makeColumnSearch = (_this, dataIndex, dataIndexCN) => {
  return (
    {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              _this.searchInput = node;
            }}
            placeholder={`搜索 ${dataIndexCN}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(_this, selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(_this, selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button onClick={() => handleReset(_this, clearFilters)} size="small" style={{ width: 90 }}>
              重置
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
          : '',
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => _this.searchInput.select(), 100);
        }
      },
      render: text =>
        _this.state.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[_this.state.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    }
  )
};

const handleSearch = (_this, selectedKeys, confirm, dataIndex) => {
  confirm();
  _this.setState({
    searchText: selectedKeys[0],
    searchedColumn: dataIndex,
  });
};

const handleReset = (_this, clearFilters) => {
  clearFilters();
  _this.setState({
    searchText: ''
  });
};
