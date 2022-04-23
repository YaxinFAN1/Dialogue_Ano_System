import React, {Component, useState} from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { connect } from "react-redux";

import UploadButton from "../uploadButton";
import { readText, xincmn2json } from "../../utils/readfile";
import { actionCreators } from "../../Users/TMGT/store";




const F_EditionCreateForm = ({ visible, onCreate, onCancel, filename }) => {
  const [form] = Form.useForm();
  form.setFieldsValue({
    filename: filename,
  });
  return (
    <Modal
      visible={visible}
      title="修改"
      okText="确认"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
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
          filename: filename,
        }}
      >

        <Form.Item
          name="filename"
          label="新的文件名"
          rules={[
            {
              required: true,
              message: '填写符合约束的文件名',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="targetname"
          label="可选的入库语料名"
          rules={[
            {
              required: false,
              message: '填写符合约束的入库语料名',
            },
          ]}
        >
          <Input />
        </Form.Item>

        {/*<Form.Item
          name="group"
          label="可选的入库分组名"
          rules={[
            {
              required: false,
              message: '填写分组名',
            },
          ]}
        >
          <Input />
        </Form.Item>*/}

        <Form.Item
          name="choose_file"
          label="文件内容修改"
        >
          <UploadButton />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const F_EditionPage = (props) => {
  const [visible, setVisible] = useState(false); //定义初始状态
  const { currentTaskFile, refresh, renameTaskFile, setFileTargets, setRawContents } = props;

  const onCreate = async (values) => {
    let { filename, targetname, choose_file } = values;
   /* if(typeof group !== 'undefined'){
      if(typeof targetname === 'undefined'){
        targetname = currentTaskFile.targetname;
      }
      let split = targetname.split('$');
      if(split.length === 2){
        targetname = group + '$' + split[1];
      }
      else {
        targetname = group + '$' + targetname;
      }
    }*/
    if(typeof choose_file === 'undefined'){
      //修改文件名
      if(currentTaskFile.filename !== filename){
        await renameTaskFile({old_id: currentTaskFile.filename, new_id: filename});
      }
      if(typeof targetname !== 'undefined'){
        await setFileTargets([{tid: currentTaskFile.taskname, fid: filename, target: targetname}]);
      }
  }
    else if(choose_file.fileList.length > 1){
      message.error("最多选择一份生语料文件！");
      return ;
    }
    else{
      const taskFileList = choose_file.fileList;
      if(window.FileReader){
        let fileList = []; //所有读取并格式化好的文件对象会放在这里
        //把所有传过来的File对象拆开，格式化，包装成对象。
        for(let i=0; i<taskFileList.length; i++){
          let file = {name: null, content: null, filetype: ".xml"};
          await readText(taskFileList[i])
            .then((result) => {
              file.name = taskFileList[i].name;
              file.name = file.name.replace(".json","");
              file.name = file.name.replace(".xml","");
              file.content = result;
            });
          fileList.push(file);
        }
        const fileContentList = await xincmn2json(fileList);
        for(let i=0; i<fileContentList.length; i++){
          fileList[i].content = fileContentList[i];
        }
        //修改生语料内容
        await setRawContents([{id: filename, content: fileList[0].content}]);
      }
      //修改文件名
      if(currentTaskFile.filename !== filename){
        await renameTaskFile({old_id: currentTaskFile.filename, new_id: filename});
      }
      if(typeof targetname !== 'undefined'){
        await setFileTargets([{tid: currentTaskFile.taskname, fid: filename, target: targetname}]);
      }
    }
    message.success("修改成功！");
    const newTaskFile = Object.assign({},currentTaskFile,{filename: filename});
    setVisible(false);
    refresh(newTaskFile);
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
        }}
      >
        修改
      </Button>
      <F_EditionCreateForm
        filename={currentTaskFile.filename}
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class F_Edition extends Component {

  render() {
    const { currentTaskFile, refresh, renameTaskFile, setFileTargets, setRawContents } = this.props;
    return (
      <div>
        <F_EditionPage
          currentTaskFile={currentTaskFile}
          refresh={refresh}
          renameTaskFile={renameTaskFile}
          setFileTargets={setFileTargets}
          setRawContents={setRawContents}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    renameTaskFile(file){
      return new Promise(async (resolve) => {
        await actionCreators.renameTaskFile(file);
        resolve();
      })
    },
    setFileTargets(files){
      return new Promise(async (resolve) => {
        await actionCreators.setFileTargets(files);
        resolve();
      });
    },
    setRawContents(contents){
      return new Promise(async (resolve) => {
        await actionCreators.setRawContents(contents);
        resolve();
      })
    }
  }
};


export default connect(mapDispatchToProps)(F_Edition);
