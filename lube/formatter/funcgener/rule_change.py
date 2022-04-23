#=====================这是修改了转换规则（关系转功能语用）之后的转换程序=================================================


def map_relation_to_function(labels_all, function_list_test):
    labels_all_res = []
    # f = open("/shijie/data/4/train/total_train_rule_samples.pkl", 'rb')
    # function_list_test = pickle.load(f)
    # f.close()
    # print(function_list_test)
    # print(len(function_list_test))
    # print(len(labels_all))
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
    labellist = []
    for tem in function_list_test:
        relation = tem[1]
        labellist.append(label2list_relation[relation])

    for i in range(len(labels_all)):
        if labels_all[i] == 9:
            labels_all_res.append(2)
            labels_all_res.append(1)
        elif labels_all[i] == 7:
            labels_all_res.append(1)
            labels_all_res.append(2)
        elif labels_all[i] == 13:
            labels_all_res.append(17)
            labels_all_res.append(18)
        elif labels_all[i] == 2:
            labels_all_res.append(18)
            labels_all_res.append(17)
        elif labels_all[i] == 6:
            labels_all_res.append(14)
            labels_all_res.append(15)
        elif labels_all[i] == 14:
            labels_all_res.append(15)
            labels_all_res.append(14)
        # elif labels_all[i] == 12 or labels_all[i] == 11 or labels_all[i] == 3 or labels_all[i] == 8 or
        elif labels_all[i] == 12:
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True:
                labels_all_res.append(6)
                labels_all_res.append(19)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(7)
                labels_all_res.append(19)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                labels_all_res.append(19)
            else:
                labels_all_res.append(5)
                labels_all_res.append(19)
        elif labels_all[i] == 11:
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True:
                labels_all_res.append(6)
                labels_all_res.append(16)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(7)
                labels_all_res.append(16)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                labels_all_res.append(16)
            else:
                labels_all_res.append(5)
                labels_all_res.append(16)
        elif labels_all[i] == 3:
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True:
                labels_all_res.append(6)
                labels_all_res.append(9)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(7)
                labels_all_res.append(9)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                labels_all_res.append(9)
            else:
                labels_all_res.append(5)
                labels_all_res.append(9)
        elif labels_all[i] == 8:  #======================
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True:
                labels_all_res.append(6)
                labels_all_res.append(13)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(7)
                labels_all_res.append(13)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                labels_all_res.append(13)
            else:
                labels_all_res.append(5)
                labels_all_res.append(13)
        elif labels_all[i] == 4:
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True:
                labels_all_res.append(6)
                labels_all_res.append(8)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(7)
                labels_all_res.append(8)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                labels_all_res.append(8)
            else:
                labels_all_res.append(5)
                labels_all_res.append(8)
        elif labels_all[i] == 5:
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True:
                labels_all_res.append(6)
                labels_all_res.append(12)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(7)
                labels_all_res.append(12)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                labels_all_res.append(12)
            else:
                labels_all_res.append(5)
                labels_all_res.append(12)
        elif labels_all[i] == 0 or labels_all[
                i] == 10:  #=================================================================================
            # if function_list_test[i][-4] == True and function_list_test[i][-3] == True:
            #     labels_all_res.append(7)
            #     labels_all_res.append(7)
            # elif function_list_test[i][-4] == False and function_list_test[i][-3] == False:
            #     labels_all_res.append(5)
            #     labels_all_res.append(5)
            # elif function_list_test[i][-4] == True and function_list_test[i][-3] == False:
            #     labels_all_res.append(3)
            #     labels_all_res.append(5)
            # else:
            #     labels_all_res.append(5)
            #     labels_all_res.append(3)
            if function_list_test[i][-8] == True:  #所有的孩子节点都为叶子
                labels_all_res.append(7)
                labels_all_res.append(7)
            elif function_list_test[i][-7] == True:  #所有的孩子节点都为内部节点
                labels_all_res.append(5)
                labels_all_res.append(5)
            else:
                if function_list_test[i][-4] == True:
                    labels_all_res.append(3)
                else:
                    labels_all_res.append(5)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(3)
                else:
                    labels_all_res.append(5)
        elif labels_all[i] == 1:
            if function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True and (
                        label2list_function[function_list_test[i][2]] == 11 or
                        label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(6)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(7)
                else:
                    labels_all_res.append(5)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == True and (
                        label2list_function[function_list_test[i][2]] != 11 and
                        label2list_function[function_list_test[i][2]] != 10):
                labels_all_res.append(0)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(7)
                else:
                    labels_all_res.append(5)
            elif function_list_test[i][-4] == True and function_list_test[i][
                    -2] == False:
                labels_all_res.append(11)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(7)
                else:
                    labels_all_res.append(5)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] == 11
                    or label2list_function[function_list_test[i][2]] == 10):
                labels_all_res.append(11)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(7)
                else:
                    labels_all_res.append(5)
            # else:
            #     labels_all_res.append(10)
            #     if function_list_test[i][-3] == True:
            #         labels_all_res.append(7)
            #     else:
            #         labels_all_res.append(5)
            elif function_list_test[i][-4] == False and (
                    label2list_function[function_list_test[i][2]] != 11
                    and label2list_function[function_list_test[i][2]] != 10
            ) and function_list_test[i][-10] == True:
                labels_all_res.append(10)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(7)
                else:
                    labels_all_res.append(5)
            else:
                labels_all_res.append(11)
                if function_list_test[i][-3] == True:
                    labels_all_res.append(7)
                else:
                    labels_all_res.append(5)

    # for i in range(len(labels_all_res)):
    #     if(labels_all_res[i] > 4):
    #         labels_all_res[i] = labels_all_res[i] -1

    return labels_all_res


# 下面代码在运行的时候要将上面的转换函数中
# for i in range(len(labels_all_res)):
#     if(labels_all_res[i] > 4):
#         labels_all_res[i] = labels_all_res[i] -1
# 的这个给注释掉

# import torch
# import torch.nn as nn
# import torch.nn.functional as F
# from torch.autograd import Variable
# from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
# import numpy as np
# import pickle
# from sklearn import metrics

# f = open("/shijie/data/4/train/total_train_rule_samples.pkl", 'rb')
# function_list_type = pickle.load(f)
# f.close()
# print(function_list_type[0])
# print(len(function_list_type))

# f = open("/shijie/data/4/test/total_test_rule_samples.pkl", 'rb')
# function_list_type = pickle.load(f)
# f.close()
# #print(function_list_test)
# print(len(function_list_type))  #653

# f = open("/shijie/data/4/valid/total_valid_rule_samples.pkl", 'rb')
# function_list_type = pickle.load(f)
# f.close()
# print(len(function_list_type)) #236

# label2list_relation = {'Joint': 0, 'Elaboration': 1, 'Purpose-Behavior': 2, 'Supplement': 3, 'Background': 4, 'Evaluation': 5, 'Statement-Illustration': 6,
#             'Result-Cause': 7, 'Summary': 8, 'Cause-Result': 9, 'Sequence': 10, 'Contrast': 11, 'Progression': 12, 'Behavior-Purpose': 13, 'Illustration-Statement': 14}

# label2list_function = {"Summary-Lead":0,"Result":1,"Cause":2,"Story-Situation":3,"NewsReport":4,"Story":5,"Lead":6,"Situation":7,"Background":8,
#         "Supplement":9,"Summary":10,"Sub-Summary":11,"Comment":12,"Sumup":13,"Statement":14,"Illustration":15,"Contrast":16,"Behavior":17,"Purpose":18,"Progression":19}

# relation_label_list = []   #存放训练集中所有样本的relation标签
# relation_child_functon = []
# for tem in function_list_type:
#     relation = tem[1]
#     # print(relation)
#     indexx = label2list_relation[relation]
#     # print(indexx)
#     relation_label_list.append(indexx)
#     relation_child_functon.append(label2list_function[tem[-6]])
#     relation_child_functon.append(label2list_function[tem[-5]])

# # # print(len(relation_label_list))
# relation_map_to_function = map_relation_to_function(relation_label_list , function_list_type)
# print(len(relation_map_to_function))
# print(len(relation_child_functon))

# # # print(relation_map_to_function[:10])
# # # print(relation_child_functon[:10])

# for i in range(len(relation_map_to_function)):
#     if relation_map_to_function[i] != relation_child_functon[i]:
#         print("==",i)

# print(function_list_type[234])
# print(relation_label_list[234])
# print("错的是：")
# print(relation_map_to_function[468])
# print(relation_map_to_function[469])
# print("对的是：")
# print(relation_child_functon[468])
# print(relation_child_functon[469])

# # print(function_list_type[2373])
# # print(relation_label_list[2373])
# # print("错的是：")
# # print(relation_map_to_function[4746])
# # print(relation_map_to_function[4747])
# # print("对的是：")
# # print(relation_child_functon[4746])
# # print(relation_child_functon[4747])

# # print(function_list_type[2241])
# # print(relation_label_list[2241])
# # print("错的是：")
# # print(relation_map_to_function[4482])
# # print(relation_map_to_function[4483])
# # print("对的是：")
# # print(relation_child_functon[4482])
# # print(relation_child_functon[4483])

# print(function_list_type[1858])
# print(relation_label_list[1858])
# print("错的是：")
# print(relation_map_to_function[3716])
# print(relation_map_to_function[3717])
# print("对的是：")
# print(relation_child_functon[3716])
# print(relation_child_functon[3717])

# print(function_list_type[1821])
# print(relation_label_list[1821])
# print("错的是：")
# print(relation_map_to_function[3642])
# print(relation_map_to_function[3643])
# print("对的是：")
# print(relation_child_functon[3642])
# print(relation_child_functon[3643])

# print(function_list_type[1491])
# print(relation_label_list[1491])
# print("错的是：")
# print(relation_map_to_function[2982])
# print(relation_map_to_function[2983])
# print("对的是：")
# print(relation_child_functon[2982])
# print(relation_child_functon[2983])

# print(function_list_type[1270])
# print(relation_label_list[1270])
# print("错的是：")
# print(relation_map_to_function[2540])
# print(relation_map_to_function[2541])
# print("对的是：")
# print(relation_child_functon[2540])
# print(relation_child_functon[2541])

# print(function_list_type[1135])
# print(relation_label_list[1135])
# print("错的是：")
# print(relation_map_to_function[2270])
# print(relation_map_to_function[2271])
# print("对的是：")
# print(relation_child_functon[2270])
# print(relation_child_functon[2271])