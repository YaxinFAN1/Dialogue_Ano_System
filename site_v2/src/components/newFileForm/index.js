import React, {Component, useState} from 'react';
import {Button, Form, message, Modal } from "antd";
import {connect} from "react-redux";
import { PlusCircleOutlined } from '@ant-design/icons';


import UploadButtons from "../uploadButtons";
import {actionCreators as t_actionCreators, actionCreators} from "../../Users/TMGT/store";
import {readText, xincmn2json, any2json} from "../../utils/readfile";


const NewFileCreateForm = ({ visible, onCreate, onCancel, users }) => {
  const [form] = Form.useForm();
  form.resetFields();

  return (
    <Modal
      visible={visible}
      title="添加新的文件到任务(生语料格式)"
      okText="添加"
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

        }}
      >

        <Form.Item
          name="choose_file"
          rules={[
            {
              required: true,
              message: '必须选择至少一个生语料文件！',
            },
          ]}
        >
          <UploadButtons />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const NewFilePage = (props) => {
  const [visible, setVisible] = useState(false);

  const onCreate = async (values) => {
    const { taskname } = props.currentTaskFile;
    const taskFileList = values.choose_file;
    if(window.FileReader){
      let fileList = []; //所有读取并格式化好的文件对象会放在这里

      //把所有传过来的File对象拆开，格式化，包装成对象。
      for(let i=0; i<taskFileList.length; i++){
        let file = {name: null, content: null, filetype: "xml"};
        await readText(taskFileList[i])
          .then((result) => {
            file.name = taskFileList[i].name;
            const filetype = file.name.split('.').pop()
            file.filetype = filetype
            file.name = file.name.replace(".json","");
            file.name = file.name.replace(".xml","");
            file.content = result;
          });
        fileList.push(file);
      }
      //修改文件：针对不同的文件类型的文件，全部转化为json格式
      const fileContentList = await any2json(fileList);
      // const fileContentList = await xincmn2json(fileList);
      for(let i=0; i<fileContentList.length; i++){
        fileList[i].content = fileContentList[i];
      }
      let task = Object.assign({},values,{taskfileList: fileList});
      //创建文件
      let files = [];
      task.taskfileList.forEach(item => {
        files.push({id: item.name, content: item.content});
      });
      await props.createFiles(files);
      //添加文件
      let _files = [];
      task.taskfileList.forEach(item => {
        _files.push({tid: taskname, fid: item.name});
      });
      await props.addFiles(_files);
      //设置入库ID
      let __files = [];
      task.taskfileList.forEach(item => {
        __files.push({tid: taskname, fid: item.name, target: item.name});
      });
      await props.setFileTargets(__files);
    }
    props.refresh(props.currentTaskFile);
    message.success("添加成功！");
    setVisible(false);
  };

  return (
    <div>
      <Button
        size="large"
        icon={<PlusCircleOutlined />}
        onClick={() => {
          setVisible(true);
        }}
      >
        添加新文件到任务
      </Button>
      <NewFileCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class NewFile extends Component {

  render() {
    const { refresh, currentTaskFile, createFiles, addFiles, setInspector, addAnnotators, setFileTargets } = this.props;

    return (
      <div>
        <NewFilePage
          refresh={refresh}
          currentTaskFile={currentTaskFile}
          createFiles={createFiles}
          addFiles={addFiles}
          setInspector={setInspector}
          addAnnotators={addAnnotators}
          setFileTargets={setFileTargets}
        />
      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return {

  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    createFiles(files){
      return new Promise(async (resolve) => {
        await t_actionCreators.createFiles(files);
        resolve();
      })
    },
    addFiles(files){
      return new Promise(async (resolve) => {
        await actionCreators.addFiles(files);
        resolve();
      })
    },
    setFileTargets(files){
      return new Promise(async (resolve) => {
        await actionCreators.setFileTargets(files);
        resolve();
      });
    },
    setInspector(inspector){
      return new Promise(async (resolve) => {
        await actionCreators.setInspector(inspector);
        resolve();
      })
    },
    addAnnotators(annotators){
      return new Promise(async (resolve) => {
        await actionCreators.addAnnotators(annotators);
        resolve();
      })
    }
  }
};


export default connect(mapStateToProps,mapDispatchToProps)(NewFile);
