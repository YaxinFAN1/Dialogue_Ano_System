import React, {Component, useState} from 'react';
import {Button, Form, Input, message, Modal, Radio} from "antd";
import {connect} from "react-redux";
import { PlusCircleOutlined } from '@ant-design/icons';

import { readText, xincmn2json, any2json } from "../../utils/readfile";
import { chtb2json } from "../../Users/CMGT/store/actionCreators";
import { actionCreators as t_actionCreators } from "../../Users/TMGT/store";
import PeopleSelector from "../peopleSelector";
import UploadButtons from "../uploadButtons";


const NewTaskCreateForm = ({ visible, onCreate, onCancel, rootsList }) => {
  const [form] = Form.useForm();
  form.resetFields();

  return (
    <Modal
      visible={visible}
      title="创建新的任务"
      okText="创建"
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
          name="taskname"
          label="新的任务名"
          rules={[
            {
              required: true,
              message: '必须填写一个任务名！',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={"group"}
          label={"分组名"}
          rules={[{required: true}]}
        >
          <Input />
        </Form.Item>

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

        <Form.Item
          name="auditor"
          label="审核员分配"
          rules={[
            {
              required: true,
              message: '必须分配一个审核员！',
            },
          ]}
        >
          <PeopleSelector
            people="auditor"
            rootsList={rootsList}
          />
        </Form.Item>

        <Form.Item
          name="annotator"
          label="标注员分配"
          rules={[
            {
              required: true,
              message: '必须分配一个或多个标注员！',
            },
          ]}
        >
          <PeopleSelector
            people="annotator"
            rootsList={rootsList}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const NewTaskPage = (props) => {
  const [visible, setVisible] = useState(false);

  const onCreate = async (values) => {
    const taskFileList = values.choose_file;
    const group = values.group;
    if(window.FileReader){
      let fileList = []; //所有读取并格式化好的文件对象会放在这里

      //把所有传过来的File对象拆开，格式化，包装成对象。
      for(let i=0; i<taskFileList.length; i++){
        let file = {name: null, content: null, filetype: 'xml'};
        await readText(taskFileList[i])
          .then((result) => {
            file.name = taskFileList[i].name;
            const filetype = file.name.split('.').pop()
            file.filetype = filetype
            file.name = file.name.replace(".json","");
            file.name = file.name.replace(".xml","");
            if (group && group !== "") {
              file.name = group + "$" + file.name;
            }
            file.content = result;
          });
        fileList.push(file);
      }
      //修改文件：针对不同的文件类型的文件，全部转化为json格式
      const fileContentList = await any2json(fileList);
      // const fileContentList = await xincmn2json(fileList);
      //const fileContentList = await any2json(fileList);
      for(let i=0; i<fileContentList.length; i++){
        fileList[i].content = fileContentList[i];
      }
      let task = Object.assign({},values,{taskfileList: fileList});
      //创建新任务
      await props.createNewTask({id: task.taskname});
      //创建文件
      let files = [];
      task.taskfileList.forEach(item => {
        files.push({id: item.name, content: item.content});
      });
      await props.createFiles(files);
      //添加文件
      let _files = [];
      task.taskfileList.forEach(item => {
        _files.push({tid: task.taskname, fid: item.name});
      });
      await props.addFiles(_files);
      //设置入库ID
      let __files = [];
      task.taskfileList.forEach(item => {
        __files.push({tid: task.taskname, fid: item.name, target: item.name});
      });
      await props.setFileTargets(__files);
      //设置审核员
      await props.setInspector({tid: task.taskname, uid: task.auditor});
      //添加标注员
      let annotators = [];
      task.annotator.forEach(item => {
        annotators.push({tid: task.taskname, uid: item});
      });
      await props.addAnnotators(annotators);
    }
    props.refresh();
    message.success("创建成功！");
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
        创建新任务
      </Button>
      <NewTaskCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
        users={props.users}
        rootsList={props.rootsList}
      />
    </div>
  );
};

class NewTask extends Component {

  render() {
    const { rootsList, refresh, createNewTask, createFiles, addFiles, setInspector, addAnnotators, setFileTargets } = this.props;

    return (
      <div>
        <NewTaskPage
          rootsList={rootsList}
          refresh={refresh}
          createNewTask={createNewTask}
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

const mapDispatchToProps = () => {
  return {
    createNewTask(taskname){
      return new Promise(async (resolve) => {
        await t_actionCreators.createNewTask(taskname);
        resolve();
      })
    },
    createFiles(files){
      return new Promise(async (resolve) => {
        await t_actionCreators.createFiles(files);
        resolve();
      })
    },
    addFiles(files){
      return new Promise(async (resolve) => {
        await t_actionCreators.addFiles(files);
        resolve();
      })
    },
    setFileTargets(files){
      return new Promise(async (resolve) => {
        await t_actionCreators.setFileTargets(files);
        resolve();
      });
    },
    setInspector(inspector){
      return new Promise(async (resolve) => {
        await t_actionCreators.setInspector(inspector);
        resolve();
      })
    },
    addAnnotators(annotators){
      return new Promise(async (resolve) => {
        await t_actionCreators.addAnnotators(annotators);
        resolve();
      })
    }
  }
};



export default connect(mapDispatchToProps)(NewTask);
