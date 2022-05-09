# run it with sudo or using root user

apt update && apt upgrade -y

apt install git mysql-server -y
mysql -e "create database lube; create user lube@localhost identified by 'fd5b6580901f5ba3a2a23d28be45a8cb'; grant all privileges on *.* to lube@localhost; flush privileges;"
 #新token
git clone https://linjiaze-linjiaze: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@github.com/superial1/Dialogue_Ano_System.git

cd Dialogue_Ano_System/lube

apt install python3-pip -y
pip3 install flask python-dotenv sqlalchemy flask_login flask_sqlalchemy pymysql bs4 -i https://pypi.tuna.tsinghua.edu.cn/simple

nohup python3 -m flask run &
sleep 25s
mysql -e "use lube; insert into user(id, pw_hash) values('admin', 'pbkdf2:sha256:260000\$tIhoj8EeijDGraJZ\$bd6bd7497acbf72c3dff28a3d486ebe8fef3505ce52f5056f8a55a048acd48ce');"
mysql -e "use lube; insert into user_priv(uid, pid) values('admin', 'B9bUFFb3VuslaBhI'),('admin', 'B9bUFFkkkVuslaBh'),('admin', 'B9bUkse3VuslaBhI'),('admin', 'bbebdaag0gFdS9zv'),('admin', 'bbebdBag0gFjS9zv'),('admin', 'bFGvGdoBxgCi9qTI'),('admin', 'bFGvGeoBxgC39qTI'),('admin', 'd3YNTcU2UlyqbNTc'),('admin', 'd3YNThU2UlyIbNTc'),('admin', 'Hw213MpvhthM18HW'),('admin', 'kNKLgjX5mRAtsF1k'),('admin', 'MeHtX5ziqXYFqsZe'),('admin', 'MeHtX5ziqXYFvBZe'),('admin', 'MekxX5ziqXYFvBZe'),('admin', 'OG8xriafxRivmTwP'),('admin', 'oHSwzmthd7jiqfqq'),('admin', 'oHSwzmthd7jiSfqq'),('admin', 'oOfUyJvoV0v6ZnAW'),('admin', 'oOfUyJvqV0v6ZlAW'),('admin', 'QbByIZVjk6MPklMB'),('admin', 'UBQb1oTHsbwqEJCG'),('admin', 'W1SPvCCWvX9p9MFB'),('admin', 'XQN8rVYaqlZUmD9s'),('admin', 'ZKV5lgfdpaZ2Mpn4'),('admin', 'ZKVRlgfdpAZ2Mpn4');"

cd ../site_v2

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt install -y nodejs

npm i -g yarn --registry=https://registry.npm.taobao.org
yarn install

echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sysctl -p

echo '系统部署完毕。'
echo '默认端口：3000'
echo '默认账号：admin，密码：admin。'
echo '准备启动...'
sleep 10s

yarn start