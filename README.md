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

## Copyright

优先从主题配置中读取，然后从文章中读取，字段均为 `copyright` 。

```
# 注意标签转义
copyright: 本站所有文章除特别声明外，均采用 <a href=\"https:\/\/creativecommons.org\/licenses\/by-nc-sa\/4.0\/\" target=\"_blank\">BY-NC-SA 4.0</a> 许可协议。转载请注明出处！
```

## Socials
用的fontawesome svg图标，合并放在 `/source/icons/fontawesome.svg`，就放了4个图标，需要再添加。

**如果使用了资源压缩插件，注意排除上面的svg文件，否则可能出问题，`hexo-yam`压缩之后就是空的**

```yml
socials:
    # 注意name需要和svg文件中的symbol id对应
  - url: "xxx"
    name: "github"
  - url: "xxx"
    name: "spotify"
  - url: "xxx"
    name: "bilibili"
  - url: "xxx"
    name: "email"
```

## Gallery

* 支持本地文件
* 支持Alist
  alist下生成的图片不管是本地还是云盘都是有时间限制的，所以需要自己根据情况设置有效期，定期刷新缓存。
* 展示单个相册页面
* 相册列表，不支持列表分页

- [x] 支持相册列表
- [ ] 支持第三方存储（对象存储等）
- [x] 支持Cloudflare R2存储
- [x] 支持百度相册
- [ ] 懒加载
- [x] 点击图片浏览

**相册根路径 在hexo根目录 _config.yml 中配置 gallery_dir 即可 默认为 galleries**

主题详细配置：（_config_dashed.yml）
```yaml
# 相册开关
gallery_enable: true
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
    # 每个文件夹文件数量限制
    per_dir_limit: 50
    # 是否开启缓存，开启缓存注意token要有写入文件权限
    enable_cache: true
    # 缓存路径
    cache_dir: "/xxx/"
    # 缓存有效期，默认24h，百度网盘8h
    cache_duration: 86400
    # 是否忽略证书错误
    ignore_ssl_error: true
    # 文件匹配正则
    filters: ".svg$"
    dirs:
        # 同上
      - name: "xxx"
        # 是否优先展示缩略图 默认false 根据情况选择，有些网盘的缩略图很糊
        thumb_first: true
        # alist 路径，需要/结尾
        dir: "/xxx/"
        # 同local中的path
        path: xxx
        # 同上
        description: "xxxx"
  - type: r2
    # Cloudflare账号id
    account_id: "${CF_ACCOUNT_ID}"
    # 下面2个都是r2页面存储桶的配置，在 https://dash.cloudflare.com/${ACCOUNT_ID}/r2/api-tokens 这里管理，不是在个人账号那里
    key_id: "${CF_R2_KEY_ID}"
    access_key: "${CF_R2_ACCESS_KEY}"
    # 自定义域名
    custom_domain: "xxx"
    # 存储桶
    bucket: "xx"
    # 上面的参数都是必填
    # 过滤器正则同alist
    filters: "jpg|png$"
    # 下面文件夹配置和alist相同
    dirs:
      - name: "xx"
        dir: "xxx"
        path: xxx
  - type: baiduphoto
    # 百度相册URL有效期 48h
    # 百度相册cookie，网页端访问获取
    cookie: "${BAIDU_PHOTO_COOKIE}"
    # 每个相册文件数量限制
    per_dir_limit: 50
    dirs:
      - name: "baiduphoto"
        # 同alist
        thumb_first: true
        # 百度相册id，打开相册URL https://photo.baidu.com/photo/web/album/xxx 后面的xxx就是相册id，是一串数字
        dir: "xxx"
        path: baiduphoto-test
```
