<template>
  <div class="hello">
    <button @click="getData">click!</button>
  </div>
</template>

<script>
  export default {
    name: 'HelloWorld',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App'
      }
    },
    methods: {
      getData(){
        let v=this;
        v.Axios.post('http://localhost:3000/index/index',v.Qs.stringify({
          ID:'1'
        })).then(function(res){
            console.log(res.data)
        }).catch(function(err){
          console.log(err)
        })
      }
    },
    mounted() {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
