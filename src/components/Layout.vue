<style scoped>
  .layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }

  .layout-logo {
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
  }

  .layout-nav {
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
  }

  .ivu-icon {
    line-height: 1.5;
  }
</style>
<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu mode="horizontal" theme="dark" active-name="1" @on-select="returnUser">
          <div class="layout-logo"></div>
          <div class="layout-nav">
            <Submenu name="1" style="float: right;">
              <template slot="title">
                <Icon type="logo-octocat"/>
                {{user}}
              </template>
              <MenuItem name="1-1">退出</MenuItem>
            </Submenu>
          </div>
        </Menu>
      </Header>
      <Layout>
        <Sider hide-trigger :style="{background: '#fff'}">
          <Menu v-if="menu" :active-name="activeName" theme="light" width="auto"
                :open-names="activeName.split('-').splice(0,1)"
                @on-select="Menu">
            <MenuItem name="1-1">
              <Icon type="ios-analytics"></Icon>
              <span>订单管理</span>
            </MenuItem>
          </Menu>
        </Sider>
        <Layout :style="{padding: '0 24px 24px'}">
          <router-view></router-view>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        menu: false,
        menuList: [],
        user: localStorage.getItem('user'),
        activeName: !sessionStorage.getItem('Menu') ? '1' : sessionStorage.getItem('Menu')
      }
    },
    methods: {
      // 根据用户显示菜单
      getMenu() {
        const _this = this;
        _this.Axios.get('/Manage/Menu/getUserMenu').then(res => {
          if (res.data.code === 0) {
            _this.menuList = res.data.data;
            _this.menu = true;

          } else {
            _this.$Message.error(res.data.message)
          }
        })
      },

      // 退出
      returnUser(i) {
        this.Axios.post('/logout').then(res => {
        });
        this.$router.push('/');
      },

      // 已选中菜单防刷新
      Menu(i) {
        sessionStorage.setItem('Menu', i)
      },
    },
    mounted() {
      this.getMenu()
    }
  }
</script>
