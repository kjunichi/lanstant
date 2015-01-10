echo "hello Atom Shell!"
# 自身のパスへ移動する。
cd $(cd $(dirname $0);pwd)
#pwd
# static/..
cd ../..
# runstant本体のビルド
git clone https://github.com/phi-jp/runstant.git
cd runstant
npm install -g grunt-cli
npm install
grunt
cd ..
mkdir static
cp -r runstant/release/alpha static

# CDNリソースの抽出

## js関連
mkdir static/cdn
cd static/cdn
cat ../../runstant/release/alpha/origin.html |perl -nle 'if(/=\"http(|s):\/\/(.*?)\"/){print "http".$1."://".$2}'|sort -u|tee ../../dlList.txt|wget -i - -nc -x

## css関連
pt -e "<link (.*?)href=(.*?)\.css(.*?)>" ../../runstant/release/alpha/origin.html|perl -nle 'if()/<link (.*?)http(|s):\/\/(.*?)\.css/){print "http".$2."://".$3."\.css"}'|sort -u|wget -i - -nc -x

cd ../..

# CDN補足分

## Ace
cd ./static/cdn
git clone https://github.com/ajaxorg/ace.git
cd ace
git checkout v1.1.5
npm install
node ./Makefile.dryice.js -m -nc
cd ..

## high.js
git clone https://github.com/phi-jp/high.git
cd ../..

# runstant本体のパスをローカスパスに置換する

## js分
### src="http(s):// -> src="/cdn/
perl -pi.js.bak -e 's/src=\"http(|s):\/\//src=\"\.\.\/cdn\//g' static/alpha/index.html
perl -pi.ace.bak -e 's/\/cdn\/cdn.jsdelivr.net\/ace\/1.1.5\/min/\/cdn\/ace\/build\/src-min-noconflict/g' static/alpha/index.html

## css分
perl -pi.css.bak -e 's/<link (.*?)http(|s):\/\/(.*?)\.css/<link $1\.\.\/cdn\/$3\.css/g' static/alpha/index.html

echo "build.sh done."
