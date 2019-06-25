<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }
</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>供应商管理</BreadcrumbItem>
      <BreadcrumbItem>用户管理</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">
      <Button @click="showadd" type="primary" size="small" style="margin-bottom: 15px">新增账号</Button>
      <Table border :columns="columns1" :loading="loading" :data="data1" size="small" height="592"></Table>

      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page @on-change="paging" :total="total" :page-size="14" show-elevator show-total/>
      </div>
    </Content>

    <Modal v-model="addAccount" width="300">
      <p slot="header">
        <Icon type="ios-information-circle"></Icon>
        <span>{{id===''?'新增':'修改'}}账号</span>
      </p>
      <div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="50">
          <FormItem v-if="id===''" label="账号" prop="username">
            <Input :maxlength="36" v-model="formValidate.username" placeholder="请输入账号"></Input>
          </FormItem>
          <FormItem v-if="id===''" label="密码" prop="password">
            <Input :maxlength="25" type="password" v-model="formValidate.password" placeholder="请输入密码"></Input>
          </FormItem>
          <FormItem v-if="id===''" label="确认密码" prop="qrpassword">
            <Input :maxlength="25" type="password" v-model="formValidate.qrpassword" placeholder="请确认密码"></Input>
          </FormItem>
          <FormItem label="角色" prop="roleIds">
            <Select v-model="formValidate.roleIds" multiple>
              <Option v-for="item in cityList" :value="item.id" :key="item.id">{{ item.roleName }}</Option>
            </Select>
          </FormItem>
          <FormItem label="姓名" prop="name">
            <Input :maxlength="5" v-model="formValidate.name" placeholder="请输入姓名"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="handleSubmit('formValidate')">{{id===''?'添加':'修改'}}</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  export default {
    data() {

      // 题图上传校验
      const juese = (rule, value, callback) => {
        if(value.length<1){
          callback(new Error('请选择角色'))
        }else {
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
            id: _this.id!==''?_this.id:'',
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
        total:0,
        start:0,
        id:'',
        loading:true,
        modal_loading:false,
        addAccount:false,
        cityList:[],
        columns1: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '姓名',
            key: 'name'
          },
          {
            title: '账号',
            key: 'username'
          },
          {
            title: '性别',
            render:(h,params)=>{
              return h('p',params.row.sex.name)
            }
          },
          {
            title: '角色',
            key: 'roleNames'
          },

          {
            title: '操作',
            minWidth: 80,
            maxWidth: 100,
            align: 'center',
            render: (h, params) => {
              return h('div',[
                h('Icon', {
                  props: {
                    type: 'ios-create',
                    size:'20',
                  },
                  style:{
                    cursor:'pointer',
                    marginRight:'5px'
                  },
                  on: {
                    click: () => {
                      const _this = this;
                      _this.addAccount=true;
                      this.id=params.row.id;
                      _this.formValidate.name=params.row.name;
                      _this.formValidate.roleIds=params.row.roleIds;
                    }
                  }
                }),
                h('Poptip',{
                  props:{
                    confirm:true,
                    transfer:true,
                    placement:"top-end",
                    offset:13,
                    title:'确定删除该账号？',
                  },
                  on:{
                    'on-ok':()=>{
                      const _this = this;
                      _this.Axios.post('/Manage/Supplier/deletedSupplierUser',_this.Qs.stringify({
                        id:params.row.id
                      })).then(res=>{
                        if(res.data.code===0){
                          _this.getAccount();
                        }else {
                          _this.$Message.error(res.data.message)
                        }
                      })
                    }
                  }
                },[
                  h('Icon', {
                    props: {
                      type: 'md-trash',
                      size:'20'
                    },
                    style:{
                      cursor:'pointer',
                    }
                  })
                ])
              ])
            }
          }
        ],
        data1: [],

        formValidate: {
          roleIds:[],       //角色权限
          name:'',          //用户姓名
          username:'',      //账号
          password:'',       //密码
          supplierId:this.$route.query.id,    //供应商id，
          qrpassword:''
        },
        ruleValidate: {
          name: [
            {required: true, message: '请输入姓名', trigger: 'blur'}
          ],
          username: [
            {validator: ctionUser,required: true, trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'}
          ],
          qrpassword: [
            {validator: affirm,required: true, trigger: 'blur'}
          ],
          roleIds: [
            {validator: juese,required: true,  trigger: 'blur'}
          ],
        }
      }
    },
    methods: {
      showadd(){
        this.id='';
        this.addAccount=true;
        this.handleReset('formValidate');
      },

      //
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.modal_loading=true;
            if(_this.id===''){
              _this.Axios.post('/Manage/Supplier/insertSupplierUserInfo',_this.Qs.stringify({
                roleIds:_this.formValidate.roleIds,       //角色权限
                name:_this.formValidate.name,          //用户姓名
                username:_this.formValidate.username,      //账号
                password:_this.formValidate.password,       //密码
                supplierId:_this.formValidate.supplierId,    //供应商id
              },{ indices: false })).then(res=>{
                if(res.data.code===0){
                  _this.$Message.success('success');
                  _this.getAccount();
                  _this.addAccount=false
                }else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading=false;
              })
            }else {
              _this.Axios.post('/Manage/Supplier/updateSupplierUserInfo',_this.Qs.stringify({
                id:_this.id,
                roleIds:_this.formValidate.roleIds,       //角色权限
                name:_this.formValidate.name,          //用户姓名
              },{ indices: false })).then(res=>{
                if(res.data.code===0){
                  _this.$Message.success('success');
                  _this.getAccount();
                  _this.addAccount=false
                }else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading=false;
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

      // 获取管理员用户列表
      getAccount(){
        const _this = this;
        _this.loading=true;
        _this.Axios.get('/Manage/Supplier/supplierUserInfoPageList',{
          params:{
            start: _this.start,
            size: 14,
          }
        }).then(res=>{
          if(res.data.code===0){
            _this.data1=res.data.data.content
          }else {
            _this.$Message.error(res.data.message)
          }
          _this.loading=false;
          _this.total = res.data.data.totalElements;
        })
      },

      // 获取角色下拉
      getU(){
        const _this = this;
        _this.Axios.post('/Manage/Role/supplierRoleList').then(res=>{
          _this.cityList=res.data.data
        })
      },

      // 订单分页
      paging(i) {
        this.start = i - 1;
        this.getAccount();
      },
    },
    mounted() {
      this.getAccount();
      this.getU()
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
