# Dashed

![Dashed Logo](https://raw.githubusercontent.com/sunnybyeon/hexo-theme-dashed/blog/source/cover.svg)

A simple theme for Hexo.

[Preview](https://sunnybyeon.github.io/hexo-theme-dashed) | [Docs](https://sunnybyeon.github.io/hexo-theme-dashed/categories/Documentation)

## Installation

```bash
cd path/to/hexo/blog
git clone https://github.com/sunnybyeon/hexo-theme-dashed themes/dashed
cd themes/dashed
npm install
```

And then modify the theme setting in `_config.yml`.

```YAML _config.yml
theme: dashed
```

## Gallery

* 支持本地文件
* 支持Alist
  alist下生成的图片不管是本地还是云盘都是有时间限制的，所以需要自己根据情况设置有效期，定期刷新缓存。
* 展示单个相册页面

- [ ] 支持相册列表
- [ ] 支持第三方存储（对象存储等）
- [ ] 懒加载
- [ ] 点击图片浏览

主题详细配置：（_config_dashed.yml）
```yaml
# 相册根路径
gallery_path: "/galleries"
# name 相册名称
# path 相册路径，相对于上面路径，比如例子中最终的访问路径就是 https://xxx.xx/galleries/dali/
# description 相册描述
# type 目前支持两种 local 和 alist
galleries:
  - name: "xxx"
    type: local
    description: "描述可以展示在相册页面"
    path: /dali/
    files:
        # blob匹配模式 注意images在source根目录，不需要/前缀
      - images/blog/PXL_202010*
  - name: "alist-test"
    type: alist
    description: ""
    path: /alist-test/
    # alist 服务地址 不用/结尾
    server: "xxx"
    # token 如果要开启缓存记得token有写入权限 默认从环境变量中读取 注意token的安全性
    token: "${ALIST_TOKEN}"
    # 是否优先展示缩略图 默认false 根据情况选择，有些网盘的缩略图很糊
    thumb_first: false
    dirs:
        # alist 路径 只读取第一级目录的文件，不处理子文件夹，还是需要/结尾
      - dir: "/xxx/"
        # 路径下文件数量限制
        limit: 50
        # 是否开启缓存，默认开启,开启则会在配置的路径下生成缓存的json图片文件地址。
        # 否则文件夹下图片太大或者路径背后是云盘的话会消耗较长时间解析
        cache: true
        # 上面缓存有效期，默认24h，测试中发现百度网盘的图片是大概这么长
        cache_duration: 86400
        # 路径下文件匹配正则 默认是 .(jpg|png|jpeg|bmp|svg)$
        filters: ".(svg)$"
    # 是否忽略证书错误 默认 false
    ignore_ssl_error: true
```