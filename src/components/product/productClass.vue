<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }

  .ivu-radio {
    line-height: normal;
  }
</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>商品管理</BreadcrumbItem>
      <BreadcrumbItem>分类管理</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff'}">
      <Button @click="parentClass='无',parentId='',handleReset('formValidate'),id='',data='',addClass=true" type="primary" size="small"
              icon="ios-add">新增分类
      </Button>
      <Tree @on-select-change="selectTree()" style="margin-left: 40px" :data="data1" :render="renderContent"></Tree>
    </Content>

    <Modal v-model="addClass" width="380">
      <p slot="header">
        <span>{{this.id===''?'新增':'修改'}}类目</span>
      </p>
      <div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="上级类目" v-show="parentClass==='无'?false:true">
            <Input v-model="parentClass" disabled="disabled" placeholder="Enter your name"></Input>
          </FormItem>
          <FormItem label="类目编号" prop="categoryCode">
            <Input :disabled="this.id===''?false:true" v-model="formValidate.categoryCode" placeholder="Enter your num"></Input>
          </FormItem>
          <FormItem label="类目名称" prop="categoryName">
            <Input :maxlength="10" v-model="formValidate.categoryName" placeholder="Enter your name"></Input>
          </FormItem>
          <FormItem label="是否展示" prop="homeDisplay">
            <RadioGroup v-model="formValidate.homeDisplay">
              <Radio label="true" style="margin-right: 20px">是</Radio>
              <Radio label="false">否</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" @click="handleSubmit('formValidate')" long :loading="add_loading">{{id!==''?'修改':'添加'}}
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  export default {
    data() {
      // 类目标号校验是否重复
      const abovea = (rule, value, callback) => {
        if (value.length < 1) {
          callback(new Error('请填写分类编号'));
        } else {
          const _this = this;
          _this.Axios.get('/Manage/Category/validCategoryCode', {
            params: {
              id: _this.id!==''?_this.id:'',
              categoryCode: value,
            }
          }).then(res => {
            if (res.data.code === 0) {
              callback();
            } else {
              callback(new Error(res.data.message));
            }
          });
        }
      };
      return {
        parentClass: '无',
        id: '',
        data: '',
        parentId: '',
        treeLevel: '',
        addClass: false,
        add_loading: false,
        data1: [],
        formValidate: {
          categoryName: '',
          homeDisplay: 'true',
          categoryCode: ''
        },
        ruleValidate: {
          categoryName: [
            {required: true, message: '请填写分类名称', trigger: 'blur'}
          ],
          categoryCode: [
            {validator: abovea, required: true, trigger: 'change'}
          ],
        },
        buttonProps: {
          type: 'default',
          size: 'small',
        }
      }
    },
    methods: {
      // 获取分类树形结构
      treeList() {
        const _this = this;
        _this.Axios.get('/Manage/Category/treeList').then(res => {
          _this.data1 = res.data.data;
        })
      },

      // 添加分类
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.add_loading = true;
            _this.Axios.post('/Manage/Category/saveCategory', _this.Qs.stringify({
              id: _this.id!==''?_this.id:'',
              parentId: _this.parentId !== '' ? _this.parentId : '',
              name: _this.formValidate.categoryName,
              categoryName: _this.formValidate.categoryName,
              homeDisplay: _this.formValidate.homeDisplay,
              categoryCode: _this.formValidate.categoryCode,
            })).then(res => {
              if (res.data.code === 0) {
                _this.addClass = false;
                _this.append(_this.data, res.data.data);
                _this.$Message.success('success！');
              } else {
                _this.$Message.error(res.data.message)
              }
              _this.add_loading = false;
            });
          } else {
            _this.$Message.error('Fail!');
          }
        })
      },

      handleReset(name) {
        this.$refs[name].resetFields();
      },
      renderContent(h, {root, node, data}) {
        return h('span', {
          style: {
            display: 'inline-block',
            width: '100%'
          }
        }, [
          h('span', [
            h('Icon', {
              props: {
                type: 'ios-paper-outline'
              },
              style: {
                marginRight: '8px'
              }
            }),
            h('span', {
              style: {
                cursor: 'pointer',
              },
              on: {
                click: () => {
                  this.handleReset('formValidate');
                  this.addClass = true;
                  this.data = data;
                  this.parentClass = '无';
                  this.parentId = '';
                  this.id=data.id;
                  this.formValidate = {
                    categoryCode: data.categoryCode,
                    categoryName: data.title,
                    homeDisplay: String(data.homeDisplay)
                  };
                }
              }
            }, data.title)
          ]),
          h('span', {
            style: {
              display: 'inline-block',
              paddingLeft: '35px',
            }
          }, [
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                icon: 'ios-add'
              }),
              style: {
                marginRight: '8px',
                display: node.node.treeLevel === 3 ? 'none' : ''
              },
              on: {
                click: () => {
                  this.data = '';
                  this.id = '';
                  this.parentClass = '无';
                  this.parentId = '';
                  this.handleReset('formValidate');
                  this.parentClass = data.title;
                  this.addClass = true;
                  this.data = data;
                  this.parentId = data.id;
                  this.treeLevel = data.treeLevel;
                }
              }
            }),
            h('Poptip', {
              props: {
                title: '是否确定删除该分类',
                placement: "right",
                confirm: true
              },
              on: {
                'on-ok': () => {
                  const _this = this;
                  _this.Axios.post('/Manage/Category/deleteCategoryById', _this.Qs.stringify({
                    id: data.id
                  })).then(res => {
                    if (res.data.code === 0) {
                      _this.remove(root, node, data);
                      _this.$Message.success('删除成功')
                    } else {
                      _this.$Message.warning(res.data.message)
                    }
                  })
                }
              }
            }, [
              h('Button', {
                props: Object.assign({}, this.buttonProps, {
                  icon: 'ios-remove'
                }),
                on: {
                  click: () => {
                  }
                }
              })
            ])
          ])
        ]);
      },
      append(data, i) {
        const _this = this;
        if(_this.id!==''){
          _this.$set(data, 'title', _this.formValidate.categoryName);
          _this.$set(data, 'homeDisplay', _this.formValidate.homeDisplay);
        }else {
          if (data !== '') {
            const children = data.children || [];
            children.push(i);
            _this.$set(data, 'children', children);
          } else {
            _this.data1.push(i);
          }
        }
      },
      remove(root, node, data) {
        if (data.treeLevel === 1) {
          const index = this.data1.indexOf(data);
          this.data1.splice(index, 1);
        } else {
          const parentKey = root.find(el => el === node).parent;
          const parent = root.find(el => el.nodeKey === parentKey).node;
          const index = parent.children.indexOf(data);
          parent.children.splice(index, 1);
        }
      }
    },
    mounted() {
      this.treeList()
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }
</style>
