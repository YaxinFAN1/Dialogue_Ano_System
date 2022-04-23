#coding:utf-8
#这边主要是生成列表文件，保存一些信息，便于进行功能语用标签的生成
import os
import pickle
import xml.dom.minidom
from collections import defaultdict
from xml.dom.minidom import Document

from bs4 import BeautifulSoup

from .Process import get_paragraph
from .rule_change import map_relation_to_function

# filepath = 'E:/shijie/480篇/XIN_CMN_19990101.0118.xml'
# paragraphdic = get_paragraph(filepath)

label2list_relation = {
    'Joint': 0,
    'Elaboration': 1,
    'Purpose-Behavior': 2,
    'Supplement': 3,
    'Background': 4,
    'Evaluation': 5,
    'Statement-Illustration': 6,
    'Result-Cause': 7,
    'Summary': 8,
    'Cause-Result': 9,
    'Sequence': 10,
    'Contrast': 11,
    'Progression': 12,
    'Behavior-Purpose': 13,
    'Illustration-Statement': 14
}

label2list_function = {
    "Summary-Lead": 0,
    "Result": 1,
    "Cause": 2,
    "Story-Situation": 3,
    "NewsReport": 4,
    "Story": 5,
    "Lead": 6,
    "Situation": 7,
    "Background": 8,
    "Supplement": 9,
    "Summary": 10,
    "Sub-Summary": 11,
    "Comment": 12,
    "Sumup": 13,
    "Statement": 14,
    "Illustration": 15,
    "Contrast": 16,
    "Behavior": 17,
    "Purpose": 18,
    "Progression": 19
}

index2str_function = {
    0: 'Summary-Lead',
    1: 'Result',
    2: 'Cause',
    3: 'Story-Situation',
    4: 'NewsReport',
    5: 'Story',
    6: 'Lead',
    7: 'Situation',
    8: 'Background',
    9: 'Supplement',
    10: 'Summary',
    11: 'Sub-Summary',
    12: 'Comment',
    13: 'Sumup',
    14: 'Statement',
    15: 'Illustration',
    16: 'Contrast',
    17: 'Behavior',
    18: 'Purpose',
    19: 'Progression'
}


def get_info(xml_doc):
    #传进来的参数paragraph是一个字典，key是段落id，value是段落文本
    paragraph_list = list(get_paragraph(xml_doc).values())
    soup = BeautifulSoup(xml_doc, 'html.parser')

    discourse = soup.find('discourse')  # 找到所有的r标签
    headline = discourse.get('discoursetopic')
    relations = soup.find_all('r')  # 找到所有的r标签
    paras = soup.find_all('p')  # 找到所有的p标签
    duanluoshu = len(paras)
    guanxishu = len(relations)

    function_dic = {
    }  #功能语用字典，保存例如： "1...3":5 ，表示1-3这个节点的功能语用标签是5，参照功能语用标签对应数字的映射

    root = '1' + '...' + str(duanluoshu)
    # print(root)
    function_dic[root] = 4  #对应NewsReport

    isnodearg1 = {}
    for r in relations:
        re_ = r['paragraphposition'].strip().split(
            '|')  #这里的re_大小不确定，可能是2，也有可能更大
        isnodearg1[re_[0]] = True
        for yuansu in re_[1:]:
            isnodearg1[yuansu] = False
    isnodearg1[root] = 'root'
    # print(isnodearg1)
    # print()

    myfather = {}
    for r in relations:
        re_ = r['paragraphposition'].strip().split(
            '|')  #这里的re_大小不确定，可能是2，也有可能更大
        father = ''
        first_SE_list = re_[0].split('...')  #大小为2的列表，i 类似 4...5，10...10
        father += first_SE_list[0]
        father += '...'
        last_SE_list = re_[-1].split('...')  #大小为2的列表，i 类似 4...5，10...10
        father += last_SE_list[1]
        for yuansu in re_:
            myfather[yuansu] = father
    # print(myfather)
    # print()

    def is_all_top_nodes_arg1(nodestr):
        father = myfather[nodestr]
        if isnodearg1[father] == False:
            return False
        if isnodearg1[father] == 'root':
            return True
        return is_all_top_nodes_arg1(father)

    # for item in myfather:
    #     print(item , ': ',is_all_top_nodes_arg1(item))

    leaf2depth = {}  #这里存放叶子节点对应的树高
    for r in relations:  # 只能以小写字母来找到相应的属性
        re_ = r['paragraphposition'].strip().split(
            '|')  #这里的re_大小不确定，可能是2，也有可能更大
        relation = r['relationtype'].strip()
        center = r['center'].strip()
        # function = r['function'].strip()
        function = None
        layer = int(r['layer'].strip())
        relation_id = int(r['id'].strip())

        is_all_child_leaf = True
        is_all_child_notleaf = True
        for i in re_:
            SE_list = i.split('...')  #大小为2的列表，i 类似 4...5，10...10
            if int(SE_list[0]) != int(SE_list[1]):  #说明此节点不为叶子节点
                is_all_child_leaf = False
                break
        for i in re_:
            SE_list = i.split('...')  #大小为2的列表，i 类似 4...5，10...10
            if int(SE_list[0]) == int(SE_list[1]):  #说明此节点为叶子节点
                is_all_child_notleaf = False
                break

        paragraphs = []
        is_leaf = []
        is_first_para = []
        for i in re_:
            temp_paragraph = ''
            SE_list = i.split('...')  #大小为2的列表，i 类似 4...5，10...10
            start = int(SE_list[0])
            end = int(SE_list[1]) + 1
            if int(SE_list[0]) == int(SE_list[1]):  #说明此节点为叶子节点
                leaf2depth[start] = layer + 1
                is_leaf.append(True)
            else:
                is_leaf.append(False)
            if int(SE_list[0]) == int(SE_list[1]) and int(SE_list[0]) == 1:
                is_first_para.append(True)
            else:
                is_first_para.append(False)
            for j in range(start - 1, end - 1):
                temp_paragraph += paragraph_list[j]
            paragraphs.append(temp_paragraph)

        # print("============================")
        p1, p2 = '', ''  #这里将多元关系转化为二元关系，非右连接，大小为2的滑动窗口才对
        for i in range(len(re_) - 1):
            # print('888: ',re_[i])
            p1 = paragraphs[i]
            p2 = paragraphs[i + 1]
            # leftchildfunction = nodefunction[re_[i]]
            # rightchildfunction = nodefunction[re_[i+1]]
            leftchildfunction = None
            rightchildfunction = None
            isleftchildleaf = is_leaf[i]
            isrightchildleaf = is_leaf[i + 1]
            isleftfirstpara = is_first_para[i]
            isrightfirstpara = is_first_para[i + 1]
            isleft_all_top_nodes_arg1 = is_all_top_nodes_arg1(re_[i])
            isright_all_top_nodes_arg1 = is_all_top_nodes_arg1(re_[i + 1])
            # function_list.append([(p1,p2), relation, function, center, layer, relation_id, headline,isleft_all_top_nodes_arg1,isright_all_top_nodes_arg1,is_all_child_leaf, is_all_child_notleaf
            #  ,leftchildfunction, rightchildfunction , isleftchildleaf , isrightchildleaf , isleftfirstpara , isrightfirstpara])
            if label2list_relation[relation] in [9, 7, 13, 2, 6, 14, 0, 10]:
                function_list = [[
                    (p1, p2), relation, function, center, layer, relation_id,
                    headline, isleft_all_top_nodes_arg1,
                    isright_all_top_nodes_arg1, is_all_child_leaf,
                    is_all_child_notleaf, leftchildfunction,
                    rightchildfunction, isleftchildleaf, isrightchildleaf,
                    isleftfirstpara, isrightfirstpara
                ]]
                labels_all = [label2list_relation[relation]]
                fun_labels = map_relation_to_function(labels_all,
                                                      function_list)
                # print(relation , label2list_relation[relation] , index2str_function[fun_labels[0]] , index2str_function[fun_labels[1]])
                function_dic[re_[i]] = fun_labels[0]
                function_dic[re_[i + 1]] = fun_labels[1]

    #==========================================================================================================================================
    while len(function_dic) < duanluoshu + guanxishu:
        # print(len(function_dic))
        leaf2depth = {}  #这里存放叶子节点对应的树高
        for r in relations:  # 只能以小写字母来找到相应的属性
            re_ = r['paragraphposition'].strip().split(
                '|')  #这里的re_大小不确定，可能是2，也有可能更大
            relation = r['relationtype'].strip()
            center = r['center'].strip()
            # function = r['function'].strip()
            function = None
            layer = int(r['layer'].strip())
            relation_id = int(r['id'].strip())

            is_all_child_leaf = True
            is_all_child_notleaf = True
            for i in re_:
                SE_list = i.split('...')  #大小为2的列表，i 类似 4...5，10...10
                if int(SE_list[0]) != int(SE_list[1]):  #说明此节点不为叶子节点
                    is_all_child_leaf = False
                    break
            for i in re_:
                SE_list = i.split('...')  #大小为2的列表，i 类似 4...5，10...10
                if int(SE_list[0]) == int(SE_list[1]):  #说明此节点为叶子节点
                    is_all_child_notleaf = False
                    break

            paragraphs = []
            is_leaf = []
            is_first_para = []
            for i in re_:
                temp_paragraph = ''
                SE_list = i.split('...')  #大小为2的列表，i 类似 4...5，10...10
                start = int(SE_list[0])
                end = int(SE_list[1]) + 1
                if int(SE_list[0]) == int(SE_list[1]):  #说明此节点为叶子节点
                    leaf2depth[start] = layer + 1
                    is_leaf.append(True)
                else:
                    is_leaf.append(False)
                if int(SE_list[0]) == int(SE_list[1]) and int(SE_list[0]) == 1:
                    is_first_para.append(True)
                else:
                    is_first_para.append(False)
                for j in range(start - 1, end - 1):
                    temp_paragraph += paragraph_list[j]
                paragraphs.append(temp_paragraph)

            p1, p2 = '', ''  #这里将多元关系转化为二元关系，非右连接，大小为2的滑动窗口才对
            for i in range(len(re_) - 1):
                if label2list_relation[relation] in [
                        9, 7, 13, 2, 6, 14, 0, 10
                ]:
                    continue
                p1 = paragraphs[i]
                p2 = paragraphs[i + 1]
                # leftchildfunction = nodefunction[re_[i]]
                # rightchildfunction = nodefunction[re_[i+1]]
                leftchildfunction = None
                rightchildfunction = None
                isleftchildleaf = is_leaf[i]
                isrightchildleaf = is_leaf[i + 1]
                isleftfirstpara = is_first_para[i]
                isrightfirstpara = is_first_para[i + 1]
                isleft_all_top_nodes_arg1 = is_all_top_nodes_arg1(re_[i])
                isright_all_top_nodes_arg1 = is_all_top_nodes_arg1(re_[i + 1])
                # function_list.append([(p1,p2), relation, function, center, layer, relation_id, headline,isleft_all_top_nodes_arg1,isright_all_top_nodes_arg1,is_all_child_leaf, is_all_child_notleaf
                #  ,leftchildfunction, rightchildfunction , isleftchildleaf , isrightchildleaf , isleftfirstpara , isrightfirstpara])
                if myfather[re_[i]] in function_dic:
                    function = index2str_function[function_dic[myfather[
                        re_[i]]]]
                    function_list = [[
                        (p1, p2), relation, function, center, layer,
                        relation_id, headline, isleft_all_top_nodes_arg1,
                        isright_all_top_nodes_arg1, is_all_child_leaf,
                        is_all_child_notleaf, leftchildfunction,
                        rightchildfunction, isleftchildleaf, isrightchildleaf,
                        isleftfirstpara, isrightfirstpara
                    ]]
                    labels_all = [label2list_relation[relation]]
                    fun_labels = map_relation_to_function(
                        labels_all, function_list)
                    # print(relation , label2list_relation[relation] , index2str_function[fun_labels[0]] , index2str_function[fun_labels[1]])
                    function_dic[re_[i]] = fun_labels[0]
                    function_dic[re_[i + 1]] = fun_labels[1]

    # print('=================================')
    # print(function_dic)
    for item in function_dic:
        str_f = index2str_function[function_dic[item]]
        # print(item, ': ', str_f)
    # print(len(function_dic))

    #===================================================================================================================
    discourse = soup.find('discourse')  # 找到所有的r标签
    lead = soup.find('lead')
    abstract = soup.find('abstract')
    headline = discourse.get('discoursetopic')
    relations = soup.find_all('r')  # 找到所有的r标签
    paras = soup.find_all('p')  # 找到所有的p标签

    doc = Document()
    root = doc.createElement('doc')
    doc.appendChild(root)

    discourse_node = doc.createElement('DISCOURSE')
    discourse_node.setAttribute("Dateline", discourse["dateline"])
    discourse_node.setAttribute("DiscourseTopic", discourse["discoursetopic"])

    lead_node = doc.createElement('LEAD')
    lead_node_text = doc.createTextNode(lead.text.strip())  #元素内容写入
    lead_node.appendChild(lead_node_text)
    discourse_node.appendChild(lead_node)

    abstract_node = doc.createElement('ABSTRACT')
    abstract_node_text = doc.createTextNode(abstract.text.strip())  #元素内容写入
    abstract_node.appendChild(abstract_node_text)
    discourse_node.appendChild(abstract_node)

    relation_node = doc.createElement('RELATION')
    for r in relations:
        r_node = doc.createElement('R')
        r_node.setAttribute("ID", r["id"])
        r_node.setAttribute("StructureType", r["structuretype"])
        r_node.setAttribute("Layer", r["layer"])
        # r_node.setAttribute("RelationNumber", r["relationnumber"])
        r_node.setAttribute("RelationType", r["relationtype"])
        r_node.setAttribute("ParagraphPosition", r["paragraphposition"])
        r_node.setAttribute("Center", r["center"])
        r_node.setAttribute("ChildList", r["childlist"])
        r_node.setAttribute("ParentId", r["parentid"])
        # r_node.setAttribute("RelationWeight", r["relationweight"])
        re_ = r["paragraphposition"].strip().split("|")
        str1 = re_[0]
        str2 = re_[-1]
        SE1_list = str1.split('...')
        SE2_list = str2.split('...')
        s1 = SE1_list[0]
        s2 = SE2_list[1]
        r_node.setAttribute("Function",
                            index2str_function[function_dic[s1 + '...' + s2]])
        relation_node.appendChild(r_node)

    text_node = doc.createElement('TEXT')
    for p in paras:
        p_node = doc.createElement('P')
        p_node.setAttribute("ID", p["id"])
        p_node.setAttribute("ParagraphTopic", p["paragraphtopic"])
        # p_node.setAttribute("ParagraphWeight", p["paragraphweight"])
        myid = p["id"]
        p_node.setAttribute(
            "Function", index2str_function[function_dic[myid + '...' + myid]])
        p_node_text = doc.createTextNode(p.text.strip())  #元素内容写入
        p_node.appendChild(p_node_text)
        text_node.appendChild(p_node)

    root.appendChild(discourse_node)
    root.appendChild(relation_node)
    root.appendChild(text_node)

    return doc.toxml(encoding="utf-8")
