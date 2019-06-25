<template>
  <div class="content">
    <div class="demo-upload-list" v-for="item in uploadList">
      <template v-if="item.status === 'finished'">
        <img :src="item.url+'?x-oss-process=image/resize,m_pad,h_60,w_60'">
        <div class="demo-upload-list-cover">
          <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
          <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
        </div>
      </template>
      <template v-else>
        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
      </template>
    </div>
    <Upload
      ref="upload"
      :show-upload-list="false"
      :default-file-list="defaultList"
      :on-success="handleSuccess"
      accept="image/jpg,image/jpeg,image/png"
      :max-size="10240"
      :on-format-error="handleFormatError"
      :on-exceeded-size="handleMaxSize"
      :before-upload="handleBeforeUpload"
      multiple
      type="drag"
      action="/CommonController/Upload/Upload2OSS.json"
      style="display: inline-block;width:58px;">
      <div style="width: 58px;height:58px;line-height: 58px;">
        <Icon type="ios-camera" size="20"></Icon>
      </div>
    </Upload>
    <Modal title="View Image" v-model="visible" width="325" style="text-align: center;width: 325px">
      <img :src="imgName" v-if="visible" style="max-width: 100%">
    </Modal>
  </div>
</template>
<script>
  export default {
    props: ['num'],
    data() {
      return {
        defaultList: [],
        imgName: '',
        visible: false,
        uploadList: []
      }
    },
    methods: {
      handleView(name) {
        this.imgName = name;
        this.visible = true;
      },
      handleRemove(file) {
        const fileList = this.$refs.upload.fileList;
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      },
      handleRemove1(file) {
        const fileList = this.$refs.upload.fileList;
        this.$refs.upload.fileList.splice(0, this.num);
      },
      handleSuccess(res, file) {
        console.log(file)
        file.url = file.response.data[0];
        file.name = '7eb99afb9d5f317c912f08b5212fd69a';
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: 'The file format is incorrect',
          desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
        });
      },
      handleMaxSize(file) {
        this.$Notice.warning({
          title: 'Exceeding file size limit',
          desc: 'File  ' + file.name + ' is too large, no more than 10M.'
        });
      },
      handleBeforeUpload() {
        const check = this.uploadList.length < this.num;
        if (!check) {
          this.$Notice.warning({
            title: '最多只能上传' + this.num + '张'
          });
        }
        return check;
      },
      ploadLi() {
        setTimeout(() => {
          this.uploadList = this.$refs.upload.fileList;
        }, 100)
      },
      resetList(){
        setTimeout(()=>{
          this.uploadList = this.$refs.upload.fileList;
        },10)
      }
    },
    mounted() {
      this.uploadList = this.$refs.upload.fileList;
    }
  }
</script>
<style>
  .demo-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .demo-upload-list img {
    width: 100%;
  }

  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }

  .demo-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
