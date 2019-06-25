<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }
</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>供应商管理</BreadcrumbItem>
      <BreadcrumbItem v-if="!$route.query.id">添加供应商</BreadcrumbItem>
      <BreadcrumbItem v-else>修改《{{$route.query.supplierName}}》供应商</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="90">
        <Row :gutter="100" style="max-width:930px">
          <Spin size="large" fix v-if="spinShow"></Spin>
          <Col span="12" style="position: relative;">
            <FormItem label="供应商名称" prop="supplierName">
              <Input :maxlength="40" v-model="formValidate.supplierName" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="供应商编号" prop="supplierNo">
              <Input :maxlength="10" :disabled="$route.query.id?true:false" v-model="formValidate.supplierNo"
                     placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="省市区" prop="city">
              <Cascader @on-change="selectCity" :data="cityData" v-model="formValidate.city"
                        :loading="loadingCity"></Cascader>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="详细地址" prop="address">
              <Input :maxlength="50" v-model="formValidate.address" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="固定电话" prop="tel">
              <Input :maxlength="18" v-model="formValidate.tel" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="邮箱" prop="liaisonEmail">
              <Input :maxlength="36" v-model="formValidate.liaisonEmail" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="联系人" prop="liaisonName">
              <Input :maxlength="10" v-model="formValidate.liaisonName" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="手机号" prop="liaisonPhone">
              <Input :maxlength="11" @on-keyup="formValidate.liaisonPhone=formValidate.liaisonPhone.replace(/\D/g,'')"
                     v-model="formValidate.liaisonPhone" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="备用联系人" prop="standbyLiaisonName">
              <Input :maxlength="10" v-model="formValidate.standbyLiaisonName" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="备用手机号" prop="standbyLiaisonPhone">
              <Input :maxlength="11"
                     @on-keyup="formValidate.standbyLiaisonPhone=formValidate.standbyLiaisonPhone.replace(/\D/g,'')"
                     v-model="formValidate.standbyLiaisonPhone" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="备用邮箱" prop="standbyLiaisonEmail">
              <Input :maxlength="36" v-model="formValidate.standbyLiaisonEmail" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="备注" prop="remark">
              <Input :maxlength="60" v-model="formValidate.remark" type="textarea" placeholder="请填写"></Input>
            </FormItem>
          </Col>

        </Row>
        <FormItem>
          <Button type="primary" :loading="loading" @click="handleSubmit('formValidate')">Submit</Button>
        </FormItem>
      </Form>
    </Content>

  </div>
</template>
<script>

  export default {


    data() {

      // 供应商名称校验
      const supplierName = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('供应商名称不能为空'));
        } else {
          _this.Axios.get('/Manage/Supplier/validSupplierName', {
            params: {
              id: _this.$route.query.id ? _this.$route.query.id : '',
              supplierName: _this.formValidate.supplierName
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

      // 供应商编号校验
      const supplierNo = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('供应商编号不能为空'));
        } else {
          _this.Axios.get('/Manage/Supplier/validSupplierNo', {
            params: {
              id: _this.$route.query.id ? _this.$route.query.id : '',
              supplierNo: _this.formValidate.supplierNo
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

      // 省市区校验
      const city = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('请选择省市区'));
        } else {
          callback();
        }
      };

      // 手机号码校验
      const liaisonPhone = (rule, value, callback) => {
        const _this = this;
        if (rule.field === 'liaisonPhone') {
          if (value.length < 1) {
            callback(new Error('手机号码不能为空'));
          } else if (!(/^1[34578]\d{9}$/.test(value))) {
            callback(new Error('手机号格式有误'));
          } else {
            callback();
          }
        } else {
          if (value.length > 0) {
            if (!(/^1[34578]\d{9}$/.test(value))) {
              callback(new Error('手机号格式有误'));
            } else {
              callback();
            }
          } else {
            callback();
          }
        }
      };

      return {
        cityData: [],
        loadingCity: true,
        spinShow: true,
        loading: false,
        formValidate: {
          supplierName: '',         // 供应商标题
          supplierNo: '',           // 供应商编号
          city: [],                 // 省市区
          address: '',              // 详细地址
          tel: '',                  // 固定电话
          liaisonEmail: '',         // 联系邮箱
          liaisonName: '',          // 联系人名
          liaisonPhone: '',         // 联系人手机号
          standbyLiaisonName: '',   // 备用联系人
          standbyLiaisonPhone: '',  // 备用联系人手机号
          standbyLiaisonEmail: '',  // 备用联系人邮箱
          remark: ''                // 备注
        },
        ruleValidate: {
          supplierName: [
            {validator: supplierName, required: true, trigger: 'blur'}
          ],

          supplierNo: [
            {validator: supplierNo, required: true, trigger: 'blur'}
          ],

          city: [
            {validator: city, required: true, trigger: 'change'}
          ],
          address: [
            {required: true, message: '详细地址不能为空', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '固定电话不能为空', trigger: 'blur'}
          ],
          liaisonEmail: [
            {required: true, message: '邮箱不能为空', trigger: 'blur'},
            {type: 'email', message: '请输入正确邮箱', trigger: 'blur'}
          ],
          liaisonName: [
            {required: true, message: '联系人不能为空', trigger: 'blur'}
          ],
          liaisonPhone: [
            {validator: liaisonPhone, required: true, trigger: 'blur'}
          ],
          standbyLiaisonPhone: [
            {validator: liaisonPhone, trigger: 'blur'}
          ],
        }
      }
    },
    watch:{
      $route(){
        this.handleReset('formValidate')
      }
    },
    methods: {

      // 添加修改产品
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.Axios.post('/Manage/Supplier/saveSupplier', _this.Qs.stringify({
              id: _this.$route.query.id ? _this.$route.query.id : '',
              supplierName: _this.formValidate.supplierName,
              supplierNo: _this.formValidate.supplierNo,
              provinceId: _this.formValidate.city[0].value,
              cityId: _this.formValidate.city[1].value,
              districtId: _this.formValidate.city[2].value,
              province: _this.formValidate.city[0].label,
              city: _this.formValidate.city[1].label,
              district: _this.formValidate.city[2].label,
              address: _this.formValidate.address,
              tel: _this.formValidate.tel,
              liaisonEmail: _this.formValidate.liaisonEmail,
              liaisonName: _this.formValidate.liaisonName,
              liaisonPhone: _this.formValidate.liaisonPhone,
              standbyLiaisonName: _this.formValidate.standbyLiaisonName,
              standbyLiaisonPhone: _this.formValidate.standbyLiaisonPhone,
              standbyLiaisonEmail: _this.formValidate.standbyLiaisonEmail,
              remark: _this.formValidate.remark,
            })).then(res => {
              if (res.data.code === 0) {
                _this.$Message.success('success');
                _this.$router.push('/supplierList')
              } else {
                _this.$Message.error(res.data.message)
              }
            })
          } else {
            _this.$Message.error('有必填项未填写!');
          }
        })
      },

      // 获取地址三级联动
      getCity() {
        const _this = this;
        _this.Axios.get('/Manage/Areas/treeList').then(res => {
          _this.cityData = res.data.data;
        })
      },

      // 获取供应商详情
      getDetail() {
        const _this = this;
        _this.Axios.get('/Manage/Supplier/supplierById', {
          params: {
            id: _this.$route.query.id
          }
        }).then(res => {
          if (res.data.code === 0) {
            _this.formValidate = {
              supplierName: res.data.data.supplierName,
              supplierNo: res.data.data.supplierNo,
              address: res.data.data.address,
              tel: res.data.data.tel,
              liaisonEmail: res.data.data.liaisonEmail,
              liaisonName: res.data.data.liaisonName,
              liaisonPhone: res.data.data.liaisonPhone,
              standbyLiaisonName: res.data.data.standbyLiaisonName,
              standbyLiaisonPhone: res.data.data.standbyLiaisonPhone,
              standbyLiaisonEmail: res.data.data.standbyLiaisonEmail,
              remark: res.data.data.remark,
              city: [res.data.data.provinceId, res.data.data.cityId, res.data.data.districtId]
            };

          } else {
            _this.$Message.success(res.data.message)
          }
          _this.spinShow = false;
        })
      },

      selectCity(value, selectedData) {
        this.formValidate.city = selectedData;
      },

      handleReset(name) {
        this.$refs[name].resetFields();
      },

    },
    mounted() {
      this.getCity();
      this.$route.query.id ? this.getDetail() : this.spinShow = false;

    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
