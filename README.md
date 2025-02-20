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
* 相册列表，不支持列表分页

- [x] 支持相册列表
- [ ] 支持第三方存储（对象存储等）
- [ ] 懒加载
- [x] 点击图片浏览

**相册根路径 在hexo根目录 _config.yml 中配置 gallery_dir 即可 默认为 galleries**

主题详细配置：（_config_dashed.yml）
```yaml
# 相册开关
gallery_enable: true
# type 目前支持两种 local 和 alist
# 按照存储类型组织相册
galleries:
  - type: local
    # 每个文件夹文件数量限制
    per_dir_limit: 2
    dirs:
        # blob匹配模式 注意images在source根目录，不需要/前缀
      - dir: images/blog/xxx*
        # path 相册路径，只写路径即可，不要/，比如例子中最终的访问路径就是 https://xxx.xx/galleries/localtest/
        path: localtest
        # 相册名称
        name: "本地存储"
        # 相册描述
        description: "sdfasdf"
  - type: alist
    # alist 服务地址 不用/结尾
    server: "xxx"
    # token 默认从环境变量中读取 注意token的安全性
    token: "${ALIST_TOKEN}"
    # 是否优先展示缩略图 默认false 根据情况选择，有些网盘的缩略图很糊
    thumb_first: true
    # 每个文件夹文件数量限制
    per_dir_limit: 50
    # 是否开启缓存，开启缓存注意token要有写入文件权限
    enable_cache: true
    # 缓存路径
    cache_dir: "/xxx/"
    # 缓存有效期，默认24h，测试中发现百度网盘的图片是大概这么长
    cache_duration: 86400
    # 是否忽略证书错误
    ignore_ssl_error: true
    # 文件匹配正则
    filters: ".svg$"
    dirs:
        # 同上
      - name: "xxx"
        # alist 路径，需要/结尾
        dir: "/xxx/"
        # 同local中的path
        path: xxx
        # 同上
        description: "xxxx"
```
