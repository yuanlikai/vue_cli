<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }

  .ivu-layout-content .ivu-input-group-small .ivu-input {
    height: 25px;
  }
</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>系统管理</BreadcrumbItem>
      <BreadcrumbItem>用户列表</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">
      <Row style="margin-bottom: 15px">
        <Col span="24">
          <Button type="primary" size="small" icon="ios-add" @click="addUser()">新增用户</Button>

          <Input @on-enter="getProduct" v-model="value13" style="width: 250px;float: right;margin-top: -1px;"
                 size="small">
            <Select @on-change="getProduct" v-model="pre" slot="prepend" style="width: 80px">
              <Option value="0">用户名</Option>
              <Option value="1">供应商</Option>
            </Select>
            <Button @click="getProduct" slot="append" icon="ios-search"></Button>
          </Input>
          <Select v-model="status" @on-change="getUser()" style="width:100px;float: right;margin-right: 20px"
                  size="small">
            <Option value="全部">全部</Option>
            <Option value="1">正常</Option>
            <Option value="0">锁定</Option>
          </Select>
          <span style="float: right;margin: 3px 4px 0 0">状态:</span>
          <Select v-model="roleId" @on-change="getUser()" style="width:100px;float: right;margin-right: 20px"
                  size="small">
            <Option v-for="item in roleList" :value="item.id" :key="item.id">{{item.roleName}}</Option>
          </Select>
          <span style="float: right;margin: 3px 4px 0 0">角色:</span>
        </Col>
      </Row>
      <Table :loading="loading" border ref="selection"
             :columns="columns1" height="592"
             :data="data1" size="small"></Table>

      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page @on-change="paging" :total="total" :page-size="14" show-elevator show-total/>
      </div>
    </Content>


    <Modal v-model="addAccount" width="300">
      <p slot="header">
        <Icon type="ios-information-circle"></Icon>
        <span>{{id===''?'添加':'修改'}}用户</span>
      </p>
      <div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="70">
          <FormItem v-if="userInfoType!=='SUPPLIER'" label="用户账号" prop="username">
            <Input :maxlength="36" v-model="formValidate.username" placeholder="请输入账号"></Input>
          </FormItem>
          <FormItem v-if="id===''" label="用户密码" prop="password">
            <Input :maxlength="25" type="password" v-model="formValidate.password" placeholder="请输入密码"></Input>
          </FormItem>
          <FormItem v-if="id===''" label="确认密码" prop="affirmPassword">
            <Input :maxlength="25" type="password" v-model="formValidate.affirmPassword" placeholder="请确认密码"></Input>
          </FormItem>
          <FormItem v-if="userInfoType!=='SUPPLIER'" label="角色绑定" prop="roleIds">
            <Select :disabled="userInfoType!=='SUPPLIER'?false:true" v-model="formValidate.roleIds" multiple>
              <Option v-for="item in cityList" :value="item.id" :key="item.id">{{ item.roleName }}</Option>
            </Select>
          </FormItem>
          <FormItem label="用户姓名" prop="name">
            <Input :maxlength="5" v-model="formValidate.name" placeholder="请确认姓名"></Input>
          </FormItem>
          <FormItem label="是否锁定" prop="statuss">
            <i-switch v-model="statuss">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="handleSubmit('formValidate')">
          {{id===''?'添加':'修改'}}
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  export default {
    data() {

      // 角色选择验证
      const juese = (rule, value, callback) => {
        if (value.length < 1) {
          callback(new Error('请选择角色'))
        } else {
          callback();
        }
      };

      // 检查密码是否一致
      const affirm = (rule, value, callback) => {
        if (value.length < 1) {
          callback(new Error('请输入确认密码'))
        } else if (this.formValidate.password !== value) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback();
        }
      };
      // 检测用户名是否重复
      const ctionUser = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('请填写用户名'))
        } else {
          _this.Axios.post('/Manage/UserInfo/checkUserName', _this.Qs.stringify({
            id: _this.id !== '' ? _this.id : '',
            username: _this.formValidate.username
          })).then(res => {
            if (res.data.code === 0) {
              callback();
            } else {
              callback(new Error(res.data.message))
            }
          })
        }
      };
      return {
        total: 0,
        start: 0,
        id: '',
        userInfoType: '',
        addAccount: false,
        modal_loading: false,
        formValidate: {
          roleIds: [],       //角色权限
          username: '',      //账号
          password: '',       //密码
          affirmPassword: '',
          name: '',            //用户姓名
          supplierId: this.$route.query.id,    //供应商id
        },
        ruleValidate: {
          username: [
            {validator: ctionUser, required: true, trigger: 'change'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'}
          ],
          affirmPassword: [
            {validator: affirm, required: true, trigger: 'blur'}
          ],
          roleIds: [
            {validator: juese, required: true, trigger: 'change'}
          ],
          name: [
            {required: true, message: '请输入姓名', trigger: 'change'}
          ],
        },

        pre: '0',
        roleName: '全部',
        roleList: [
          {
            id: '全部',
            roleName: '全部',
          }
        ],
        cityList: [],
        loading: true,
        status: '全部',
        statuss: false,
        roleId: '全部',
        value13: '',
        select3: '0',
        columns1: [
          {
            type: 'index',
            width: 50,
            align: 'center'
          },
          {
            title: '用户名',
            key: 'username',
          },
          {
            title: '姓名',
            key: 'name',
          },
          {
            title: '角色',
            key: 'roleNames',
          },
          {
            title: '供应商',
            tooltip: true,
            key: 'supplierName',
          },
          {
            title: '状态',
            key: 'status',
            render: (h, params) => {
              return h('p', params.row.status === '1' ? '正常' : '锁定')
            }
          },

          {
            title: '操作',
            align: 'center',
            minWidth: 55,
            maxWidth: 90,
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'ios-create',
                    size: '20'
                  },
                  style: {
                    cursor: 'pointer',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.id = params.row.id;
                      this.addAccount = true;
                      this.userInfoType = params.row.userInfoType;
                      this.formValidate.username = params.row.username;
                      this.formValidate.name = params.row.name;
                      this.formValidate.roleIds = params.row.roleIds;
                      this.statuss = params.row.status === '0' ? true : false;
                    }
                  }
                }),

                h('Poptip', {
                  props: {
                    confirm: true,
                    transfer: true,
                    placement: "top-end",
                    offset: 13,
                    title: '确定删除该角色？',
                  },
                  on: {
                    'on-ok': () => {
                      const _this = this;
                      _this.Axios.post('/Manage/UserInfo/deleteUsers', _this.Qs.stringify({
                        usernames: [params.row.username], // 用户账号数组
                        ids: [params.row.id],//用户id数组
                      }, {indices: false})).then(res => {
                        if (res.data.code === 0) {
                          _this.getUser();
                          _this.$Message.success('删除成功')
                        } else {
                          _this.$Message.error(res.data.message)
                        }
                      })
                    }
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'md-trash',
                      size: '20'
                    },
                    style: {
                      cursor: 'pointer',
                    }
                  })
                ])
              ])
            }
          }
        ],
        data1: [],
        like: '',
      }
    },
    methods: {


      // 用户分页
      paging(i) {
        this.start = i - 1;
        this.getUser();
      },

      // 添加弹窗
      addUser() {
        this.id = '';
        this.userInfoType = '';
        this.handleReset('formValidate');
        this.statuss = false;
        this.addAccount = true
      },

      // 用户名 供应商搜索
      getProduct() {
        const _this = this;
        this.like = this.value13;
        this.getUser()
      },

      // 获取用户列表
      getUser() {
        const _this = this;
        _this.loading = true;
        _this.Axios.post('/Manage/UserInfo/pageList', _this.Qs.stringify({
          start: _this.start,
          size: 14,
          usernameLike: _this.pre === '0' ? this.like : '',         //账号模糊查询
          supplierNameLike: _this.pre === '1' ? this.like : '',     //供应商名称模糊查询
          status: _this.status === '全部' ? '' : _this.status,               //是否锁定 "1"为正常 “0”为锁定
          roleId: _this.roleId === '全部' ? '' : _this.roleId,               //角色id
          userInfoType: '',         //用户类型 ADMIN("普通管理员"), SUPPLIER("供应商管理员"),
        })).then(res => {
          if (res.data.code === 0) {
            _this.data1 = res.data.data.content;
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.loading = false;
          _this.total = res.data.data.totalElements;
        })
      },

      // 获取角色列表
      getRole() {
        const _this = this;
        _this.Axios.get('/Manage/Role/list', {
          params: {
            excludeSuper: true,
          }
        }).then(res => {
          _this.roleList = _this.roleList.concat(res.data.data);
        })
      },

      // 获取角色列表
      cityRole() {
        const _this = this;
        _this.Axios.get('/Manage/Role/list', {
          params: {
            excludeSuper: true,
            supplierExclusive: false
          }
        }).then(res => {
          _this.cityList = res.data.data;
        })
      },

      // 添加用户
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.modal_loading = true;
            if (_this.id === '') {
              // 添加用户
              _this.Axios.post('/Manage/UserInfo/addUser', _this.Qs.stringify({
                status: _this.statuss === false ? '1' : '0',  //"0"为锁定 "1"为正常
                username: _this.formValidate.username,  //账号
                password: _this.formValidate.affirmPassword,  //密码
                name: _this.formValidate.name,   //用户姓名
                roleIdSet: _this.formValidate.roleIds,  //角色id素组
              }, {indices: false})).then(res => {
                if (res.data.code === 0) {
                  _this.addAccount = false;
                  _this.getUser();
                  _this.$Message.success('success')
                } else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading = false;
              })
            } else {
              // 更新用户
              _this.Axios.post('/Manage/UserInfo/updateUser', _this.Qs.stringify({
                id: _this.id,
                status: _this.statuss === false ? '1' : '0',  //"0"为锁定 "1"为正常
                username: _this.formValidate.username,  //账号
                name: _this.formValidate.name,   //用户姓名
                roleIdSet: _this.formValidate.roleIds,  //角色id素组
              }, {indices: false})).then(res => {
                if (res.data.code === 0) {
                  _this.addAccount = false;
                  _this.getUser();
                  _this.$Message.success('success')
                } else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading = false;
              })
            }
          } else {
            _this.$Message.error('有必填项未填写!');
          }
        })
      },
      handleReset(name) {
        this.$refs[name].resetFields();
      },
    },
    mounted() {
      this.cityRole();
      this.getRole();
      this.getUser();
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
