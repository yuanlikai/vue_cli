<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
            <FormItem prop="account">
              <Input style="width: 269px;" @on-enter="handleSubmit('formInline')" type="text"
                     v-model="formInline.account" placeholder="Username">
                <Icon type="ios-person-outline" slot="prepend"></Icon>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input style="width: 269px;" @on-enter="handleSubmit('formInline')" type="password"
                     v-model="formInline.password" placeholder="Password">
                <Icon type="ios-lock-outline" slot="prepend"></Icon>
              </Input>
            </FormItem>
            <FormItem>
              <Button style="width: 269px;" type="primary" @click="handleSubmit('formInline')" :loading="loading">
                Signin
              </Button>
            </FormItem>
          </Form>
          <p class="login-tip">输入后台管理员用户名和密码即可</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: false,
        formInline: {
          account: '',
          password: ''
        },
        ruleInline: {
          account: [
            {required: true, message: 'Please fill in the user name', trigger: 'blur'}
          ],
          password: [
            {required: true, message: 'Please fill in the password.', trigger: 'blur'},
          ]
        }
      }
    },
    methods: {
      handleSubmit(name) {
        const _this = this;
        _this.loading = true;
        _this.$refs[name].validate((valid) => {
          if (valid) {

            _this.$router.push({
              name: 'product',
            });
          } else {
            _this.loading = false;
            _this.$Message.error('账号密码不能为空!');
          }
        })
      },
      getMayi(){
        const _this = this;
        _this.Axios.get('/search/扫毒2-first-asc-1').then(res=>{
          console.log(res)
        })
      }
    },
    mounted() {
      this.getMayi()
    }
  }
</script>

<style lang="less">
  .login {
    width: 100%;
    height: 100%;
    background-image: url('https://file.iviewui.com/admin-dist/img/login-bg.0899ffa6.jpg');
    background-size: cover;
    background-position: center;
    position: relative;

    &-con {
      position: absolute;
      right: 160px;
      top: 50%;
      transform: translateY(-60%);
      width: 300px;

      &-header {
        font-size: 16px;
        font-weight: 300;
        text-align: center;
        padding: 30px 0;
      }

      .form-con {
        padding: 10px 0 0;
      }

      .login-tip {
        font-size: 10px;
        text-align: center;
        color: #c3c3c3;
      }
    }
  }
</style>
