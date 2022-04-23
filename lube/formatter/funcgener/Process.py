import os

from bs4 import BeautifulSoup


def get_paragraph(xml_doc, IsTopicOnly=False):
    """

    :param filepath:
    :return:返回段落的字典，key是paragraphid，value是{'text':paragraph,'function':function}
    """
    paragraphdic = {}
    soup = BeautifulSoup(xml_doc, 'html.parser')
    paragraphs = soup.find_all('p')  # 找到所有的p标签
    for p in paragraphs:  # 只能以小写字母来找到相应的属性
        pid = int(p['id'])
        if IsTopicOnly:
            text = p['paragraphtopic'].strip()
        else:
            text = p.text.strip()
            #function = p['function'].strip()
        #paragraphdic[pid] = {'text': text, 'function': function}
        paragraphdic[pid] = text
    return paragraphdic


def get_relation_right_zjh(filepath, paragraph):
    #print(file_name)
    #paragraph_list=[paragraph[file_name][i]['text'] for i in paragraph[file_name]]
    paragraph_list = [paragraph[i] for i in paragraph]
    #print(paragraph_list)
    function_list = []
    with open(filepath, 'r', encoding='utf-8') as fr:
        xml_doc = fr.read()
    soup = BeautifulSoup(xml_doc, 'html.parser')
    discourse = soup.find('discourse')  # 找到所有的r标签
    headline = discourse.get('discoursetopic')
    relations = soup.find_all('r')  # 找到所有的r标签
    for r in relations:  # 只能以小写字母来找到相应的属性
        re_ = r['paragraphposition'].strip().split('|')
        relation = r['relationtype'].strip()
        center = r['center'].strip()
        #if len(re_)>2:
        paragraphs = []
        for i in re_:
            temp_paragraph = ''
            SE_list = i.split('...')
            start = int(SE_list[0])
            end = int(SE_list[1]) + 1
            for j in range(start - 1, end - 1):
                temp_paragraph += paragraph_list[j]
            paragraphs.append(temp_paragraph)
        p1, p2 = '', ''
        for i in range(len(re_) - 2, -1, -1):
            p1 = paragraphs[i]
            p2 = paragraphs[i + 1] + p2
            function_list.append([(p1, p2), relation, center, headline])
    return function_list


class Article:
    def __init__(self, file_path, out_path, name):
        self.type = type
        self.out_path = out_path
        p_dict = get_paragraph(file_path)
        r_list = get_relation_right_zjh(file_path, p_dict)
        # print(name)
        # print(r_list)
        txt_path = self.out_path + name
        self.write_into_txt(r_list, txt_path)

    def write_into_txt(self, r_list, txt_path):
        switch = {
            "Joint": "Coordination",
            "Sequence": "Coordination",
            "Progression": "Coordination",
            "Contrast": "Coordination",
            "Supplement": "Coordination",
            "Cause-Result": "Causality",
            "Result-Cause": "Causality",
            "Background": "Causality",
            "Behavior-Purpose": "Causality",
            "Purpose-Behavior": "Causality",
            "Elaboration": "Elaboration",
            "Summary": "Elaboration",
            "Evaluation": "Elaboration",
            "Statement-Illustration": "Elaboration",
            "Illustration-Statement": "Elaboration"
        }
        with open(txt_path + '/' + 'Arg1.txt', 'a', encoding='utf-8') as w:
            for l in r_list:
                w.write(l[0][0])
                w.write('\n')
        with open(txt_path + '/' + 'Arg2.txt', 'a', encoding='utf-8') as w:
            for l in r_list:
                w.write(l[0][1])
                w.write('\n')
        with open(txt_path + '/' + 'Relation.txt', 'a', encoding='utf-8') as w:
            for l in r_list:
                w.write(l[1])
                w.write('\n')
        with open(txt_path + '/' + 'Center.txt', 'a', encoding='utf-8') as w:
            for l in r_list:
                w.write(l[2])
                w.write('\n')
        with open(txt_path + '/' + 'Headline.txt', 'a', encoding='utf-8') as w:
            for l in r_list:
                w.write(l[3])
                w.write('\n')
        with open(txt_path + '/' + 'Bigrelation.txt', 'a',
                  encoding='utf-8') as w:
            for l in r_list:
                small = l[1]
                w.write(switch[small])
                w.write('\n')


class Mainprocess:
    def __init__(self, fold_id):
        self.fold_path = './' + str(fold_id)
        self.output_path = './output/' + str(fold_id) + '/'
        self.mainprocess()

    def get_xml_list(self, file_path):
        xml_path_list = []
        file_list = os.listdir(file_path)
        for i in file_list:
            i_path = file_path + '/' + i
            xml_path_list.append(i_path)
        # print(xml_path_list)
        return xml_path_list

    def mainprocess(self):
        #file_list = ['train', 'valid', 'test']
        file_list = ['train', 'test']
        for name in file_list:
            file_path = self.fold_path + '/' + name
            xml_list = self.get_xml_list(file_path)

            #print(xml_list)
            for xml_path in xml_list:
                article = Article(xml_path, self.output_path, name)
