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

* 目前仅支持本地文件
* 展示单个相册

- [ ] 支持相册列表
- [ ] 支持第三方存储

主题详细配置：（_config_dashed.yml）
```yaml
# 相册根路径
gallery_path: "/galleries"
# name 相册名称
# path 相册路径，相对于上面路径，比如例子中最终的访问路径就是 https://xxx.xx/galleries/dali/
# files 文件匹配采用的是glob模式 目前仅支持本地文件 资源例子中的images文件夹是存放于source文件夹下的，不用添加 /
#       支持多个路径
galleries:
    - name: "大理"
      path: /dali/
      files:
        - images/blog/PXL_*
        - images/blog/favicon.svg
```