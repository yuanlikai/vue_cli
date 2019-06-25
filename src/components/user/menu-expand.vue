<style scoped>
  .expand-row {
    margin-bottom: 16px;
  }
</style>
<template>
  <div>
    <Table border :columns="columns1" :data="data1" size="small"></Table>
  </div>
</template>
<script>
  export default {
    props: ['row', 'getMenu', 'getChild'],
    data() {
      return {
        columns1: [
          {
            type: 'index',
            align: 'center',
            width: 50,
          },
          {
            title: '菜单名称',
            key: 'menuName'
          },
          {
            title: '菜单类型',
            key: 'numb',
            render: (h, params) => {
              return h('p', params.row.menuType.name)
            }
          },
          {
            title: '地址',
            key: 'menuUrl',
          },
          {
            title: '唯一标识',
            key: 'numb',
          },
          {
            title: '操作',
            width: 90,
            align: 'center',
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
                      this.getChild({
                        id: params.row.id,
                        numb: params.row.numb,
                        menuUrl: params.row.menuUrl,
                        menuName: params.row.menuName
                      })

                    }
                  }
                }),
                h('Poptip', {
                  props: {
                    confirm: true,
                    transfer: true,
                    placement: "top",
                    title: '确定删除该角色？',
                  },
                  on: {
                    'on-ok': () => {
                      const _this = this;
                      _this.Axios.post('/Manage/Menu/deleteMenus', _this.Qs.stringify({
                        id: params.row.id
                      }, {indices: false})).then(res => {
                        if (res.data.code === 0) {
                          _this.data1.splice(params.row._index, 1);
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
        data1: this.row.reverse()
      }
    },
    methods: {},
    mounted() {
    }
  };
</script>
