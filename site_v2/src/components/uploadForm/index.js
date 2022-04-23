import React, {Component, useState} from 'react';
import {Button, Form, Input, Modal, Radio, message} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {connect} from 'react-redux';

import UploadButtons from "../uploadButtons";
import { actionCreators } from "../../Users/CMGT/store";
import { any2json, readText } from "../../utils/readfile";

const UploadCreateForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  form.resetFields();
  return (
    <Modal
      visible={visible}
      title="自定义上传"
      okText="上传"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          corpustype: 'xml',
        }}
      >

        <Form.Item
          name="group"
          label="分组名"
          rules={[
            {
              required: true,
              message: '请输入待上传熟语料所在分组!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="corpustype"
          label="熟语料类型"
          className="collection-create-form_last-form-item"
          rules={[
            {
              required: true,
              message: '选择上传的熟语料类型!',
            },
          ]}
        >
          <Radio.Group defaultValue="xml">
            <Radio value="json">.json</Radio>
            <Radio value="xml">.xml</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="chooseCorpus"
          rules={[
            {
              required: true,
              message: '至少选择一份熟语料文件！',
            },
          ]}
        >
          <UploadButtons />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const UploadPage = (props) => {
  const [visible, setVisible] = useState(false);

  const onCreate = async (values) => {
    let batchname = values.group; //分组名
    let _corpusList = values.chooseCorpus;
    let corpustype = values.corpustype; //熟语料类型

    if(window.FileReader){
      let corpusList = [];
      //把所有传过来的File对象拆开，格式化，包装成对象。
      for(let i=0; i<_corpusList.length; i++){
        let corpus = {id: "untitled", content: null, filetype: corpustype};
        await readText(_corpusList[i])
          .then((result) => {
            corpus.id = batchname + '$' + _corpusList[i].name;
            corpus.content = result;
          });
        corpusList.push(corpus);
      }

      //修改文件：针对不同的文件类型的文件，全部转化为json格式
      const o_corpuscontents = await any2json(corpusList);
      for(let i=0; i<corpusList.length; i++){
        //corpusList[i].content = o_corpuscontents[i];
        corpusList[i].content = o_corpuscontents[i];
      }
      //创建新的语料
      if(await props.createNewCorpuses(corpusList)) message.success("上传成功！");
      else message.error("上传失败！");
    }
    else{
      message.error("浏览器不支持FileReader读文件，请安装支持ES6的浏览器！");
    }
    setVisible(false);
    await props.refresh();
  };

  return (
    <div>
      <Button
        icon={<UploadOutlined />}
        size="large"
        onClick={() => {
          setVisible(true);//打开表单
        }}
      >
        上传
      </Button>
      <UploadCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class UploadForm extends Component {

  render() {
    const { refresh, createNewCorpuses } = this.props;
    return (
      <div>
        <UploadPage
          refresh={refresh}
          createNewCorpuses={createNewCorpuses}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    createNewCorpuses(corpusList){
      //批量创建新的熟语料文件
      return new Promise(async (resolve) => {
        resolve(await actionCreators.createNewCorpuses(corpusList));
      })
    },
  }
};

export default connect(mapDispatchToProps)(UploadForm);
